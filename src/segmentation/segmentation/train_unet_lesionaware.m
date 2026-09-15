function train_unet_lesionaware()
% TRAIN_UNET_LESIONAWARE
% M3 Round-3: Lesion-Aware Patch-Based Multiclass U-Net Training
%
% Purpose:
%   Train the M3 multiclass U-Net using high-resolution 512x512 patches
%   from the original IDRiD images.
%
% Main improvement over Round-2A:
%   Patches are sampled according to foreground/lesion density instead
%   of treating every patch equally.
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
% IMPORTANT:
%   This is a 2-EPOCH PILOT RUN.
%   Do NOT increase epochs until we inspect the result.

clc;

fprintf('\n');
fprintf('===============================================================\n');
fprintf('       M3 ROUND-3: LESION-AWARE PATCH TRAINING\n');
fprintf('===============================================================\n\n');

%% ===============================================================
% 1. FIND PROJECT ROOT
% ===============================================================

thisFile = mfilename('fullpath');

projectRoot = fileparts( ...
                fileparts( ...
                fileparts( ...
                fileparts(thisFile))));

fprintf('[M3-R3] Project root:\n%s\n\n', projectRoot);

%% ===============================================================
% 2. DATASET PATHS
% ===============================================================

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

    error( ...
        'Original training image folder not found:\n%s', ...
        originalTrainDir);

end

if ~isfolder(groundTruthTrainDir)

    error( ...
        'Ground-truth training folder not found:\n%s', ...
        groundTruthTrainDir);

end

fprintf('[M3-R3] Original images: AVAILABLE\n');
fprintf('[M3-R3] Ground-truth masks: AVAILABLE\n\n');

%% ===============================================================
% 5. PARAMETERS
% ===============================================================

patchSize = 512;

stride = 512;

numClasses = 6;

% ---------------------------------------------------------------
% PILOT RUN
% ---------------------------------------------------------------
% Only 2 epochs for now.
% We will inspect the result before doing a long training run.

numEpochs = 2;

miniBatchSize = 1;

initialLearnRate = 1e-4;

useGPU = false;

fprintf('[M3-R3] Parameters\n');
fprintf('Patch size       : %d x %d\n',patchSize,patchSize);
fprintf('Stride           : %d\n',stride);
fprintf('Classes          : %d\n',numClasses);
fprintf('Epochs           : %d  <-- PILOT\n',numEpochs);
fprintf('Batch size       : %d\n',miniBatchSize);
fprintf('Learning rate    : %.1e\n',initialLearnRate);
fprintf('GPU              : %d\n\n',useGPU);

%% ===============================================================
% 6. DATASET SPLIT
% ===============================================================

% Same 26 complete images used previously.

completeIDs = [ ...
     3 8 13 14 17 18 19 22 23 25 ...
    30 31 32 33 35 38 39 46 47 48 ...
    49 50 51 52 53 54];

% Same train/validation split as previous experiments.

trainingIDs = [ ...
     3 8 13 14 22 23 25 31 32 33 ...
    35 38 39 46 47 48 49 51 52 53 54];

validationIDs = [17 18 19 30 50];

fprintf('[M3-R3] Dataset split\n');
fprintf('Complete images : %d\n',numel(completeIDs));
fprintf('Training images : %d\n',numel(trainingIDs));
fprintf('Validation      : %d\n\n',numel(validationIDs));

%% ===============================================================
% 7. BUILD PATCH COORDINATES
% ===============================================================

firstImagePath = fullfile( ...
    originalTrainDir, ...
    sprintf('IDRiD_%02d.jpg',trainingIDs(1)));

firstImage = imread(firstImagePath);

imageHeight = size(firstImage,1);
imageWidth = size(firstImage,2);

coords = buildPatchCoordinates( ...
    imageHeight, ...
    imageWidth, ...
    patchSize, ...
    stride);

patchesPerImage = size(coords,1);

fprintf('[M3-R3] Original image size: %d x %d\n', ...
    imageHeight,imageWidth);

fprintf('[M3-R3] Patches per image: %d\n', ...
    patchesPerImage);

fprintf('\n');

