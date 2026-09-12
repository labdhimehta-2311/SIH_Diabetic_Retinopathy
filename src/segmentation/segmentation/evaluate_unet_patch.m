function evaluate_unet_patch()
% EVALUATE_UNET_PATCH
% Round-2A patch-based U-Net evaluation for IDRiD diabetic retinopathy.
%
% This script:
%   1. Loads the already-trained R2-A patch model.
%   2. Finds the 14 complete IDRiD test images.
%   3. Builds multiclass ground-truth masks at ORIGINAL resolution.
%   4. Splits each full-resolution image into 512x512 patches.
%   5. Predicts each patch using the trained U-Net.
%   6. Reconstructs a full-resolution prediction.
%   7. Calculates Dice and IoU for all 6 classes.
%   8. Saves overall and per-image metrics.
%
% IMPORTANT:
%   NO TRAINING IS PERFORMED BY THIS FILE.
%
% Classes:
%   0 = Background
%   1 = Microaneurysms
%   2 = Haemorrhages
%   3 = Hard Exudates
%   4 = Soft Exudates
%   5 = Optic Disc
% 255 = Ignore / ambiguous overlap

clc;
fprintf('\n');
fprintf('============================================================\n');
fprintf('       M3 R2-A PATCH-BASED U-NET EVALUATION\n');
fprintf('============================================================\n');

%% ------------------------------------------------------------
% 1. PROJECT PATHS
% -------------------------------------------------------------

thisFile = mfilename('fullpath');
segmentationDir = fileparts(thisFile);
srcDir = fileparts(segmentationDir);
projectRoot = fileparts(fileparts(srcDir));

fprintf('[M3-R2A-EVAL] Project root:\n%s\n\n', projectRoot);

% Add required folders
addpath(projectRoot);
addpath(segmentationDir);
addpath(fullfile(projectRoot, 'src'));
addpath(fullfile(projectRoot, 'src', 'segmentation'));
addpath(fullfile(projectRoot, 'src', 'segmentation', 'datasets'));

%% ------------------------------------------------------------
% 2. DATASET PATHS
% -------------------------------------------------------------

datasetRoot = fullfile(projectRoot, '..', 'A. Segmentation');

originalTestDir = fullfile( ...
    datasetRoot, ...
    '1. Original Images', ...
    'b. Testing Set');

groundTruthTestDir = fullfile( ...
    datasetRoot, ...
    '2. All Segmentation Groundtruths', ...
    'b. Testing Set');

%% ------------------------------------------------------------
% 3. R2-A MODEL PATH
% -------------------------------------------------------------

modelDir = fullfile( ...
    projectRoot, ...
    'src', ...
    'segmentation', ...
    'trained_models');

modelFile = fullfile( ...
    modelDir, ...
    'unet_multiclass_patch_best.mat');

if ~isfile(modelFile)
    error(['R2-A best model was not found:\n%s\n\n' ...
           'Expected file:\n' ...
           'src/segmentation/trained_models/' ...
           'unet_multiclass_patch_best.mat'], ...
           modelFile);
end

fprintf('[M3-R2A-EVAL] Model: %s\n', modelFile);

%% ------------------------------------------------------------
% 4. CHECK DATASET
% -------------------------------------------------------------

if ~isfolder(originalTestDir)
    error('Testing image folder not found:\n%s', originalTestDir);
end

if ~isfolder(groundTruthTestDir)
    error('Testing ground-truth folder not found:\n%s', groundTruthTestDir);
end

fprintf('[M3-R2A-EVAL] Test images: AVAILABLE\n');
fprintf('[M3-R2A-EVAL] Test masks : AVAILABLE\n\n');

%% ------------------------------------------------------------
% 5. SETTINGS
% -------------------------------------------------------------

patchSize = 512;

classNames = { ...
    'Background', ...
    'Microaneurysms', ...
    'Haemorrhages', ...
    'Hard Exudates', ...
    'Soft Exudates', ...
    'Optic Disc'};

numClasses = 6;

fprintf('[M3-R2A-EVAL] Patch size: %d x %d\n', ...
    patchSize, patchSize);

fprintf('[M3-R2A-EVAL] Number of classes: %d\n', numClasses);

