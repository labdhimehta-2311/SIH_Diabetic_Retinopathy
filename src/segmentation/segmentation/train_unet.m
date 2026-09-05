%% train_unet.m
% M3 - Multiclass Diabetic Retinopathy Segmentation
% CPU training test: 5 epochs
%
% Classes:
%   0   Background
%   1   Microaneurysms
%   2   Haemorrhages
%   3   Hard Exudates
%   4   Soft Exudates
%   5   Optic Disc
%   255 Ignore / ambiguous overlap

clear;
clc;
close all;

fprintf('\n');
fprintf('============================================================\n');
fprintf('        M3 MULTICLASS U-NET TRAINING - 5 EPOCH TEST\n');
fprintf('============================================================\n');

%% ------------------------------------------------------------
% 1. SETTINGS
% -------------------------------------------------------------

numEpochs = 5;
miniBatchSize = 1;
initialLearnRate = 1e-4;

inputSize = [512 512 3];
numClasses = 6;

% CPU ONLY
useGPU = false;

fprintf('\nTraining device: CPU\n');
fprintf('Number of epochs: %d\n', numEpochs);
fprintf('Mini-batch size: %d\n', miniBatchSize);
fprintf('Learning rate: %.6f\n', initialLearnRate);

%% ------------------------------------------------------------
% 2. PROJECT PATHS
% -------------------------------------------------------------

projectRoot = pwd;

datasetDir = fullfile(projectRoot, ...
    'src', 'segmentation', 'datasets');

imageDir = fullfile(datasetDir, ...
    'multiclass_images');

maskDir = fullfile(datasetDir, ...
    'multiclass_masks');

splitFile = fullfile(datasetDir, ...
    'dataset_split.mat');

modelDir = fullfile(projectRoot, ...
    'src', 'segmentation', 'trained_models');

if ~exist(modelDir, 'dir')
    mkdir(modelDir);
end

fprintf('\nDataset directory:\n%s\n', datasetDir);

%% ------------------------------------------------------------
% 3. LOAD DATASET SPLIT
% -------------------------------------------------------------

if ~isfile(splitFile)
    error('dataset_split.mat was not found:\n%s', splitFile);
end

S = load(splitFile);

trainingIDs = S.trainingIDs;
validationIDs = S.validationIDs;

fprintf('\nDataset split:\n');
fprintf('Training images:   %d\n', numel(trainingIDs));
fprintf('Validation images: %d\n', numel(validationIDs));

%% ------------------------------------------------------------
% 4. LOAD TRAINING AND VALIDATION DATA
% -------------------------------------------------------------

fprintf('\nLoading training data...\n');

XTrain = cell(numel(trainingIDs), 1);
YTrain = cell(numel(trainingIDs), 1);

for i = 1:numel(trainingIDs)

    imageID = trainingIDs{i};

    imageFile = fullfile(imageDir, ...
        [imageID '.png']);

    maskFile = fullfile(maskDir, ...
        [imageID '.png']);

    if ~isfile(imageFile)
        error('Training image not found: %s', imageFile);
    end

    if ~isfile(maskFile)
        error('Training mask not found: %s', maskFile);
    end

    I = imread(imageFile);
    M = imread(maskFile);

    I = im2single(I);
    M = uint8(M);

    if ~isequal(size(I), [512 512 3])
        error('Unexpected image size for %s', imageID);
    end

    if ~isequal(size(M), [512 512])
        error('Unexpected mask size for %s', imageID);
    end

    XTrain{i} = I;
    YTrain{i} = M;

    fprintf('  Loaded training image %2d/%2d: %s\n', ...
        i, numel(trainingIDs), imageID);
end

fprintf('\nLoading validation data...\n');

XVal = cell(numel(validationIDs), 1);
YVal = cell(numel(validationIDs), 1);