%% ===============================================================
% 8. BUILD LESION-AWARE PATCH POOL
% ===============================================================

fprintf('===============================================================\n');
fprintf('[M3-R3] BUILDING LESION-AWARE PATCH POOL\n');
fprintf('===============================================================\n\n');

%
% Each patch receives a foreground-density score.
%
% Example:
%
%   0% foreground       -> background patch
%   0.1% foreground     -> very low lesion content
%   1% foreground       -> useful
%   5% foreground       -> strong foreground patch
%   10%+ foreground     -> highly useful
%

patchInfo = struct( ...
    'imageID',{}, ...
    'row',{}, ...
    'col',{}, ...
    'density',{}, ...
    'hasMA',{}, ...
    'hasHE',{}, ...
    'hasEX',{}, ...
    'hasSE',{}, ...
    'hasOD',{});

counter = 0;

classFolders = {
    '1. Microaneurysms'
    '2. Haemorrhages'
    '3. Hard Exudates'
    '4. Soft Exudates'
    '5. Optic Disc'
};

suffixes = {'MA','HE','EX','SE','OD'};

for imageIndex = 1:numel(trainingIDs)

    id = trainingIDs(imageIndex);

    fprintf('[M3-R3] Analyzing IDRiD_%02d...\n',id);

    fullMask = readFullMulticlassMask( ...
        groundTruthTrainDir,id);

    for p = 1:size(coords,1)

        row = coords(p,1);
        col = coords(p,2);

        maskPatch = fullMask( ...
            row:(row+patchSize-1), ...
            col:(col+patchSize-1));

        validPixels = maskPatch ~= 255;

        foregroundPixels = ...
            nnz(maskPatch > 0 & maskPatch ~= 255);

        validPixelCount = max(nnz(validPixels),1);

        density = ...
            foregroundPixels / validPixelCount;

        counter = counter + 1;

        patchInfo(counter).imageID = id;
        patchInfo(counter).row = row;
        patchInfo(counter).col = col;
        patchInfo(counter).density = density;

        patchInfo(counter).hasMA = any(maskPatch(:) == 1);
        patchInfo(counter).hasHE = any(maskPatch(:) == 2);
        patchInfo(counter).hasEX = any(maskPatch(:) == 3);
        patchInfo(counter).hasSE = any(maskPatch(:) == 4);
        patchInfo(counter).hasOD = any(maskPatch(:) == 5);

    end

end

fprintf('\n');

%% ===============================================================
% 9. ANALYZE PATCH POOL
% ===============================================================

densities = [patchInfo.density];

backgroundPatches = ...
    densities == 0;

lowDensityPatches = ...
    densities > 0 & densities < 0.01;

mediumDensityPatches = ...
    densities >= 0.01 & densities < 0.05;

highDensityPatches = ...
    densities >= 0.05;

fprintf('Patch pool:\n\n');

fprintf('Total patches       : %d\n',numel(patchInfo));

fprintf('Background only     : %d\n', ...
    nnz(backgroundPatches));

fprintf('Low density (<1%%)   : %d\n', ...
    nnz(lowDensityPatches));

fprintf('Medium density      : %d\n', ...
    nnz(mediumDensityPatches));

fprintf('High density (>=5%%) : %d\n\n', ...
    nnz(highDensityPatches));

fprintf('Class-containing patches:\n\n');

fprintf('MA  : %d\n', ...
    nnz([patchInfo.hasMA]));

fprintf('HE  : %d\n', ...
    nnz([patchInfo.hasHE]));

fprintf('EX  : %d\n', ...
    nnz([patchInfo.hasEX]));

fprintf('SE  : %d\n', ...
    nnz([patchInfo.hasSE]));

fprintf('OD  : %d\n\n', ...
    nnz([patchInfo.hasOD]));

%% ===============================================================
% 10. BUILD SAMPLING WEIGHTS
% ===============================================================

fprintf('===============================================================\n');
fprintf('[M3-R3] BUILDING SAMPLING WEIGHTS\n');
fprintf('===============================================================\n\n');