%% ------------------------------------------------------------
% 6. LOAD MODEL
% -------------------------------------------------------------

fprintf('\n[M3-R2A-EVAL] Loading R2-A best model...\n');

modelData = load(modelFile);

% The trainer saves the network as "net".
if isfield(modelData, 'net')
    net = modelData.net;
elseif isfield(modelData, 'netToSave')
    net = modelData.netToSave;
else
    error(['The model file does not contain "net" or "netToSave".\n' ...
           'Available variables are: %s'], ...
           strjoin(fieldnames(modelData), ', '));
end

fprintf('[M3-R2A-EVAL] Model loaded successfully.\n');

%% ------------------------------------------------------------
% 7. FIND TEST IMAGES
% -------------------------------------------------------------

imageFiles = dir(fullfile(originalTestDir, 'IDRiD_*.jpg'));

if isempty(imageFiles)
    error('No IDRiD test images were found.');
end

% Sort naturally by numeric ID
imageIDs = zeros(numel(imageFiles), 1);

for i = 1:numel(imageFiles)
    token = regexp(imageFiles(i).name, 'IDRiD_(\d+)', 'tokens');

    if ~isempty(token)
        imageIDs(i) = str2double(token{1}{1});
    end
end

[~, sortOrder] = sort(imageIDs);

imageFiles = imageFiles(sortOrder);
imageIDs = imageIDs(sortOrder);

fprintf('[M3-R2A-EVAL] Total test images found: %d\n', ...
    numel(imageFiles));

%% ------------------------------------------------------------
% 8. FIND COMPLETE TEST IMAGES
% -------------------------------------------------------------
%
% Only images that have all 5 ground-truth classes are evaluated.
%
% Based on your IDRiD dataset, this should produce 14 images:
%
% 55,56,59,60,61,64,67,68,70,71,72,73,74,75
%
% -------------------------------------------------------------

completeIDs = [];

for i = 1:numel(imageIDs)

    id = imageIDs(i);

    hasMA = isfile(fullfile( ...
        groundTruthTestDir, ...
        '1. Microaneurysms', ...
        sprintf('IDRiD_%02d_MA.tif', id)));

    hasHE = isfile(fullfile( ...
        groundTruthTestDir, ...
        '2. Haemorrhages', ...
        sprintf('IDRiD_%02d_HE.tif', id)));

    hasEX = isfile(fullfile( ...
        groundTruthTestDir, ...
        '3. Hard Exudates', ...
        sprintf('IDRiD_%02d_EX.tif', id)));

    hasSE = isfile(fullfile( ...
        groundTruthTestDir, ...
        '4. Soft Exudates', ...
        sprintf('IDRiD_%02d_SE.tif', id)));

    hasOD = isfile(fullfile( ...
        groundTruthTestDir, ...
        '5. Optic Disc', ...
        sprintf('IDRiD_%02d_OD.tif', id)));

    if hasMA && hasHE && hasEX && hasSE && hasOD
        completeIDs(end+1) = id; %#ok<AGROW>
    end
end

fprintf('[M3-R2A-EVAL] Complete test images: %d\n', ...
    numel(completeIDs));

fprintf('[M3-R2A-EVAL] IDs: ');

fprintf('%02d ', completeIDs);

fprintf('\n\n');

if isempty(completeIDs)
    error('No complete test images were found.');
end

%% ------------------------------------------------------------
% 9. OUTPUT DIRECTORIES
% -------------------------------------------------------------

metricsDir = fullfile( ...
    projectRoot, ...
    'src', ...
    'segmentation', ...
    'outputs', ...
    'metrics');

predictionsDir = fullfile( ...
    projectRoot, ...
    'src', ...
    'segmentation', ...
    'outputs', ...
    'predictions');

if ~isfolder(metricsDir)
    mkdir(metricsDir);
end

if ~isfolder(predictionsDir)
    mkdir(predictionsDir);
end

%% ------------------------------------------------------------
% 10. GLOBAL CONFUSION COUNTS
% -------------------------------------------------------------
%
% Instead of calculating one Dice score per image and averaging,
% we accumulate TP/FP/FN over all evaluated pixels.
%
% This gives a stable overall test-set metric.

totalTP = zeros(numClasses, 1);
totalFP = zeros(numClasses, 1);
totalFN = zeros(numClasses, 1);

