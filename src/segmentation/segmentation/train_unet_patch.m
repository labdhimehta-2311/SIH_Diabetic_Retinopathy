function train_unet_patch()
% TRAIN_UNET_PATCH
% M3 Round-2A: Patch-based multiclass U-Net training
%
% Purpose:
%   Train the same 6-class U-Net using 512x512 patches extracted
%   directly from the original 2848x4288 IDRiD images.
%
% Classes:
%   0 = Background
%   1 = Microaneurysms
%   2 = Haemorrhages
%   3 = Hard Exudates
%   4 = Soft Exudates
%   5 = Optic Disc
% 255 = Ignore / ambiguous overlap
%
% Round-2A settings:
%   Patch size       = 512 x 512
%   Stride           = 512
%   Epochs           = 5
%   Batch size       = 1
%   Learning rate    = 1e-4
%   Optimizer        = Adam
%   GPU              = OFF / CPU
%
% Important:
%   This version is designed to work on both Windows and macOS.
%   No hard-coded Windows paths are used.

clc;

fprintf('\n');
fprintf('===============================================================\n');
fprintf('       M3 ROUND-2A: PATCH-BASED U-NET TRAINING\n');
fprintf('===============================================================\n\n');

%% ===============================================================
% 1. FIND PROJECT ROOT
% ================================================================

% File location:
%
% SIH_Diabetic_Retinopathy
%   -> src
%      -> segmentation
%         -> segmentation
%            -> train_unet_patch.m
%
% Therefore we go up four folders.

thisFile = mfilename('fullpath');

projectRoot = fileparts( ...
                fileparts( ...
                fileparts( ...
                fileparts(thisFile))));

fprintf('[M3-R2A] Project root:\n%s\n\n', projectRoot);

%% ===============================================================
% 2. DATASET PATHS
% ===============================================================

% Dataset is beside the project folder:
%
% Segmentation_Project
%   |
%   |-- A. Segmentation
%   |
%   |-- SIH_Diabetic_Retinopathy

datasetRoot = fullfile(projectRoot, '..', 'A. Segmentation');

originalTrainDir = fullfile( ...
    datasetRoot, ...
    '1. Original Images', ...
    'a. Training Set');

groundTruthTrainDir = fullfile( ...
    datasetRoot, ...
    '2. All Segmentation Groundtruths', ...
    'a. Training Set');

%% ===============================================================
% 3. OUTPUT PATHS
% ===============================================================

modelDir = fullfile( ...
    projectRoot, ...
    'src', ...
    'segmentation', ...
    'trained_models');

outputDir = fullfile( ...
    projectRoot, ...
    'src', ...
    'segmentation', ...
    'outputs');

if ~isfolder(modelDir)
    mkdir(modelDir);
end

if ~isfolder(outputDir)
    mkdir(outputDir);
end

%% ===============================================================
% 4. CHECK DATASET
% ===============================================================

if ~isfolder(originalTrainDir)

    error(['Original training image folder was not found:\n' ...
           '%s\n\n' ...
           'Make sure the IDRiD dataset is located beside ' ...
           'the project folder.'], ...
           originalTrainDir);

end

if ~isfolder(groundTruthTrainDir)

    error(['Ground-truth training folder was not found:\n' ...
           '%s'], ...
           groundTruthTrainDir);

end

fprintf('[M3-R2A] Original images: AVAILABLE\n');
fprintf('[M3-R2A] Ground-truth masks: AVAILABLE\n\n');

%% ===============================================================
% 5. PARAMETERS
% ===============================================================

patchSize = 512;
stride = 512;

numClasses = 6;

numEpochs = 5;

miniBatchSize = 1;

initialLearnRate = 1e-4;

useGPU = false;

fprintf('[M3-R2A] Parameters\n');
fprintf('Patch size       : %d x %d\n', patchSize, patchSize);
fprintf('Stride           : %d\n', stride);
fprintf('Number of classes: %d\n', numClasses);
fprintf('Epochs           : %d\n', numEpochs);
fprintf('Mini-batch size  : %d\n', miniBatchSize);
fprintf('Learning rate    : %.1e\n', initialLearnRate);
fprintf('GPU              : %d\n\n', useGPU);

