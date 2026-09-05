%% train_unet_improved.m
% M3 - Improved Multiclass U-Net Training
% Stronger foreground Dice emphasis
%
% Classes:
% 0 Background
% 1 Microaneurysms
% 2 Haemorrhages
% 3 Hard Exudates
% 4 Soft Exudates
% 5 Optic Disc
% 255 Ignore / ambiguous overlap

clear;
clc;
close all;

fprintf('\n');
fprintf('============================================================\n');
fprintf('      M3 IMPROVED MULTICLASS U-NET TRAINING\n');
fprintf('============================================================\n');

%% SETTINGS

numEpochs = 10;
miniBatchSize = 1;

initialLearnRate = 1e-4;

inputSize = [512 512 3];
numClasses = 6;

useGPU = false;

% Stronger foreground emphasis
crossEntropyWeight = 0.4;
diceWeight = 0.6;

%% PATHS

projectRoot = pwd;

datasetDir = fullfile( ...
    projectRoot, 'src', 'segmentation', 'datasets');

imageDir = fullfile( ...
    datasetDir, 'multiclass_images');

maskDir = fullfile( ...
    datasetDir, 'multiclass_masks');

splitFile = fullfile( ...
    datasetDir, 'dataset_split.mat');

modelDir = fullfile( ...
    projectRoot, 'src', 'segmentation', 'trained_models');

if ~exist(modelDir,'dir')
    mkdir(modelDir);
end

%% LOAD DATA SPLIT

fprintf('\nLoading dataset split...\n');

S = load(splitFile);

trainingIDs = S.trainingIDs;
validationIDs = S.validationIDs;

fprintf('Training images   : %d\n', numel(trainingIDs));
fprintf('Validation images : %d\n', numel(validationIDs));

%% LOAD INITIAL U-NET

initialModelFile = fullfile( ...
    modelDir, 'unet_multiclass_initial.mat');

fprintf('\nLoading initial U-Net...\n');

load(initialModelFile,'net');

fprintf('Initial model loaded.\n');

%% CALCULATE CLASS WEIGHTS

fprintf('\nCalculating class weights...\n');

pixelCounts = zeros(numClasses,1);

for i = 1:numel(trainingIDs)

    maskFile = fullfile( ...
        maskDir, [trainingIDs{i} '.png']);

    M = imread(maskFile);

    for classID = 0:5

        pixelCounts(classID+1) = ...
            pixelCounts(classID+1) + ...
            nnz(M == classID);

    end
end

frequencies = pixelCounts ./ sum(pixelCounts);

classWeights = 1 ./ sqrt(frequencies + eps);

classWeights = classWeights ./ mean(classWeights);

fprintf('\nPixel counts:\n');
disp(pixelCounts);

fprintf('Class weights:\n');
disp(classWeights);

%% ADAM PARAMETERS

trailingAvg = [];
trailingAvgSq = [];

iteration = 0;

trainingLossHistory = zeros(numEpochs,1);
validationLossHistory = zeros(numEpochs,1);

bestValidationLoss = inf;

bestModelFile = fullfile( ...
    modelDir, 'unet_multiclass_improved_best.mat');

finalModelFile = fullfile( ...
    modelDir, 'unet_multiclass_improved_final.mat');

%% TRAINING LOOP

fprintf('\n');
fprintf('============================================================\n');
fprintf('STARTING TRAINING\n');
fprintf('Epochs              : %d\n',numEpochs);
fprintf('Mini-batch size     : %d\n',miniBatchSize);
fprintf('Learning rate       : %.1e\n',initialLearnRate);
fprintf('CE weight           : %.2f\n',crossEntropyWeight);
fprintf('Dice weight         : %.2f\n',diceWeight);
fprintf('============================================================\n');