%
% Sampling strategy:
%
% Background-only patches:
%       weight = 0.15
%
% Very low-density patches:
%       weight = 0.50
%
% Medium-density patches:
%       weight = 1.50
%
% High-density patches:
%       weight = 3.00
%
% This means useful lesion-rich patches are selected more often.
%

samplingWeights = zeros(numel(patchInfo),1);

samplingWeights(backgroundPatches) = 0.15;

samplingWeights(lowDensityPatches) = 0.50;

samplingWeights(mediumDensityPatches) = 1.50;

samplingWeights(highDensityPatches) = 3.00;

%
% Additional boost for Soft Exudates because this class had
% the smallest number of class-containing patches.
%

for p = 1:numel(patchInfo)

    if patchInfo(p).hasSE
        samplingWeights(p) = ...
            samplingWeights(p) * 1.5;
    end

end

%
% Additional boost for Microaneurysms because they are extremely
% small and difficult to learn.
%

for p = 1:numel(patchInfo)

    if patchInfo(p).hasMA
        samplingWeights(p) = ...
            samplingWeights(p) * 1.25;
    end

end

fprintf('Sampling strategy created.\n');

fprintf('Background weight range : %.2f\n',0.15);
fprintf('Low density weight      : %.2f\n',0.50);
fprintf('Medium density weight   : %.2f\n',1.50);
fprintf('High density weight     : %.2f\n',3.00);

fprintf('\n');

%% ===============================================================
% 11. CLASS WEIGHTS
% ===============================================================

fprintf('===============================================================\n');
fprintf('[M3-R3] CALCULATING CLASS WEIGHTS\n');
fprintf('===============================================================\n\n');

pixelCounts = zeros(1,numClasses);

for i = 1:numel(trainingIDs)

    id = trainingIDs(i);

    fullMask = readFullMulticlassMask( ...
        groundTruthTrainDir,id);

    for c = 0:(numClasses-1)

        pixelCounts(c+1) = ...
            pixelCounts(c+1) + ...
            nnz(fullMask == c);

    end

end

fprintf('Pixel counts:\n');

fprintf('Background      : %d\n',pixelCounts(1));
fprintf('MA              : %d\n',pixelCounts(2));
fprintf('HE              : %d\n',pixelCounts(3));
fprintf('Hard EX         : %d\n',pixelCounts(4));
fprintf('Soft EX         : %d\n',pixelCounts(5));
fprintf('OD              : %d\n\n',pixelCounts(6));

frequencies = ...
    pixelCounts ./ sum(pixelCounts);

classWeights = ...
    1 ./ sqrt(frequencies + eps);

classWeights = ...
    classWeights ./ mean(classWeights);

fprintf('Class weights:\n');

fprintf('Background      : %.4f\n',classWeights(1));
fprintf('MA              : %.4f\n',classWeights(2));
fprintf('HE              : %.4f\n',classWeights(3));
fprintf('Hard EX         : %.4f\n',classWeights(4));
fprintf('Soft EX         : %.4f\n',classWeights(5));
fprintf('OD              : %.4f\n\n',classWeights(6));

%% ===============================================================
% 12. BUILD U-NET
% ===============================================================

fprintf('===============================================================\n');
fprintf('[M3-R3] BUILDING U-NET\n');
fprintf('===============================================================\n\n');

net = build_unet();

fprintf('[M3-R3] U-Net created successfully.\n\n');

%% ===============================================================
% 13. SAVE INITIAL MODEL
% ===============================================================

initialModelPath = fullfile( ...
    modelDir, ...
    'unet_multiclass_lesionaware_initial.mat');

save(initialModelPath, ...
    'net', ...
    'classWeights', ...
    'samplingWeights', ...
    'trainingIDs', ...
    'validationIDs', ...
    '-v7.3');

fprintf('[M3-R3] Initial model saved.\n');

%% ===============================================================
% 14. ADAM INITIALIZATION
% ===============================================================

averageGrad = [];

averageSqGrad = [];

iteration = 0;

trainingLossHistory = zeros(numEpochs,1);

validationLossHistory = zeros(numEpochs,1);

bestValidationLoss = inf;

bestNet = net;