%% ===============================================================
% 6. DATASET SPLIT
% ===============================================================

% These are the 26 training images for which all five masks exist.

completeIDs = [ ...
     3  8 13 14 17 18 19 22 23 25 ...
    30 31 32 33 35 38 39 46 47 48 ...
    49 50 51 52 53 54];

% Same split used in Round-1.

trainingIDs = [ ...
     3  8 13 14 22 23 25 31 32 33 ...
    35 38 39 46 47 48 49 51 52 53 54];

validationIDs = [17 18 19 30 50];

fprintf('[M3-R2A] Dataset split\n\n');

fprintf('Complete images : %d\n', numel(completeIDs));
fprintf('Training images : %d\n', numel(trainingIDs));
fprintf('Validation      : %d\n\n', numel(validationIDs));

%% ===============================================================
% 7. BUILD PATCH COORDINATES
% ===============================================================

fprintf('===============================================================\n');
fprintf('[M3-R2A] BUILDING HIGH-RESOLUTION PATCH LIST\n');
fprintf('===============================================================\n\n');

% We calculate the patch positions from the original image size.
%
% IDRiD image size:
% 2848 x 4288
%
% With 512x512 patches and stride 512:
% approximately 54 patches per image.

trainingPatchCount = 0;
validationPatchCount = 0;

% Get image size from first training image.

firstImagePath = fullfile( ...
    originalTrainDir, ...
    sprintf('IDRiD_%02d.jpg', trainingIDs(1)));

firstImage = imread(firstImagePath);

imageHeight = size(firstImage,1);
imageWidth  = size(firstImage,2);

fprintf('[M3-R2A] Original image size: %d x %d\n', ...
    imageHeight, imageWidth);

coords = buildPatchCoordinates( ...
    imageHeight, ...
    imageWidth, ...
    patchSize, ...
    stride);

patchesPerImage = size(coords,1);

trainingPatchCount = ...
    numel(trainingIDs) * patchesPerImage;

validationPatchCount = ...
    numel(validationIDs) * patchesPerImage;

fprintf('[M3-R2A] Patches per image     : %d\n', patchesPerImage);
fprintf('[M3-R2A] Training patches      : %d\n', trainingPatchCount);
fprintf('[M3-R2A] Validation patches    : %d\n\n', validationPatchCount);

%% ===============================================================
% 8. CALCULATE CLASS WEIGHTS
% ===============================================================

fprintf('===============================================================\n');
fprintf('[M3-R2A] CALCULATING CLASS WEIGHTS\n');
fprintf('===============================================================\n\n');

% Count pixels from the complete full-resolution masks.
%
% This avoids counting pixels multiple times just because a boundary
% patch overlaps another patch.

pixelCounts = zeros(1,numClasses);

for i = 1:numel(trainingIDs)

    id = trainingIDs(i);

    fprintf('[M3-R2A] Reading masks for IDRiD_%02d...\n', id);

    fullMask = readFullMulticlassMask( ...
        groundTruthTrainDir, ...
        id);

    % Ignore label 255 is not included in class counts.

    for c = 0:(numClasses-1)

        pixelCounts(c+1) = ...
            pixelCounts(c+1) + ...
            nnz(fullMask == c);

    end

end

fprintf('\n');

fprintf('Pixel counts:\n');

fprintf('Background           : %d\n', pixelCounts(1));
fprintf('Microaneurysms       : %d\n', pixelCounts(2));
fprintf('Haemorrhages         : %d\n', pixelCounts(3));
fprintf('Hard Exudates        : %d\n', pixelCounts(4));
fprintf('Soft Exudates        : %d\n', pixelCounts(5));
fprintf('Optic Disc           : %d\n\n', pixelCounts(6));

%% ===============================================================
% 9. CLASS WEIGHTS
% ===============================================================