% Per-image metric storage
numImages = numel(completeIDs);

perImageDice = zeros(numImages, numClasses);
perImageIoU = zeros(numImages, numClasses);

%% ------------------------------------------------------------
% 11. EVALUATE EACH TEST IMAGE
% -------------------------------------------------------------

fprintf('============================================================\n');
fprintf('                 STARTING EVALUATION\n');
fprintf('============================================================\n\n');

for imageIndex = 1:numImages

    id = completeIDs(imageIndex);

    imageName = sprintf('IDRiD_%02d.jpg', id);

    imagePath = fullfile(originalTestDir, imageName);

    fprintf('[M3-R2A-EVAL] ------------------------------------------------\n');
    fprintf('[M3-R2A-EVAL] Image %d / %d: %s\n', ...
        imageIndex, numImages, imageName);

    %% --------------------------------------------------------
    % Load original image
    % ---------------------------------------------------------

    img = imread(imagePath);

    % Ensure RGB
    if size(img, 3) == 1
        img = repmat(img, 1, 1, 3);
    end

    img = im2single(img);

    [H, W, ~] = size(img);

    fprintf('[M3-R2A-EVAL] Original size: %d x %d x 3\n', ...
        H, W);

    %% --------------------------------------------------------
    % Build original-resolution multiclass ground truth
    % ---------------------------------------------------------

    groundTruth = buildMulticlassGroundTruth( ...
        groundTruthTestDir, id, H, W);

    %% --------------------------------------------------------
    % Create patch start positions
    % ---------------------------------------------------------
    %
    % These positions cover the complete image.
    % The final patch in each direction may overlap with the
    % previous patch so that the right/bottom image boundary
    % is not lost.
    % ---------------------------------------------------------

    rowStarts = getPatchStarts(H, patchSize);
    colStarts = getPatchStarts(W, patchSize);

    fprintf('[M3-R2A-EVAL] Number of row patches: %d\n', ...
        numel(rowStarts));

    fprintf('[M3-R2A-EVAL] Number of column patches: %d\n', ...
        numel(colStarts));

    fprintf('[M3-R2A-EVAL] Total patches: %d\n', ...
        numel(rowStarts) * numel(colStarts));

    %% --------------------------------------------------------
    % Prediction canvas
    % ---------------------------------------------------------
    %
    % Because the final boundary patches can overlap, we keep
    % one prediction per pixel.
    %
    % Earlier patches fill the image first.
    % Only pixels that have not yet received a prediction are
    % filled by later patches.
    % ---------------------------------------------------------

    predictedMask = zeros(H, W, 'uint8');

    predictionWritten = false(H, W);

    %% --------------------------------------------------------
    % Predict every patch
    % ---------------------------------------------------------

    patchCounter = 0;
    totalPatches = numel(rowStarts) * numel(colStarts);

    for r = 1:numel(rowStarts)

        rStart = rowStarts(r);
        rEnd = rStart + patchSize - 1;

        for c = 1:numel(colStarts)

            cStart = colStarts(c);
            cEnd = cStart + patchSize - 1;

            patch = img( ...
                rStart:rEnd, ...
                cStart:cEnd, ...
                :);

            % Predict this 512x512 patch
            patchPrediction = predictPatch(net, patch);

            % Valid region inside original image
            validH = min(patchSize, H - rStart + 1);
            validW = min(patchSize, W - cStart + 1);

            patchPrediction = patchPrediction( ...
                1:validH, ...
                1:validW);

            % Only write pixels that have not already been
            % filled by an earlier patch.
            currentWritten = predictionWritten( ...
                rStart:rStart+validH-1, ...
                cStart:cStart+validW-1);

            currentPrediction = predictedMask( ...
                rStart:rStart+validH-1, ...
                cStart:cStart+validW-1);

            writeRegion = ~currentWritten;

            currentPrediction(writeRegion) = ...
                patchPrediction(writeRegion);

            currentWritten(writeRegion) = true;

            predictedMask( ...
                rStart:rStart+validH-1, ...
                cStart:cStart+validW-1) = ...
                currentPrediction;

            predictionWritten( ...
                rStart:rStart+validH-1, ...
                cStart:cStart+validW-1) = ...
                currentWritten;

            patchCounter = patchCounter + 1;

            if mod(patchCounter, 10) == 0 || ...
                    patchCounter == totalPatches

                fprintf('[M3-R2A-EVAL] Patch %d / %d completed.\n', ...
                    patchCounter, totalPatches);
            end
        end
    end

    %% --------------------------------------------------------
    % Check prediction coverage
    % ---------------------------------------------------------

    if ~all(predictionWritten(:))
        warning(['Some pixels were not predicted for IDRiD_%02d. ' ...
                 'This should not normally happen.'], id);
    end

    %% --------------------------------------------------------
    % Calculate metrics for this image
    % ---------------------------------------------------------

    validPixels = groundTruth ~= 255;

    gtValid = groundTruth(validPixels);
    predValid = predictedMask(validPixels);

    for classIndex = 1:numClasses

        classLabel = classIndex - 1;

        gtClass = gtValid == classLabel;
        predClass = predValid == classLabel;

        TP = sum(gtClass & predClass);
        FP = sum(~gtClass & predClass);
        FN = sum(gtClass & ~predClass);

        dice = calculateDice(TP, FP, FN);
        iou = calculateIoU(TP, FP, FN);

        perImageDice(imageIndex, classIndex) = dice;
        perImageIoU(imageIndex, classIndex) = iou;

        totalTP(classIndex) = totalTP(classIndex) + TP;
        totalFP(classIndex) = totalFP(classIndex) + FP;
        totalFN(classIndex) = totalFN(classIndex) + FN;
    end

    %% --------------------------------------------------------
    % Print image results
    % ---------------------------------------------------------

    fprintf('\n[M3-R2A-EVAL] Per-image results for IDRiD_%02d:\n', id);

    fprintf('%-20s %12s %12s\n', ...
        'Class', 'Dice', 'IoU');

    fprintf('%s\n', repmat('-', 1, 46));

    for classIndex = 1:numClasses

        fprintf('%-20s %12.4f %12.4f\n', ...
            classNames{classIndex}, ...
            perImageDice(imageIndex, classIndex), ...
            perImageIoU(imageIndex, classIndex));
    end

    %% --------------------------------------------------------
    % Save prediction
    % ---------------------------------------------------------

    predictionFile = fullfile( ...
        predictionsDir, ...
        sprintf('R2A_IDRiD_%02d_prediction.png', id));

    imwrite(predictedMask, predictionFile);

    fprintf('[M3-R2A-EVAL] Prediction saved:\n%s\n', ...
        predictionFile);

    fprintf('\n');