%% ===============================================================
% 15. START TRAINING
% ===============================================================

fprintf('\n');
fprintf('===============================================================\n');
fprintf('       M3 ROUND-3 PILOT TRAINING STARTING\n');
fprintf('===============================================================\n\n');

trainingStart = tic;

for epoch = 1:numEpochs

    fprintf('\n');
    fprintf('---------------------------------------------------------------\n');
    fprintf('Epoch %d / %d\n',epoch,numEpochs);
    fprintf('---------------------------------------------------------------\n');

    epochStart = tic;

    epochLoss = 0;

    patchCounter = 0;

    %
    % We use weighted random sampling.
    %
    % Number of training updates is kept the same as Round-2A:
    %
    % 1134 patches per epoch.
    %

    numberOfUpdates = numel(trainingIDs) * patchesPerImage;

    samplingProbability = ...
        samplingWeights ./ sum(samplingWeights);

    %% -----------------------------------------------------------
    % TRAINING
    % ------------------------------------------------------------

    for update = 1:numberOfUpdates

        %
        % Select one patch according to lesion-aware probability.
        %

        selectedIndex = ...
            weightedRandomIndex(samplingProbability);

        info = patchInfo(selectedIndex);

        id = info.imageID;

        %
        % Load image and mask.
        %

        img = readOriginalImage( ...
            originalTrainDir,id);

        fullMask = readFullMulticlassMask( ...
            groundTruthTrainDir,id);

        row = info.row;

        col = info.col;

        imagePatch = img( ...
            row:(row+patchSize-1), ...
            col:(col+patchSize-1),:);

        maskPatch = fullMask( ...
            row:(row+patchSize-1), ...
            col:(col+patchSize-1));

        X = single(imagePatch) / 255;

        %% -------------------------------------------------------
        % CALCULATE GRADIENTS
        % --------------------------------------------------------

        [loss,gradients] = dlfeval( ...
            @modelGradients, ...
            net, ...
            X, ...
            maskPatch, ...
            classWeights, ...
            numClasses);

        %% -------------------------------------------------------
        % ADAM UPDATE
        % --------------------------------------------------------

        iteration = iteration + 1;

        [net,averageGrad,averageSqGrad] = ...
            adamupdate( ...
                net, ...
                gradients, ...
                averageGrad, ...
                averageSqGrad, ...
                iteration, ...
                initialLearnRate);

        lossValue = ...
            double(extractdata(loss));

        epochLoss = ...
            epochLoss + lossValue;

        patchCounter = patchCounter + 1;

        %% -------------------------------------------------------
        % PROGRESS
        % --------------------------------------------------------

        if mod(patchCounter,50) == 0 || ...
                patchCounter == 1

            elapsed = toc(trainingStart);

            currentRate = ...
                elapsed / patchCounter;

            remaining = ...
                numberOfUpdates - patchCounter;

            estimatedRemaining = ...
                currentRate * remaining;

            fprintf( ...
                '[M3-R3] Epoch %d: update %d / %d | Loss %.4f | ETA %.1f min\n', ...
                epoch, ...
                patchCounter, ...
                numberOfUpdates, ...
                lossValue, ...
                estimatedRemaining/60);

        end

    end

    trainingLossHistory(epoch) = ...
        epochLoss / patchCounter;

    fprintf('\n');
    fprintf('[M3-R3] Training loss: %.6f\n', ...
        trainingLossHistory(epoch));

    %% ===========================================================
    % VALIDATION
    % ===========================================================

    fprintf('\n[M3-R3] Starting validation...\n');

    validationLoss = 0;

    validationPatchCounter = 0;

    for imageIndex = 1:numel(validationIDs)

        id = validationIDs(imageIndex);

        fprintf('[M3-R3] Validating IDRiD_%02d...\n',id);

        img = readOriginalImage( ...
            originalTrainDir,id);

        fullMask = readFullMulticlassMask( ...
            groundTruthTrainDir,id);

        for p = 1:size(coords,1)

            row = coords(p,1);

            col = coords(p,2);

            imagePatch = img( ...
                row:(row+patchSize-1), ...
                col:(col+patchSize-1),:);

            maskPatch = fullMask( ...
                row:(row+patchSize-1), ...
                col:(col+patchSize-1));

            X = single(imagePatch) / 255;

            dlX = dlarray(X,'SSCB');

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

    fprintf('[M3-R3] Validation loss: %.6f\n', ...
        validationLossHistory(epoch));

    %% ===========================================================
    % SAVE BEST
    % ===========================================================

    if validationLossHistory(epoch) < bestValidationLoss

        bestValidationLoss = ...
            validationLossHistory(epoch);

        bestNet = net;

        bestModelPath = fullfile( ...
            modelDir, ...
            'unet_multiclass_lesionaware_best.mat');

        net = bestNet;

        save(bestModelPath, ...
            'net', ...
            'classWeights', ...
            'samplingWeights', ...
            'trainingIDs', ...
            'validationIDs', ...
            'trainingLossHistory', ...
            'validationLossHistory', ...
            '-v7.3');

        fprintf('\n');
        fprintf('[M3-R3] BEST MODEL UPDATED.\n');
        fprintf('[M3-R3] Best validation loss: %.6f\n', ...
            bestValidationLoss);

    end

    epochTime = toc(epochStart);

    fprintf('\n');
    fprintf('[M3-R3] Epoch %d completed.\n',epoch);

    fprintf('[M3-R3] Epoch time: %.2f minutes\n', ...
        epochTime/60);