% Inverse square-root frequency weighting.
%
% This reduces the effect of the enormous background class while
% preventing extremely large weights for tiny lesion classes.

frequencies = ...
    pixelCounts ./ sum(pixelCounts);

classWeights = ...
    1 ./ sqrt(frequencies + eps);

classWeights = ...
    classWeights ./ mean(classWeights);

fprintf('Class weights:\n\n');

fprintf('Background           : %.4f\n', classWeights(1));
fprintf('Microaneurysms       : %.4f\n', classWeights(2));
fprintf('Haemorrhages         : %.4f\n', classWeights(3));
fprintf('Hard Exudates        : %.4f\n', classWeights(4));
fprintf('Soft Exudates        : %.4f\n', classWeights(5));
fprintf('Optic Disc           : %.4f\n\n', classWeights(6));

%% ===============================================================
% 10. CHECK ADAM
% ===============================================================

if exist('adamupdate','file') ~= 2

    error(['adamupdate was not found.\n\n' ...
           'Deep Learning Toolbox with Adam optimizer support ' ...
           'is required for this training script.']);

end

%% ===============================================================
% 11. BUILD U-NET
% ===============================================================

fprintf('===============================================================\n');
fprintf('[M3-R2A] BUILDING U-NET\n');
fprintf('===============================================================\n\n');

% Use the existing Round-1 U-Net architecture.

net = build_unet();

fprintf('[M3-R2A] U-Net created successfully.\n\n');

%% ===============================================================
% 12. SAVE INITIAL MODEL
% ===============================================================

initialModelPath = fullfile( ...
    modelDir, ...
    'unet_multiclass_patch_initial.mat');

save(initialModelPath, ...
    'net', ...
    'classWeights', ...
    'trainingIDs', ...
    'validationIDs', ...
    '-v7.3');

fprintf('[M3-R2A] Initial patch model saved:\n%s\n\n', ...
    initialModelPath);

%% ===============================================================
% 13. INITIALIZE ADAM
% ===============================================================

averageGrad = [];
averageSqGrad = [];

iteration = 0;

trainingLossHistory = zeros(numEpochs,1);
validationLossHistory = zeros(numEpochs,1);

bestValidationLoss = inf;

bestNet = net;

%% ===============================================================
% 14. START TRAINING
% ===============================================================

fprintf('===============================================================\n');
fprintf('[M3-R2A] STARTING PATCH TRAINING\n');
fprintf('===============================================================\n\n');

trainingStart = tic;