end

%% ------------------------------------------------------------
% 12. GLOBAL TEST-SET METRICS
% -------------------------------------------------------------

globalDice = zeros(numClasses, 1);
globalIoU = zeros(numClasses, 1);

for classIndex = 1:numClasses

    globalDice(classIndex) = calculateDice( ...
        totalTP(classIndex), ...
        totalFP(classIndex), ...
        totalFN(classIndex));

    globalIoU(classIndex) = calculateIoU( ...
        totalTP(classIndex), ...
        totalFP(classIndex), ...
        totalFN(classIndex));
end

%% ------------------------------------------------------------
% 13. PRINT FINAL RESULTS
% -------------------------------------------------------------

fprintf('\n');
fprintf('============================================================\n');
fprintf('              R2-A FINAL TEST RESULTS\n');
fprintf('============================================================\n\n');

fprintf('%-20s %12s %12s\n', ...
    'Class', 'Dice', 'IoU');

fprintf('%s\n', repmat('-', 1, 46));

for classIndex = 1:numClasses

    fprintf('%-20s %12.4f %12.4f\n', ...
        classNames{classIndex}, ...
        globalDice(classIndex), ...
        globalIoU(classIndex));
end

%% ------------------------------------------------------------
% 14. MEAN FOREGROUND METRICS
% -------------------------------------------------------------
%
% Background is excluded because it dominates retinal images
% and can make a poor segmentation look artificially good.

foregroundDice = mean(globalDice(2:end));
foregroundIoU = mean(globalIoU(2:end));

fprintf('\n');
fprintf('Mean Foreground Dice : %.4f\n', foregroundDice);
fprintf('Mean Foreground IoU  : %.4f\n', foregroundIoU);