for i = 1:numel(validationIDs)

    imageID = validationIDs{i};

    imageFile = fullfile(imageDir, ...
        [imageID '.png']);

    maskFile = fullfile(maskDir, ...
        [imageID '.png']);

    if ~isfile(imageFile)
        error('Validation image not found: %s', imageFile);
    end

    if ~isfile(maskFile)
        error('Validation mask not found: %s', maskFile);
    end

    I = imread(imageFile);
    M = imread(maskFile);

    I = im2single(I);
    M = uint8(M);

    XVal{i} = I;
    YVal{i} = M;

    fprintf('  Loaded validation image %2d/%2d: %s\n', ...
        i, numel(validationIDs), imageID);
end

%% ------------------------------------------------------------
% 5. VERIFY LABELS
% -------------------------------------------------------------

fprintf('\n============================================================\n');
fprintf('                    LABEL VERIFICATION\n');
fprintf('============================================================\n');

allLabels = [];

for i = 1:numel(YTrain)
    allLabels = [allLabels; unique(YTrain{i}(:))]; %#ok<AGROW>
end

uniqueLabels = unique(allLabels);

fprintf('Labels found in training masks:\n');
disp(uniqueLabels');

expectedLabels = uint8([0 1 2 3 4 5 255]);

for k = 1:numel(expectedLabels)

    if ~ismember(expectedLabels(k), uniqueLabels)
        fprintf('Warning: label %d was not found in training set.\n', ...
            expectedLabels(k));
    end
end

%% ------------------------------------------------------------
% 6. CALCULATE CLASS WEIGHTS
% -------------------------------------------------------------

fprintf('\nCalculating class weights...\n');

pixelCounts = zeros(numClasses, 1);

for i = 1:numel(YTrain)

    M = YTrain{i};

    for classID = 0:(numClasses - 1)
        pixelCounts(classID + 1) = ...
            pixelCounts(classID + 1) + ...
            nnz(M == classID);
    end
end

fprintf('\nPixel counts:\n');

classNames = {
    'Background'
    'Microaneurysms'
    'Haemorrhages'
    'Hard Exudates'
    'Soft Exudates'
    'Optic Disc'
    };

for c = 1:numClasses
    fprintf('  %-18s : %d\n', ...
        classNames{c}, pixelCounts(c));
end

% Inverse square-root frequency weighting.
% This gives rare classes more importance without
% producing excessively large weights.

frequencies = pixelCounts ./ sum(pixelCounts);

classWeights = 1 ./ sqrt(frequencies + eps);

classWeights = classWeights ./ mean(classWeights);

fprintf('\nClass weights:\n');

for c = 1:numClasses
    fprintf('  %-18s : %.4f\n', ...
        classNames{c}, classWeights(c));
end

%% ------------------------------------------------------------
% 7. LOAD INITIAL U-NET
% -------------------------------------------------------------

initialModelFile = fullfile(modelDir, ...
    'unet_multiclass_initial.mat');

if isfile(initialModelFile)

    fprintf('\nLoading initial U-Net...\n');

    S = load(initialModelFile);

    if ~isfield(S, 'net')
        error('The initial model file does not contain variable "net".');
    end

    net = S.net;

else

    fprintf('\nInitial model not found.\n');
    fprintf('Building a new U-Net...\n');

    net = build_unet(inputSize, numClasses);

end

fprintf('\nNetwork summary:\n');
summary(net);

%% ------------------------------------------------------------
% 8. INITIALIZE TRAINING VARIABLES
% -------------------------------------------------------------

averageGrad = [];
averageSqGrad = [];

iteration = 0;

trainingLossHistory = zeros(numEpochs, 1);
validationLossHistory = zeros(numEpochs, 1);

bestValidationLoss = inf;

bestModelFile = fullfile(modelDir, ...
    'unet_multiclass_best.mat');

finalModelFile = fullfile(modelDir, ...
    'unet_multiclass_final.mat');

%% ------------------------------------------------------------
% 9. TRAINING LOOP
% -------------------------------------------------------------

fprintf('\n');
fprintf('============================================================\n');
fprintf('                    STARTING TRAINING\n');
fprintf('============================================================\n');

trainingStartTime = tic;

for epoch = 1:numEpochs

    epochStartTime = tic;

    fprintf('\n');
    fprintf('------------------------------------------------------------\n');
    fprintf('EPOCH %d / %d\n', epoch, numEpochs);
    fprintf('------------------------------------------------------------\n');

    % Randomize training order
    order = randperm(numel(XTrain));

    epochLoss = 0;

    for batchStart = 1:miniBatchSize:numel(order)

        batchEnd = min( ...
            batchStart + miniBatchSize - 1, ...
            numel(order));

        batchIndices = order(batchStart:batchEnd);

        % Currently miniBatchSize = 1.
        % The code is kept structured for future expansion.

        imageIndex = batchIndices(1);

        I = XTrain{imageIndex};
        M = YTrain{imageIndex};

        %% Convert image to dlarray

        X = reshape(I, [512 512 3 1]);

        dlX = dlarray(X, 'SSCB');

        %% Convert mask to one-hot representation

        targetOneHot = zeros(512, 512, numClasses, 1, ...
            'single');

        validMask = zeros(512, 512, 1, 1, ...
            'single');

        for classID = 0:(numClasses - 1)

            targetOneHot(:, :, classID + 1, 1) = ...
                single(M == classID);

        end

        % Ignore label 255
        validMask(:, :, 1, 1) = single(M ~= 255);

        dlTarget = dlarray(targetOneHot, 'SSCB');
        dlValid = dlarray(validMask, 'SSCB');

        %% Calculate gradients

        [loss, gradients] = dlfeval( ...
            @modelLoss, ...
            net, ...
            dlX, ...
            dlTarget, ...
            dlValid, ...
            classWeights);

        %% Update network

        iteration = iteration + 1;

        [net, averageGrad, averageSqGrad] = adamupdate( ...
            net, ...
            gradients, ...
            averageGrad, ...
            averageSqGrad, ...
            iteration, ...
            initialLearnRate);

        lossValue = double(extractdata(loss));

        epochLoss = epochLoss + lossValue;

        fprintf('  Image %2d/%2d | Loss: %.5f\n', ...
            batchStart, ...
            numel(XTrain), ...
            lossValue);

    end

    %% Average training loss

    trainingLoss = epochLoss / numel(XTrain);

    trainingLossHistory(epoch) = trainingLoss;

    %% --------------------------------------------------------
    % VALIDATION
    % ---------------------------------------------------------

    validationLoss = 0;

    for i = 1:numel(XVal)

        I = XVal{i};
        M = YVal{i};

        X = reshape(I, [512 512 3 1]);

        dlX = dlarray(X, 'SSCB');

        targetOneHot = zeros(512, 512, numClasses, 1, ...
            'single');

        validMask = zeros(512, 512, 1, 1, ...
            'single');

        for classID = 0:(numClasses - 1)

            targetOneHot(:, :, classID + 1, 1) = ...
                single(M == classID);

        end

        validMask(:, :, 1, 1) = single(M ~= 255);

        dlTarget = dlarray(targetOneHot, 'SSCB');
        dlValid = dlarray(validMask, 'SSCB');

        dlYPred = forward(net, dlX);

        valLoss = segmentationLoss( ...
            dlYPred, ...
            dlTarget, ...
            dlValid, ...
            classWeights);

        validationLoss = validationLoss + ...
            double(extractdata(valLoss));
    end

    validationLoss = ...
        validationLoss / numel(XVal);

    validationLossHistory(epoch) = validationLoss;

    epochTime = toc(epochStartTime);

    %% --------------------------------------------------------
    % EPOCH SUMMARY
    % ---------------------------------------------------------

    fprintf('\n');
    fprintf('EPOCH %d COMPLETE\n', epoch);
    fprintf('Training Loss:   %.6f\n', trainingLoss);
    fprintf('Validation Loss: %.6f\n', validationLoss);
    fprintf('Epoch Time:      %.2f minutes\n', epochTime / 60);

    %% Save best model

    if validationLoss < bestValidationLoss

        bestValidationLoss = validationLoss;

        save(bestModelFile, ...
            'net', ...
            'classWeights', ...
            'trainingIDs', ...
            'validationIDs', ...
            'trainingLossHistory', ...
            'validationLossHistory', ...
            '-v7.3');

        fprintf('*** New BEST model saved. ***\n');

    end

end

totalTrainingTime = toc(trainingStartTime);

%% ------------------------------------------------------------
% 10. SAVE FINAL MODEL
% -------------------------------------------------------------

save(finalModelFile, ...
    'net', ...
    'classWeights', ...
    'trainingIDs', ...
    'validationIDs', ...
    'trainingLossHistory', ...
    'validationLossHistory', ...
    '-v7.3');

%% ------------------------------------------------------------
% 11. DISPLAY FINAL RESULTS
% -------------------------------------------------------------

fprintf('\n');
fprintf('============================================================\n');
fprintf('                    TRAINING COMPLETE\n');
fprintf('============================================================\n');

fprintf('Total training time: %.2f minutes\n', ...
    totalTrainingTime / 60);

fprintf('Final training loss: %.6f\n', ...
    trainingLossHistory(end));

fprintf('Final validation loss: %.6f\n', ...
    validationLossHistory(end));

fprintf('Best validation loss: %.6f\n', ...
    bestValidationLoss);

fprintf('\nBest model:\n%s\n', bestModelFile);

fprintf('\nFinal model:\n%s\n', finalModelFile);

%% ------------------------------------------------------------
% 12. TRAINING HISTORY PLOT
% -------------------------------------------------------------

figure;

plot(1:numEpochs, ...
    trainingLossHistory, ...
    '-o', ...
    'LineWidth', 1.5);

hold on;

plot(1:numEpochs, ...
    validationLossHistory, ...
    '-s', ...
    'LineWidth', 1.5);

grid on;

xlabel('Epoch');
ylabel('Loss');

title('Multiclass U-Net Training History');

legend( ...
    'Training Loss', ...
    'Validation Loss', ...
    'Location', ...
    'best');

%% ------------------------------------------------------------
% LOCAL LOSS FUNCTION
% -------------------------------------------------------------

function [loss, gradients] = modelLoss( ...
    net, ...
    dlX, ...
    dlTarget, ...
    dlValid, ...
    classWeights)

    dlYPred = forward(net, dlX);

    loss = segmentationLoss( ...
        dlYPred, ...
        dlTarget, ...
        dlValid, ...
        classWeights);

    gradients = dlgradient(loss, net.Learnables);

end

%% ------------------------------------------------------------
% SEGMENTATION LOSS
% -------------------------------------------------------------

function loss = segmentationLoss( ...
    dlYPred, ...
    dlTarget, ...
    dlValid, ...
    classWeights)

    epsilon = 1e-7;

    %% Weighted cross-entropy

    probabilities = dlYPred + epsilon;

    % Convert weights to 1x1x6x1
    weights = reshape( ...
        single(classWeights), ...
        [1 1 6 1]);

    % Weighted cross entropy per pixel
    cePerPixel = -sum( ...
        dlTarget .* log(probabilities) .* weights, ...
        3);

    % Apply ignore mask
    ceMasked = cePerPixel .* dlValid;

    totalValid = sum(dlValid, 'all');

    crossEntropyLoss = ...
        sum(ceMasked, 'all') ./ (totalValid + epsilon);

    %% Soft Dice loss

    diceLoss = 0;

    % Evaluate lesion/structure classes only.
    % Background is excluded from Dice because it dominates
    % the image.

    numberDiceClasses = 5;

    for classIndex = 2:6

        predictionClass = ...
            dlYPred(:, :, classIndex, :) .* dlValid;

        targetClass = ...
            dlTarget(:, :, classIndex, :) .* dlValid;

        intersection = sum( ...
            predictionClass .* targetClass, ...
            'all');

        predictionSum = sum( ...
            predictionClass, ...
            'all');

        targetSum = sum( ...
            targetClass, ...
            'all');

        diceScore = ...
            (2 * intersection + 1) ./ ...
            (predictionSum + targetSum + 1);

        diceLoss = diceLoss + ...
            (1 - diceScore);
    end

    diceLoss = diceLoss / numberDiceClasses;

    %% Combined loss

    loss = ...
        0.7 * crossEntropyLoss + ...
        0.3 * diceLoss;

end