for epoch = 1:numEpochs

    fprintf('\n');
    fprintf('---------------------------------------------------------------\n');
    fprintf('Epoch %d / %d\n', epoch, numEpochs);
    fprintf('---------------------------------------------------------------\n');

    epochStart = tic;

    epochLoss = 0;
    patchCounter = 0;

    % Randomize image order every epoch.

    imageOrder = randperm(numel(trainingIDs));

    %% -----------------------------------------------------------
    % TRAINING
    % ------------------------------------------------------------

    for imageIndex = imageOrder

        id = trainingIDs(imageIndex);

        fprintf('\n[M3-R2A] Loading training image IDRiD_%02d...\n', id);

        % Load image ONCE.

        img = readOriginalImage( ...
            originalTrainDir, ...
            id);

        % Load all masks ONCE.

        fullMask = readFullMulticlassMask( ...
            groundTruthTrainDir, ...
            id);

        % Randomize patches for this image.

        patchOrder = randperm(size(coords,1));

        for p = patchOrder

            row = coords(p,1);
            col = coords(p,2);

            % ----------------------------------------------------
            % Extract image patch
            % ----------------------------------------------------

            imagePatch = img( ...
                row:(row+patchSize-1), ...
                col:(col+patchSize-1), :);

            % ----------------------------------------------------
            % Extract mask patch
            % ----------------------------------------------------

            maskPatch = fullMask( ...
                row:(row+patchSize-1), ...
                col:(col+patchSize-1));

            % ----------------------------------------------------
            % Prepare network input
            % ----------------------------------------------------

            X = single(imagePatch) / 255;

            % ----------------------------------------------------
            % Calculate gradients
            % ----------------------------------------------------

            [loss, gradients] = dlfeval( ...
                @modelGradients, ...
                net, ...
                X, ...
                maskPatch, ...
                classWeights, ...
                numClasses);

            % ----------------------------------------------------
            % ADAM UPDATE
            % ----------------------------------------------------

            iteration = iteration + 1;

            [net, averageGrad, averageSqGrad] = ...
                adamupdate( ...
                    net, ...
                    gradients, ...
                    averageGrad, ...
                    averageSqGrad, ...
                    iteration, ...
                    initialLearnRate);

            % Convert scalar loss to double.

            lossValue = double(extractdata(loss));

            epochLoss = epochLoss + lossValue;

            patchCounter = patchCounter + 1;

            % ----------------------------------------------------
            % Progress display
            % ----------------------------------------------------

            if mod(patchCounter,50) == 0 || ...
                    patchCounter == 1

                elapsed = toc(trainingStart);

                currentRate = ...
                    elapsed / patchCounter;

                remainingPatches = ...
                    trainingPatchCount - patchCounter;

                estimatedRemaining = ...
                    currentRate * remainingPatches;

                fprintf( ...
                    '[M3-R2A] Epoch %d: patch %d / %d | Loss %.4f | ETA %.1f min\n', ...
                    epoch, ...
                    patchCounter, ...
                    trainingPatchCount, ...
                    lossValue, ...
                    estimatedRemaining/60);

            end

        end

    end

    %% -----------------------------------------------------------
    % AVERAGE TRAINING LOSS
    % ------------------------------------------------------------

    trainingLossHistory(epoch) = ...
        epochLoss / patchCounter;

    fprintf('\n');
    fprintf('[M3-R2A] Training loss: %.6f\n', ...
        trainingLossHistory(epoch));

    %% ===========================================================
    % VALIDATION
    % ===========================================================

    fprintf('\n');
    fprintf('[M3-R2A] Starting validation...\n');

    validationLoss = 0;
    validationPatchCounter = 0;

    for imageIndex = 1:numel(validationIDs)

        id = validationIDs(imageIndex);

        fprintf('[M3-R2A] Validating IDRiD_%02d...\n', id);

        % Load validation image once.

        img = readOriginalImage( ...
            originalTrainDir, ...
            id);

        % Load validation mask once.

        fullMask = readFullMulticlassMask( ...
            groundTruthTrainDir, ...
            id);

        for p = 1:size(coords,1)

            row = coords(p,1);
            col = coords(p,2);

            imagePatch = img( ...
                row:(row+patchSize-1), ...
                col:(col+patchSize-1), :);

            maskPatch = fullMask( ...
                row:(row+patchSize-1), ...
                col:(col+patchSize-1));

            X = single(imagePatch) / 255;

            % Forward pass only.

            dlX = dlarray(X,'SSCB');

            if useGPU
                dlX = gpuArray(dlX);
            end

            dlYPred = forward(net,dlX);

            loss = weightedCombinedLoss( ...
                dlYPred, ...
                maskPatch, ...
                classWeights, ...
                numClasses);

            validationLoss = ...
                validationLoss + ...
                double(extractdata(loss));

            validationPatchCounter = ...
                validationPatchCounter + 1;

        end

    end

    validationLossHistory(epoch) = ...
        validationLoss / validationPatchCounter;

    fprintf('\n');
    fprintf('[M3-R2A] Validation loss: %.6f\n', ...
        validationLossHistory(epoch));

    %% ===========================================================
    % SAVE BEST MODEL
    % ===========================================================

    if validationLossHistory(epoch) < bestValidationLoss

        bestValidationLoss = ...
            validationLossHistory(epoch);

        bestNet = net;

        % Save using variable name "net" because the M3 interface
        % expects the trained model to be stored as "net".

        netToSave = bestNet;

        bestModelPath = fullfile( ...
            modelDir, ...
            'unet_multiclass_patch_best.mat');

        save(bestModelPath, ...
            'netToSave', ...
            'classWeights', ...
            'trainingIDs', ...
            'validationIDs', ...
            'trainingLossHistory', ...
            'validationLossHistory', ...
            '-v7.3');

        % Rename variable inside MAT file to "net".

        net = bestNet;

        save(bestModelPath, ...
            'net', ...
            'classWeights', ...
            'trainingIDs', ...
            'validationIDs', ...
            'trainingLossHistory', ...
            'validationLossHistory', ...
            '-v7.3');

        fprintf('\n');
        fprintf('[M3-R2A] BEST MODEL UPDATED.\n');
        fprintf('[M3-R2A] Best validation loss: %.6f\n', ...
            bestValidationLoss);

    end

    %% ===========================================================
    % EPOCH SUMMARY
    % ===========================================================

    epochTime = toc(epochStart);

    fprintf('\n');
    fprintf('[M3-R2A] Epoch %d completed.\n', epoch);
    fprintf('[M3-R2A] Epoch time: %.2f minutes\n', ...
        epochTime/60);

    fprintf('[M3-R2A] Training loss   : %.6f\n', ...
        trainingLossHistory(epoch));

    fprintf('[M3-R2A] Validation loss : %.6f\n', ...
        validationLossHistory(epoch));