for epoch = 1:numEpochs

    fprintf('\n');
    fprintf('---------------- EPOCH %d / %d ----------------\n', ...
        epoch,numEpochs);

    %% TRAINING

    epochLoss = 0;

    order = randperm(numel(trainingIDs));

    for k = 1:numel(order)

        idx = order(k);

        imageID = trainingIDs{idx};

        imageFile = fullfile( ...
            imageDir,[imageID '.png']);

        maskFile = fullfile( ...
            maskDir,[imageID '.png']);

        I = imread(imageFile);
        M = imread(maskFile);

        I = im2single(I);

        if size(I,3) == 1
            I = repmat(I,1,1,3);
        end

        % One-hot target
        target = zeros( ...
            inputSize(1), ...
            inputSize(2), ...
            numClasses, ...
            'single');

        validMask = single(M ~= 255);

        for classID = 0:5

            target(:,:,classID+1) = ...
                single(M == classID);

        end

        dlX = dlarray( ...
            reshape(I,inputSize(1),inputSize(2),3,1), ...
            'SSCB');

        dlT = dlarray( ...
            reshape(target,inputSize(1),inputSize(2), ...
            numClasses,1), ...
            'SSCB');

        dlValid = dlarray( ...
            reshape(validMask,inputSize(1), ...
            inputSize(2),1,1), ...
            'SSCB');

        %% FORWARD + LOSS

        [loss,gradients] = dlfeval( ...
            @modelLoss, ...
            net, ...
            dlX, ...
            dlT, ...
            dlValid, ...
            classWeights, ...
            crossEntropyWeight, ...
            diceWeight);

        %% ADAM UPDATE

        iteration = iteration + 1;

        [net,trailingAvg,trailingAvgSq] = ...
            adamupdate( ...
            net, ...
            gradients, ...
            trailingAvg, ...
            trailingAvgSq, ...
            iteration, ...
            initialLearnRate);

        currentLoss = double(gather(extractdata(loss)));

        epochLoss = epochLoss + currentLoss;

        fprintf('\rTraining image %d/%d | Loss %.4f', ...
            k,numel(order),currentLoss);

    end

    epochLoss = epochLoss / numel(trainingIDs);

    trainingLossHistory(epoch) = epochLoss;

    fprintf('\nTraining loss: %.6f\n',epochLoss);

    %% VALIDATION

    validationLoss = 0;

    for v = 1:numel(validationIDs)

        imageID = validationIDs{v};

        imageFile = fullfile( ...
            imageDir,[imageID '.png']);

        maskFile = fullfile( ...
            maskDir,[imageID '.png']);

        I = imread(imageFile);
        M = imread(maskFile);

        I = im2single(I);

        if size(I,3) == 1
            I = repmat(I,1,1,3);
        end

        target = zeros( ...
            inputSize(1), ...
            inputSize(2), ...
            numClasses, ...
            'single');

        validMask = single(M ~= 255);

        for classID = 0:5

            target(:,:,classID+1) = ...
                single(M == classID);

        end

        dlX = dlarray( ...
            reshape(I,inputSize(1),inputSize(2),3,1), ...
            'SSCB');

        dlT = dlarray( ...
            reshape(target,inputSize(1),inputSize(2), ...
            numClasses,1), ...
            'SSCB');

        dlValid = dlarray( ...
            reshape(validMask,inputSize(1), ...
            inputSize(2),1,1), ...
            'SSCB');

        loss = dlfeval( ...
            @modelLoss, ...
            net, ...
            dlX, ...
            dlT, ...
            dlValid, ...
            classWeights, ...
            crossEntropyWeight, ...
            diceWeight);

        validationLoss = validationLoss + ...
            double(gather(extractdata(loss)));

    end

    validationLoss = ...
        validationLoss / numel(validationIDs);

    validationLossHistory(epoch) = validationLoss;

    fprintf('Validation loss: %.6f\n', ...
        validationLoss);

    %% SAVE BEST MODEL

    if validationLoss < bestValidationLoss

        bestValidationLoss = validationLoss;

        save(bestModelFile, ...
            'net', ...
            'trainingIDs', ...
            'validationIDs', ...
            'trainingLossHistory', ...
            'validationLossHistory', ...
            'classWeights', ...
            '-v7.3');

        fprintf('*** New best model saved. ***\n');

    end

end

%% SAVE FINAL MODEL

save(finalModelFile, ...
    'net', ...
    'trainingIDs', ...
    'validationIDs', ...
    'trainingLossHistory', ...
    'validationLossHistory', ...
    'classWeights', ...
    '-v7.3');

fprintf('\nFinal improved model saved:\n');
fprintf('%s\n',finalModelFile);

%% TRAINING GRAPH

figure;

plot(1:numEpochs,trainingLossHistory,'-o');
hold on;
plot(1:numEpochs,validationLossHistory,'-o');

xlabel('Epoch');
ylabel('Loss');

title('Improved U-Net Training');

legend('Training Loss','Validation Loss');

grid on;

%% LOSS FUNCTION

function [loss,gradients] = modelLoss( ...
    net, ...
    dlX, ...
    dlTarget, ...
    dlValid, ...
    classWeights, ...
    ceWeight, ...
    diceWeight)

    %% NETWORK PREDICTION

    dlYPred = forward(net,dlX);

    %% WEIGHTED CROSS ENTROPY

    epsilon = 1e-7;

    logPred = log(dlYPred + epsilon);

    weightedTarget = dlTarget;

    for c = 1:6

        weightedTarget(:,:,c,:) = ...
            weightedTarget(:,:,c,:) .* ...
            classWeights(c);

    end

    pixelLoss = -sum( ...
        weightedTarget .* logPred,3);

    pixelLoss = pixelLoss .* dlValid;

    crossEntropyLoss = ...
        sum(pixelLoss,'all') / ...
        (sum(dlValid,'all') + epsilon);

    %% FOREGROUND DICE LOSS

    diceLoss = dlarray(0);

    for classIndex = 2:6

        predictionClass = ...
            dlYPred(:,:,classIndex,:) .* dlValid;

        targetClass = ...
            dlTarget(:,:,classIndex,:) .* dlValid;

        intersection = sum( ...
            predictionClass .* targetClass,'all');

        predictionSum = sum( ...
            predictionClass,'all');

        targetSum = sum( ...
            targetClass,'all');

        diceScore = ...
            (2*intersection + 1) ./ ...
            (predictionSum + targetSum + 1);

        diceLoss = diceLoss + ...
            (1 - diceScore);

    end

    diceLoss = diceLoss / 5;

    %% COMBINED LOSS

    loss = ...
        ceWeight * crossEntropyLoss + ...
        diceWeight * diceLoss;

    gradients = dlgradient(loss,net.Learnables);

end