end

%% ===============================================================
% 16. SAVE FINAL MODEL
% ===============================================================

finalModelPath = fullfile( ...
    modelDir, ...
    'unet_multiclass_lesionaware_final.mat');

save(finalModelPath, ...
    'net', ...
    'classWeights', ...
    'samplingWeights', ...
    'trainingIDs', ...
    'validationIDs', ...
    'trainingLossHistory', ...
    'validationLossHistory', ...
    '-v7.3');

%% ===============================================================
% 17. SAVE TRAINING GRAPH
% ===============================================================

figure('Name','M3 Round-3 Lesion-Aware Training');

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

title('M3 Round-3 Lesion-Aware Patch Training');

legend( ...
    'Training Loss', ...
    'Validation Loss', ...
    'Location','best');

grid on;

trainingGraphPath = fullfile( ...
    outputDir, ...
    'r3_lesionaware_training_loss.png');

saveas(gcf,trainingGraphPath);

%% ===============================================================
% 18. FINAL SUMMARY
% ===============================================================

totalTime = toc(trainingStart);

fprintf('\n');
fprintf('===============================================================\n');
fprintf('       M3 ROUND-3 PILOT COMPLETED\n');
fprintf('===============================================================\n\n');

fprintf('Training images       : %d\n',numel(trainingIDs));

fprintf('Validation images     : %d\n',numel(validationIDs));

fprintf('Patches available     : %d\n',numel(patchInfo));

fprintf('Updates per epoch     : %d\n',numberOfUpdates);

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
    imageHeight,imageWidth,patchSize,stride)

rows = 1:stride:(imageHeight-patchSize+1);

lastRow = imageHeight-patchSize+1;

if rows(end) ~= lastRow
    rows = [rows lastRow];
end

cols = 1:stride:(imageWidth-patchSize+1);

lastCol = imageWidth-patchSize+1;

if cols(end) ~= lastCol
    cols = [cols lastCol];
end

coords = zeros( ...
    numel(rows)*numel(cols),2);

counter = 1;

for r = 1:numel(rows)

    for c = 1:numel(cols)

        coords(counter,:) = ...
            [rows(r),cols(c)];

        counter = counter + 1;

    end

end

end


%% =================================================================
% LOCAL FUNCTION: WEIGHTED RANDOM PATCH SELECTION
% =================================================================

function index = weightedRandomIndex(probabilities)

cumulative = cumsum(probabilities);

r = rand();

index = find(cumulative >= r,1,'first');

if isempty(index)
    index = numel(probabilities);
end

end


%% =================================================================
% LOCAL FUNCTION: READ ORIGINAL IMAGE
% =================================================================

function img = readOriginalImage(originalTrainDir,id)