end

%% ===============================================================
% 15. SAVE FINAL MODEL
% ===============================================================

finalModelPath = fullfile( ...
    modelDir, ...
    'unet_multiclass_patch_final.mat');

net = net;

save(finalModelPath, ...
    'net', ...
    'classWeights', ...
    'trainingIDs', ...
    'validationIDs', ...
    'trainingLossHistory', ...
    'validationLossHistory', ...
    '-v7.3');

%% ===============================================================
% 16. SAVE TRAINING GRAPH
% ===============================================================

figure('Name','M3 R2A Patch Training Loss');

plot( ...
    1:numEpochs, ...
    trainingLossHistory, ...
    '-o', ...
    'LineWidth',1.5);

hold on;

plot( ...
    1:numEpochs, ...
    validationLossHistory, ...
    '-o', ...
    'LineWidth',1.5);

xlabel('Epoch');
ylabel('Loss');

title('M3 Round-2A Patch-Based U-Net Training');

legend( ...
    'Training Loss', ...
    'Validation Loss', ...
    'Location','best');

grid on;

trainingGraphPath = fullfile( ...
    outputDir, ...
    'r2a_patch_training_loss.png');

saveas(gcf,trainingGraphPath);

%% ===============================================================
% 17. FINAL SUMMARY
% ===============================================================

totalTime = toc(trainingStart);

fprintf('\n');
fprintf('===============================================================\n');
fprintf('       M3 ROUND-2A TRAINING COMPLETED SUCCESSFULLY\n');
fprintf('===============================================================\n\n');

fprintf('Training images       : %d\n',numel(trainingIDs));
fprintf('Validation images     : %d\n',numel(validationIDs));

fprintf('Patches per image     : %d\n',patchesPerImage);
fprintf('Training patches/epoch: %d\n',trainingPatchCount);
fprintf('Validation patches    : %d\n',validationPatchCount);

fprintf('\n');

fprintf('Best validation loss  : %.6f\n', ...
    bestValidationLoss);

fprintf('Total training time   : %.2f minutes\n', ...
    totalTime/60);

fprintf('\n');

fprintf('BEST MODEL:\n%s\n\n',bestModelPath);

fprintf('FINAL MODEL:\n%s\n\n',finalModelPath);

fprintf('TRAINING GRAPH:\n%s\n\n',trainingGraphPath);

fprintf('===============================================================\n');

end


%% =================================================================
% LOCAL FUNCTION: BUILD PATCH COORDINATES
% =================================================================

function coords = buildPatchCoordinates( ...
    imageHeight, ...
    imageWidth, ...
    patchSize, ...
    stride)

% Rows