%% ------------------------------------------------------------
% 15. MACRO AVERAGE PER-IMAGE FOREGROUND METRICS
% -------------------------------------------------------------

meanPerImageForegroundDice = mean( ...
    mean(perImageDice(:, 2:end), 2));

meanPerImageForegroundIoU = mean( ...
    mean(perImageIoU(:, 2:end), 2));

fprintf('\n');
fprintf('Mean Per-Image Foreground Dice : %.4f\n', ...
    meanPerImageForegroundDice);

fprintf('Mean Per-Image Foreground IoU  : %.4f\n', ...
    meanPerImageForegroundIoU);

%% ------------------------------------------------------------
% 16. SAVE OVERALL METRICS
% -------------------------------------------------------------

metricsTable = table( ...
    classNames', ...
    globalDice, ...
    globalIoU, ...
    totalTP, ...
    totalFP, ...
    totalFN, ...
    'VariableNames', { ...
    'Class', ...
    'Dice', ...
    'IoU', ...
    'TP', ...
    'FP', ...
    'FN'});

metricsMatFile = fullfile( ...
    metricsDir, ...
    'unet_multiclass_patch_test_metrics.mat');

save(metricsMatFile, ...
    'metricsTable', ...
    'globalDice', ...
    'globalIoU', ...
    'foregroundDice', ...
    'foregroundIoU', ...
    'meanPerImageForegroundDice', ...
    'meanPerImageForegroundIoU', ...
    'completeIDs', ...
    'classNames', ...
    'totalTP', ...
    'totalFP', ...
    'totalFN');

metricsCsvFile = fullfile( ...
    metricsDir, ...
    'unet_multiclass_patch_test_metrics.csv');

writetable(metricsTable, metricsCsvFile);

%% ------------------------------------------------------------
% 17. SAVE PER-IMAGE METRICS
% -------------------------------------------------------------

perImageClass = strings(numImages * numClasses, 1);
perImageID = zeros(numImages * numClasses, 1);
perImageDiceVector = zeros(numImages * numClasses, 1);
perImageIoUVector = zeros(numImages * numClasses, 1);

counter = 0;

for i = 1:numImages

    for c = 1:numClasses

        counter = counter + 1;

        perImageID(counter) = completeIDs(i);

        perImageClass(counter) = classNames{c};

        perImageDiceVector(counter) = ...
            perImageDice(i, c);

        perImageIoUVector(counter) = ...
            perImageIoU(i, c);
    end
end

perImageTable = table( ...
    perImageID, ...
    perImageClass, ...
    perImageDiceVector, ...
    perImageIoUVector, ...
    'VariableNames', { ...
    'ImageID', ...
    'Class', ...
    'Dice', ...
    'IoU'});

perImageCsvFile = fullfile( ...
    metricsDir, ...
    'unet_multiclass_patch_per_image_metrics.csv');

writetable(perImageTable, perImageCsvFile);

%% ------------------------------------------------------------
% 18. FINAL SUMMARY
% -------------------------------------------------------------

fprintf('\n');
fprintf('============================================================\n');
fprintf('             R2-A EVALUATION COMPLETED\n');
fprintf('============================================================\n');

fprintf('\nModel:\n%s\n', modelFile);

fprintf('\nTest images evaluated: %d\n', numImages);

fprintf('Mean Foreground Dice: %.4f\n', foregroundDice);

fprintf('Mean Foreground IoU : %.4f\n', foregroundIoU);

fprintf('\nMetrics saved to:\n%s\n', metricsMatFile);

fprintf('\nCSV saved to:\n%s\n', metricsCsvFile);

fprintf('\nPer-image CSV saved to:\n%s\n', perImageCsvFile);

fprintf('\n============================================================\n');
fprintf('                     DONE\n');
fprintf('============================================================\n\n');

end


%% ========================================================================
% LOCAL FUNCTION: PREDICT ONE PATCH
% ========================================================================

function predictedPatch = predictPatch(net, patch)
% Convert image patch to dlarray.
%
% Format:
%   S = spatial
%   S = spatial
%   C = channel
%   B = batch

dlX = dlarray(single(patch), 'SSCB');

