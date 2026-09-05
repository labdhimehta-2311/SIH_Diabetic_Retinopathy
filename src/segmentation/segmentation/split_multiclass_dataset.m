%% split_multiclass_dataset.m
% Create a reproducible training/validation split for the
% prepared IDRiD multiclass segmentation dataset.
%
% Dataset:
%   26 images with all five ground-truth classes available
%
% Split:
%   21 images -> Training
%    5 images -> Validation
%
% The random seed is fixed so the same split is obtained every time.

clear;
clc;

%% ============================================================
% 1. Project paths
% =============================================================

projectRoot = 'C:\Users\ANGEL ACHARYA\SIH\Segmentation_Project';

datasetRoot = fullfile( ...
    projectRoot, ...
    'SIH_Diabetic_Retinopathy', ...
    'src', ...
    'segmentation', ...
    'datasets');

imageFolder = fullfile( ...
    datasetRoot, ...
    'multiclass_images');

maskFolder = fullfile( ...
    datasetRoot, ...
    'multiclass_masks');

%% ============================================================
% 2. Get generated image files
% =============================================================

imageFiles = dir(fullfile(imageFolder, '*.png'));
maskFiles  = dir(fullfile(maskFolder, '*.png'));

fprintf('============================================\n');
fprintf('MULTICLASS DATASET SPLIT\n');
fprintf('============================================\n');

fprintf('Images found: %d\n', numel(imageFiles));
fprintf('Masks found:  %d\n\n', numel(maskFiles));

%% ============================================================
% 3. Verify image and mask counts
% =============================================================

if numel(imageFiles) ~= 26
    error('Expected 26 images, but found %d.', numel(imageFiles));
end

if numel(maskFiles) ~= 26
    error('Expected 26 masks, but found %d.', numel(maskFiles));
end

%% ============================================================
% 4. Extract image IDs
% =============================================================

imageIDs = cell(numel(imageFiles), 1);

for i = 1:numel(imageFiles)

    [~, name, ~] = fileparts(imageFiles(i).name);

    imageIDs{i} = name;

end

%% ============================================================
% 5. Verify corresponding masks exist
% =============================================================

for i = 1:numel(imageIDs)

    expectedMask = fullfile( ...
        maskFolder, ...
        [imageIDs{i} '.png']);

    if ~isfile(expectedMask)

        error( ...
            'Mask missing for image %s.', ...
            imageIDs{i});

    end

end

fprintf('All image/mask pairs verified.\n\n');

%% ============================================================
% 6. Create reproducible random split
% =============================================================

rng(42);

numImages = numel(imageIDs);

randomOrder = randperm(numImages);

numValidation = 5;

validationIndices = randomOrder(1:numValidation);

trainingIndices = randomOrder(numValidation+1:end);

%% ============================================================
% 7. Get training and validation IDs
% =============================================================

trainingIDs = imageIDs(trainingIndices);

validationIDs = imageIDs(validationIndices);

%% ============================================================
% 8. Sort IDs for easier reading
% =============================================================

trainingIDs = sort(trainingIDs);

validationIDs = sort(validationIDs);

%% ============================================================
% 9. Display split
% =============================================================

fprintf('============================================\n');
fprintf('TRAINING SET\n');
fprintf('============================================\n');

fprintf('Number of training images: %d\n\n', ...
    numel(trainingIDs));

for i = 1:numel(trainingIDs)

    fprintf('%s\n', trainingIDs{i});

end

fprintf('\n');

fprintf('============================================\n');
fprintf('VALIDATION SET\n');
fprintf('============================================\n');

fprintf('Number of validation images: %d\n\n', ...
    numel(validationIDs));

for i = 1:numel(validationIDs)

    fprintf('%s\n', validationIDs{i});

end

%% ============================================================
% 10. Save split information
% =============================================================

splitFile = fullfile( ...
    datasetRoot, ...
    'dataset_split.mat');

save( ...
    splitFile, ...
    'trainingIDs', ...
    'validationIDs');

fprintf('\n============================================\n');
fprintf('SPLIT SAVED\n');
fprintf('============================================\n');

fprintf('File:\n%s\n', splitFile);

fprintf('\nTraining images:   %d\n', numel(trainingIDs));
fprintf('Validation images: %d\n', numel(validationIDs));

fprintf('\nRandom seed: 42\n');

fprintf('\n============================================\n');
fprintf('DATASET SPLIT COMPLETED SUCCESSFULLY\n');
fprintf('============================================\n');