rows = 1:stride:(imageHeight-patchSize+1);

lastRow = imageHeight-patchSize+1;

if rows(end) ~= lastRow
    rows = [rows lastRow];
end

% Columns

cols = 1:stride:(imageWidth-patchSize+1);

lastCol = imageWidth-patchSize+1;

if cols(end) ~= lastCol
    cols = [cols lastCol];
end

% Create all row/column combinations.

coords = zeros( ...
    numel(rows)*numel(cols), ...
    2);

counter = 1;

for r = 1:numel(rows)

    for c = 1:numel(cols)

        coords(counter,:) = ...
            [rows(r), cols(c)];

        counter = counter + 1;

    end

end

end


%% =================================================================
% LOCAL FUNCTION: READ ORIGINAL IMAGE
% =================================================================

function img = readOriginalImage( ...
    originalTrainDir, ...
    id)

imagePath = fullfile( ...
    originalTrainDir, ...
    sprintf('IDRiD_%02d.jpg',id));

if ~isfile(imagePath)

    error( ...
        'Training image not found:\n%s', ...
        imagePath);

end

img = imread(imagePath);

% Make sure image is RGB.

if ndims(img) == 2

    img = repmat(img,[1 1 3]);

end

% Make sure image has 3 channels.

if size(img,3) ~= 3

    error( ...
        'Unexpected number of image channels for IDRiD_%02d.', ...
        id);

end

end


%% =================================================================
% LOCAL FUNCTION: READ FULL MULTICLASS MASK
% =================================================================

function multiclassMask = readFullMulticlassMask( ...
    groundTruthTrainDir, ...
    id)

% Class folders and suffixes.

classFolders = {
    '1. Microaneurysms'
    '2. Haemorrhages'
    '3. Hard Exudates'
    '4. Soft Exudates'
    '5. Optic Disc'
    };

suffixes = {
    'MA'
    'HE'
    'EX'
    'SE'
    'OD'
    };

% Read first mask to determine size.

firstPath = fullfile( ...
    groundTruthTrainDir, ...
    classFolders{1}, ...
    sprintf('IDRiD_%02d_%s.tif',id,suffixes{1}));

if ~isfile(firstPath)

    error( ...
        'Missing Microaneurysm mask:\n%s', ...
        firstPath);

end

firstMask = imread(firstPath);

if ndims(firstMask) > 2
    firstMask = firstMask(:,:,1);
end

[H,W] = size(firstMask);

% Start with background.

multiclassMask = zeros(H,W,'uint8');

% Store each binary class mask.

allMasks = false(H,W,5);

for c = 1:5

    maskPath = fullfile( ...
        groundTruthTrainDir, ...
        classFolders{c}, ...
        sprintf('IDRiD_%02d_%s.tif',id,suffixes{c}));

    if ~isfile(maskPath)

        error( ...
            'Missing %s mask for IDRiD_%02d:\n%s', ...
            classFolders{c}, ...
            id, ...
            maskPath);

    end

    currentMask = imread(maskPath);

    if ndims(currentMask) > 2
        currentMask = currentMask(:,:,1);
    end

    allMasks(:,:,c) = currentMask > 0;

end

%% ---------------------------------------------------------------
% Count how many classes cover every pixel.
% ---------------------------------------------------------------

numberOfClassesAtPixel = ...
    sum(allMasks,3);

%% ---------------------------------------------------------------
% Assign unique class labels.
% ---------------------------------------------------------------

for c = 1:5

    uniquePixels = ...
        allMasks(:,:,c) & ...
        numberOfClassesAtPixel == 1;

    multiclassMask(uniquePixels) = uint8(c);

end

%% ---------------------------------------------------------------
% Overlapping pixels are ignored.
% ---------------------------------------------------------------

overlapPixels = ...
    numberOfClassesAtPixel > 1;

multiclassMask(overlapPixels) = uint8(255);

end


%% =================================================================
% LOCAL FUNCTION: MODEL GRADIENTS
% =================================================================