% Forward pass
dlY = forward(net, dlX);

% Convert probabilities to ordinary MATLAB array
scores = extractdata(dlY);

% Remove batch dimension
scores = squeeze(scores);

% scores should be:
%
%   512 x 512 x 6
%
% Each pixel has six class probabilities.

% Select class with highest probability.
[~, predictedPatch] = max(scores, [], 3);

% Convert:
%
% MATLAB class index:
%   1 = Background
%   2 = MA
%   3 = HE
%   4 = Hard EX
%   5 = Soft EX
%   6 = OD
%
% Required segmentation labels:
%   0 = Background
%   1 = MA
%   2 = HE
%   3 = Hard EX
%   4 = Soft EX
%   5 = OD

predictedPatch = uint8(predictedPatch - 1);

end


%% ========================================================================
% LOCAL FUNCTION: BUILD MULTICLASS GROUND TRUTH
% ========================================================================

function groundTruth = buildMulticlassGroundTruth( ...
    groundTruthTestDir, id, H, W)

% Read all five binary masks.

ma = readMask( ...
    fullfile( ...
    groundTruthTestDir, ...
    '1. Microaneurysms', ...
    sprintf('IDRiD_%02d_MA.tif', id)), H, W);

he = readMask( ...
    fullfile( ...
    groundTruthTestDir, ...
    '2. Haemorrhages', ...
    sprintf('IDRiD_%02d_HE.tif', id)), H, W);

ex = readMask( ...
    fullfile( ...
    groundTruthTestDir, ...
    '3. Hard Exudates', ...
    sprintf('IDRiD_%02d_EX.tif', id)), H, W);

se = readMask( ...
    fullfile( ...
    groundTruthTestDir, ...
    '4. Soft Exudates', ...
    sprintf('IDRiD_%02d_SE.tif', id)), H, W);

od = readMask( ...
    fullfile( ...
    groundTruthTestDir, ...
    '5. Optic Disc', ...
    sprintf('IDRiD_%02d_OD.tif', id)), H, W);

%% Count how many classes cover each pixel

overlapCount = ...
    uint8(ma) + ...
    uint8(he) + ...
    uint8(ex) + ...
    uint8(se) + ...
    uint8(od);

%% Start with background

groundTruth = zeros(H, W, 'uint8');

%% Assign unique classes

groundTruth(ma & overlapCount == 1) = 1;
groundTruth(he & overlapCount == 1) = 2;
groundTruth(ex & overlapCount == 1) = 3;
groundTruth(se & overlapCount == 1) = 4;
groundTruth(od & overlapCount == 1) = 5;

%% Ambiguous overlap pixels

groundTruth(overlapCount > 1) = 255;

end


%% ========================================================================
% LOCAL FUNCTION: READ MASK
% ========================================================================

function mask = readMask(filePath, H, W)

if ~isfile(filePath)
    error('Mask not found:\n%s', filePath);
end

mask = imread(filePath);

% Convert any nonzero value to logical foreground.
mask = mask > 0;

% Ensure correct dimensions.
if size(mask,1) ~= H || size(mask,2) ~= W

    mask = imresize( ...
        mask, ...
        [H W], ...
        'nearest');

    mask = mask > 0;
end

end


%% ========================================================================
% LOCAL FUNCTION: PATCH STARTS
% ========================================================================

function starts = getPatchStarts(imageLength, patchSize)

if imageLength <= patchSize
    starts = 1;
    return;
end

% Regular non-overlapping starts.
starts = 1:patchSize:(imageLength - patchSize + 1);

% Make sure the final part of the image is covered.
lastStart = imageLength - patchSize + 1;

if starts(end) ~= lastStart
    starts(end+1) = lastStart;
end

end


%% ========================================================================
% LOCAL FUNCTION: DICE
% ========================================================================

function dice = calculateDice(TP, FP, FN)

denominator = 2 * TP + FP + FN;

if denominator == 0
    dice = 1;
else
    dice = (2 * TP) / denominator;
end

end


%% ========================================================================
% LOCAL FUNCTION: IOU
% ========================================================================

function iou = calculateIoU(TP, FP, FN)

denominator = TP + FP + FN;

if denominator == 0
    iou = 1;
else
    iou = TP / denominator;
end

end