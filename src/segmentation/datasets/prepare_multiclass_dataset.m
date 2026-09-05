%% prepare_multiclass_dataset.m
% Prepare the IDRiD multiclass segmentation dataset.
%
% Class labels:
%   0   = Background
%   1   = Microaneurysms (MA)
%   2   = Haemorrhages (HE)
%   3   = Hard Exudates (EX)
%   4   = Soft Exudates (SE)
%   5   = Optic Disc (OD)
%   255 = Ignore / overlapping annotations
%
% Only images with all five ground-truth masks are used.

clear;
clc;
close all;

%% ============================================================
% 1. Project paths
% =============================================================

projectRoot = 'C:\Users\ANGEL ACHARYA\SIH\Segmentation_Project';

datasetRoot = fullfile( ...
    projectRoot, ...
    'A. Segmentation');

groundTruthRoot = fullfile( ...
    datasetRoot, ...
    '2. All Segmentation Groundtruths', ...
    'a. Training Set');

originalImageRoot = fullfile( ...
    datasetRoot, ...
    '1. Original Images', ...
    'a. Training Set');

%% ============================================================
% 2. Output folders
% =============================================================

outputRoot = fullfile( ...
    projectRoot, ...
    'SIH_Diabetic_Retinopathy', ...
    'src', ...
    'segmentation', ...
    'datasets');

imageOutputFolder = fullfile( ...
    outputRoot, ...
    'multiclass_images');

maskOutputFolder = fullfile( ...
    outputRoot, ...
    'multiclass_masks');

if ~isfolder(imageOutputFolder)
    mkdir(imageOutputFolder);
end

if ~isfolder(maskOutputFolder)
    mkdir(maskOutputFolder);
end

%% ============================================================
% 3. Image size
% =============================================================

targetSize = [512 512];

%% ============================================================
% 4. Complete training image IDs
% ============================================================

imageIDs = {
    'IDRiD_03'
    'IDRiD_08'
    'IDRiD_13'
    'IDRiD_14'
    'IDRiD_17'
    'IDRiD_18'
    'IDRiD_19'
    'IDRiD_22'
    'IDRiD_23'
    'IDRiD_25'
    'IDRiD_30'
    'IDRiD_31'
    'IDRiD_32'
    'IDRiD_33'
    'IDRiD_35'
    'IDRiD_38'
    'IDRiD_39'
    'IDRiD_46'
    'IDRiD_47'
    'IDRiD_48'
    'IDRiD_49'
    'IDRiD_50'
    'IDRiD_51'
    'IDRiD_52'
    'IDRiD_53'
    'IDRiD_54'
};

%% ============================================================
% 5. Display configuration
% =============================================================

fprintf('============================================\n');
fprintf('IDRiD MULTICLASS DATASET PREPARATION\n');
fprintf('============================================\n');

fprintf('Number of images: %d\n', numel(imageIDs));
fprintf('Target image size: %d x %d\n\n', ...
    targetSize(1), targetSize(2));

%% ============================================================
% 6. Process every image
% =============================================================