function [loss,gradients] = modelGradients( ...
    net, ...
    X, ...
    target, ...
    classWeights, ...
    numClasses)

% Convert image to dlarray.

dlX = dlarray(X,'SSCB');

% Forward pass.

dlYPred = forward(net,dlX);

% Combined weighted CE + foreground Dice.

loss = weightedCombinedLoss( ...
    dlYPred, ...
    target, ...
    classWeights, ...
    numClasses);

% Calculate gradients.

gradients = dlgradient( ...
    loss, ...
    net.Learnables);

end


%% =================================================================
% LOCAL FUNCTION: COMBINED LOSS
% =================================================================

function loss = weightedCombinedLoss( ...
    predictions, ...
    target, ...
    classWeights, ...
    numClasses)

% ---------------------------------------------------------------
% Weighted cross entropy
% ---------------------------------------------------------------

ceLoss = weightedCrossEntropy( ...
    predictions, ...
    target, ...
    classWeights, ...
    numClasses);

% ---------------------------------------------------------------
% Foreground Dice loss
% ---------------------------------------------------------------

diceLoss = foregroundDiceLoss( ...
    predictions, ...
    target, ...
    numClasses);

% ---------------------------------------------------------------
% Same general loss balance used for the improved Round-1 model:
%
% CE   = 40%
% Dice = 60%
% ---------------------------------------------------------------

loss = ...
    0.4 * ceLoss + ...
    0.6 * diceLoss;

end


%% =================================================================
% LOCAL FUNCTION: WEIGHTED CROSS ENTROPY
% =================================================================

function loss = weightedCrossEntropy( ...
    predictions, ...
    target, ...
    classWeights, ...
    numClasses)

% Valid pixels exclude label 255.

validMask = target ~= 255;

validMaskDL = ...
    dlarray(single(validMask),'SS');

totalLoss = dlarray(0);

validPixelCount = ...
    max(nnz(validMask),1);

for c = 1:numClasses

    % MATLAB class index c corresponds to target label c-1.

    classTarget = ...
        target == (c-1);

    classTargetDL = ...
        dlarray(single(classTarget),'SS');

    probability = ...
        predictions(:,:,c,1);

    % Prevent log(0).

    probability = ...
        probability + 1e-7;

    classLoss = ...
        -log(probability) .* ...
        classTargetDL .* ...
        validMaskDL;

    classLoss = ...
        sum(classLoss,'all');

    totalLoss = ...
        totalLoss + ...
        classWeights(c) * classLoss;

end

loss = ...
    totalLoss / validPixelCount;

end


%% =================================================================
% LOCAL FUNCTION: FOREGROUND DICE LOSS
% =================================================================

function loss = foregroundDiceLoss( ...
    predictions, ...
    target, ...
    numClasses)

diceValues = [];

validMask = target ~= 255;

validMaskDL = ...
    dlarray(single(validMask),'SS');

% Classes 1-5 are foreground.
% Background is intentionally excluded.

for c = 2:numClasses

    % MATLAB prediction channel c corresponds to:
    %
    % c=2 -> Microaneurysms
    % c=3 -> Haemorrhages
    % c=4 -> Hard Exudates
    % c=5 -> Soft Exudates
    % c=6 -> Optic Disc

    targetClass = ...
        target == (c-1);

    targetClassDL = ...
        dlarray(single(targetClass),'SS');

    probability = ...
        predictions(:,:,c,1);

    % Ignore ambiguous pixels.

    probability = ...
        probability .* validMaskDL;

    targetClassDL = ...
        targetClassDL .* validMaskDL;

    intersection = ...
        sum( ...
            probability .* targetClassDL, ...
            'all');

    denominator = ...
        sum(probability,'all') + ...
        sum(targetClassDL,'all');

    smooth = 1;

    dice = ...
        (2*intersection + smooth) / ...
        (denominator + smooth);

    diceValues = ...
        [diceValues; dice];

end

% Average foreground Dice.

meanDice = ...
    mean(diceValues);

loss = ...
    1 - meanDice;

end