imagePath = fullfile( ...
    originalTrainDir, ...
    sprintf('IDRiD_%02d.jpg',id));

if ~isfile(imagePath)

    error( ...
        'Training image not found:\n%s', ...
        imagePath);

end

img = imread(imagePath);

if ndims(img) == 2
    img = repmat(img,[1 1 3]);
end

if size(img,3) ~= 3

    error( ...
        'Unexpected image channels for IDRiD_%02d.',id);

end

end


%% =================================================================
% LOCAL FUNCTION: READ FULL MULTICLASS MASK
% =================================================================

function multiclassMask = readFullMulticlassMask( ...
    groundTruthTrainDir,id)

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

firstPath = fullfile( ...
    groundTruthTrainDir, ...
    classFolders{1}, ...
    sprintf('IDRiD_%02d_%s.tif',id,suffixes{1}));

if ~isfile(firstPath)

    error( ...
        'Missing MA mask:\n%s',firstPath);

end

firstMask = imread(firstPath);

if ndims(firstMask) > 2
    firstMask = firstMask(:,:,1);
end

[H,W] = size(firstMask);

multiclassMask = zeros(H,W,'uint8');

allMasks = false(H,W,5);

for c = 1:5

    maskPath = fullfile( ...
        groundTruthTrainDir, ...
        classFolders{c}, ...
        sprintf('IDRiD_%02d_%s.tif',id,suffixes{c}));

    if ~isfile(maskPath)

        error( ...
            'Missing mask for IDRiD_%02d:\n%s', ...
            id,maskPath);

    end

    currentMask = imread(maskPath);

    if ndims(currentMask) > 2
        currentMask = currentMask(:,:,1);
    end

    allMasks(:,:,c) = currentMask > 0;

end

numberOfClassesAtPixel = ...
    sum(allMasks,3);

for c = 1:5

    uniquePixels = ...
        allMasks(:,:,c) & ...
        numberOfClassesAtPixel == 1;

    multiclassMask(uniquePixels) = uint8(c);

end

overlapPixels = ...
    numberOfClassesAtPixel > 1;

multiclassMask(overlapPixels) = uint8(255);

end


%% =================================================================
% LOCAL FUNCTION: MODEL GRADIENTS
% =================================================================

function [loss,gradients] = modelGradients( ...
    net,X,target,classWeights,numClasses)

dlX = dlarray(X,'SSCB');

dlYPred = forward(net,dlX);

loss = weightedCombinedLoss( ...
    dlYPred, ...
    target, ...
    classWeights, ...
    numClasses);

gradients = dlgradient( ...
    loss, ...
    net.Learnables);

end


%% =================================================================
% LOCAL FUNCTION: COMBINED LOSS
% =================================================================

function loss = weightedCombinedLoss( ...
    predictions,target,classWeights,numClasses)

ceLoss = weightedCrossEntropy( ...
    predictions,target,classWeights,numClasses);

diceLoss = foregroundDiceLoss( ...
    predictions,target,numClasses);

loss = ...
    0.4 * ceLoss + ...
    0.6 * diceLoss;

end


%% =================================================================
% LOCAL FUNCTION: WEIGHTED CROSS ENTROPY
% =================================================================

function loss = weightedCrossEntropy( ...
    predictions,target,classWeights,numClasses)

validMask = target ~= 255;

validMaskDL = ...
    dlarray(single(validMask),'SS');

totalLoss = dlarray(0);

validPixelCount = ...
    max(nnz(validMask),1);

for c = 1:numClasses

    classTarget = ...
        target == (c-1);

    classTargetDL = ...
        dlarray(single(classTarget),'SS');

    probability = ...
        predictions(:,:,c,1);

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
    predictions,target,numClasses)

diceValues = [];

validMask = target ~= 255;

validMaskDL = ...
    dlarray(single(validMask),'SS');

for c = 2:numClasses

    targetClass = ...
        target == (c-1);

    targetClassDL = ...
        dlarray(single(targetClass),'SS');

    probability = ...
        predictions(:,:,c,1);

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
        [diceValues;dice];

end

meanDice = mean(diceValues);

loss = 1 - meanDice;

end