for i = 1:numel(imageIDs)

    imageID = imageIDs{i};

    fprintf('[%02d/%02d] Processing %s ... ', ...
        i, numel(imageIDs), imageID);

    %% --------------------------------------------------------
    % Original image
    % ---------------------------------------------------------

    originalImageFile = fullfile( ...
        originalImageRoot, ...
        [imageID '.jpg']);

    if ~isfile(originalImageFile)

        error('Original image not found:\n%s', ...
            originalImageFile);

    end

    originalImage = imread(originalImageFile);

    %% --------------------------------------------------------
    % Ground-truth mask filenames
    % ---------------------------------------------------------

    maFile = fullfile( ...
        groundTruthRoot, ...
        '1. Microaneurysms', ...
        [imageID '_MA.tif']);

    heFile = fullfile( ...
        groundTruthRoot, ...
        '2. Haemorrhages', ...
        [imageID '_HE.tif']);

    exFile = fullfile( ...
        groundTruthRoot, ...
        '3. Hard Exudates', ...
        [imageID '_EX.tif']);

    seFile = fullfile( ...
        groundTruthRoot, ...
        '4. Soft Exudates', ...
        [imageID '_SE.tif']);

    odFile = fullfile( ...
        groundTruthRoot, ...
        '5. Optic Disc', ...
        [imageID '_OD.tif']);

    %% --------------------------------------------------------
    % Check all five masks
    % ---------------------------------------------------------

    maskFiles = {
        maFile
        heFile
        exFile
        seFile
        odFile
    };

    for k = 1:numel(maskFiles)

        if ~isfile(maskFiles{k})

            error('Missing mask for %s:\n%s', ...
                imageID, maskFiles{k});

        end

    end

    %% --------------------------------------------------------
    % Read masks
    % ---------------------------------------------------------

    ma = imread(maFile);
    he = imread(heFile);
    ex = imread(exFile);
    se = imread(seFile);
    od = imread(odFile);

    %% --------------------------------------------------------
    % Convert to logical
    % ---------------------------------------------------------

    ma = ma > 0;
    he = he > 0;
    ex = ex > 0;
    se = se > 0;
    od = od > 0;

    %% --------------------------------------------------------
    % Check dimensions
    % ---------------------------------------------------------

    if ~isequal(size(ma), size(he)) || ...
       ~isequal(size(ma), size(ex)) || ...
       ~isequal(size(ma), size(se)) || ...
       ~isequal(size(ma), size(od))

        error('Mask dimensions do not match for %s.', imageID);

    end

    %% --------------------------------------------------------
    % Create multiclass mask
    % ---------------------------------------------------------

    multiclassMask = zeros(size(ma), 'uint8');

    % Background = 0
    % MA         = 1
    % HE         = 2
    % EX         = 3
    % SE         = 4
    % OD         = 5

    multiclassMask(ma) = 1;
    multiclassMask(he) = 2;
    multiclassMask(ex) = 3;
    multiclassMask(se) = 4;
    multiclassMask(od) = 5;

    %% --------------------------------------------------------
    % Detect overlapping annotations
    % ---------------------------------------------------------

    overlapCount = ...
        double(ma) + ...
        double(he) + ...
        double(ex) + ...
        double(se) + ...
        double(od);

    overlapPixels = overlapCount > 1;

    % 255 = Ignore
    multiclassMask(overlapPixels) = 255;

    %% --------------------------------------------------------
    % Resize original image
    % ---------------------------------------------------------

    resizedImage = imresize( ...
        originalImage, ...
        targetSize, ...
        'bilinear');

    %% --------------------------------------------------------
    % Resize multiclass mask
    % ---------------------------------------------------------

    resizedMask = imresize( ...
        multiclassMask, ...
        targetSize, ...
        'nearest');

    %% --------------------------------------------------------
    % Save image
    % ---------------------------------------------------------

    imageOutputFile = fullfile( ...
        imageOutputFolder, ...
        [imageID '.png']);

    imwrite(resizedImage, imageOutputFile);

    %% --------------------------------------------------------
    % Save multiclass mask
    % ---------------------------------------------------------

    maskOutputFile = fullfile( ...
        maskOutputFolder, ...
        [imageID '.png']);

    imwrite(resizedMask, maskOutputFile);

    %% --------------------------------------------------------
    % Statistics
    % ---------------------------------------------------------

    overlapPixelsOriginal = nnz(overlapPixels);

    fprintf('OK | Overlap pixels: %d\n', ...
        overlapPixelsOriginal);

end

%% ============================================================
% 7. Verify generated files
% =============================================================

generatedImages = dir( ...
    fullfile(imageOutputFolder, '*.png'));

generatedMasks = dir( ...
    fullfile(maskOutputFolder, '*.png'));

fprintf('\n============================================\n');
fprintf('DATASET PREPARATION COMPLETE\n');
fprintf('============================================\n');

fprintf('Images generated: %d\n', ...
    numel(generatedImages));

fprintf('Masks generated:  %d\n', ...
    numel(generatedMasks));

fprintf('Image output folder:\n%s\n\n', ...
    imageOutputFolder);

fprintf('Mask output folder:\n%s\n', ...
    maskOutputFolder);

%% ============================================================
% 8. Verify one generated mask
% =============================================================

testMaskFile = fullfile( ...
    maskOutputFolder, ...
    'IDRiD_03.png');

if isfile(testMaskFile)

    testMask = imread(testMaskFile);

    fprintf('\nVerification of IDRiD_03 mask:\n');
    fprintf('Size: %d x %d\n', ...
        size(testMask,1), ...
        size(testMask,2));

    fprintf('Unique labels:\n');
    disp(unique(testMask)');

    figure('Name', 'Generated Multiclass Mask - IDRiD_03');

    imagesc(testMask);
    axis image;
    colorbar;

    title('Generated Multiclass Mask - IDRiD\_03');

else

    warning('IDRiD_03 generated mask was not found.');

end

fprintf('\n============================================\n');
fprintf('READY FOR NEXT STEP\n');
fprintf('============================================\n');