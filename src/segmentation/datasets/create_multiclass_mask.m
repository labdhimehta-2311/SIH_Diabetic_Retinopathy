%% create_multiclass_mask.m
% Create and inspect a multiclass segmentation mask for one IDRiD image.
%
% Class labels:
%   0   = Background
%   1   = Microaneurysms (MA)
%   2   = Haemorrhages (HE)
%   3   = Hard Exudates (EX)
%   4   = Soft Exudates (SE)
%   5   = Optic Disc (OD)
%   255 = Ignore / overlapping annotations

clear;
clc;
close all;

%% ============================================================
% 1. Project and dataset paths
% =============================================================

% Current MATLAB project:
% C:\Users\ANGEL ACHARYA\SIH\Segmentation_Project\
%
% Inside it:
%   A. Segmentation\
%   SIH_Diabetic_Retinopathy\

projectRoot = 'C:\Users\ANGEL ACHARYA\SIH\Segmentation_Project';

% Raw IDRiD segmentation dataset
basePath = fullfile( ...
    projectRoot, ...
    'A. Segmentation', ...
    '2. All Segmentation Groundtruths', ...
    'a. Training Set');

fprintf('Project root:\n%s\n\n', projectRoot);
fprintf('Segmentation dataset:\n%s\n\n', basePath);

%% ============================================================
% 2. Select one image for testing
% =============================================================

imageID = 'IDRiD_03';

fprintf('Processing image: %s\n\n', imageID);

%% ============================================================
% 3. Define mask folders
% =============================================================

maFolder = fullfile(basePath, '1. Microaneurysms');
heFolder = fullfile(basePath, '2. Haemorrhages');
exFolder = fullfile(basePath, '3. Hard Exudates');
seFolder = fullfile(basePath, '4. Soft Exudates');
odFolder = fullfile(basePath, '5. Optic Disc');

%% ============================================================
% 4. Define mask filenames
% =============================================================

maFile = fullfile(maFolder, [imageID '_MA.tif']);
heFile = fullfile(heFolder, [imageID '_HE.tif']);
exFile = fullfile(exFolder, [imageID '_EX.tif']);
seFile = fullfile(seFolder, [imageID '_SE.tif']);
odFile = fullfile(odFolder, [imageID '_OD.tif']);

%% ============================================================
% 5. Check that all five masks exist
% =============================================================

filesToCheck = {
    maFile
    heFile
    exFile
    seFile
    odFile
};

fprintf('Checking mask files...\n');

for k = 1:numel(filesToCheck)

    if ~isfile(filesToCheck{k})
        error('Missing mask file:\n%s', filesToCheck{k});
    end

end

fprintf('All five mask files found successfully.\n\n');

%% ============================================================
% 6. Read the five binary masks
% =============================================================

ma = imread(maFile);
he = imread(heFile);
ex = imread(exFile);
se = imread(seFile);
od = imread(odFile);

%% ============================================================
% 7. Convert masks to logical
% =============================================================

ma = ma > 0;
he = he > 0;
ex = ex > 0;
se = se > 0;
od = od > 0;

%% ============================================================
% 8. Verify mask dimensions
% =============================================================

fprintf('Mask dimensions:\n');

fprintf('MA: %d x %d\n', size(ma,1), size(ma,2));
fprintf('HE: %d x %d\n', size(he,1), size(he,2));
fprintf('EX: %d x %d\n', size(ex,1), size(ex,2));
fprintf('SE: %d x %d\n', size(se,1), size(se,2));
fprintf('OD: %d x %d\n\n', size(od,1), size(od,2));

if ~isequal(size(ma), size(he)) || ...
   ~isequal(size(ma), size(ex)) || ...
   ~isequal(size(ma), size(se)) || ...
   ~isequal(size(ma), size(od))

    error('The five masks do not have identical dimensions.');

end

%% ============================================================
% 9. Create multiclass mask
% =============================================================

% Start everything as background.
multiclassMask = zeros(size(ma), 'uint8');

% Assign class labels.
multiclassMask(ma) = 1;
multiclassMask(he) = 2;
multiclassMask(ex) = 3;
multiclassMask(se) = 4;
multiclassMask(od) = 5;

%% ============================================================
% 10. Detect overlapping annotations
% =============================================================

overlapCount = ...
    double(ma) + ...
    double(he) + ...
    double(ex) + ...
    double(se) + ...
    double(od);

overlapPixels = overlapCount > 1;

% Mark overlapping pixels as Ignore.
multiclassMask(overlapPixels) = 255;

%% ============================================================
% 11. Display statistics
% =============================================================

fprintf('============================================\n');
fprintf('MULTICLASS MASK STATISTICS\n');
fprintf('============================================\n');

fprintf('Image ID:           %s\n', imageID);

fprintf('Image size:         %d x %d\n', ...
    size(multiclassMask,1), ...
    size(multiclassMask,2));

fprintf('\n');

fprintf('Background pixels:  %d\n', nnz(multiclassMask == 0));
fprintf('MA pixels:          %d\n', nnz(multiclassMask == 1));
fprintf('HE pixels:          %d\n', nnz(multiclassMask == 2));
fprintf('EX pixels:          %d\n', nnz(multiclassMask == 3));
fprintf('SE pixels:          %d\n', nnz(multiclassMask == 4));
fprintf('OD pixels:          %d\n', nnz(multiclassMask == 5));
fprintf('Ignore pixels:      %d\n', nnz(multiclassMask == 255));

fprintf('\n');

fprintf('Total overlapping pixels: %d\n', nnz(overlapPixels));

fprintf('============================================\n');

%% ============================================================
% 12. Display individual masks
% =============================================================

figure('Name', 'Individual Ground Truth Masks');

subplot(2,3,1);
imshow(ma);
title('MA - Microaneurysms');

subplot(2,3,2);
imshow(he);
title('HE - Haemorrhages');

subplot(2,3,3);
imshow(ex);
title('EX - Hard Exudates');

subplot(2,3,4);
imshow(se);
title('SE - Soft Exudates');

subplot(2,3,5);
imshow(od);
title('OD - Optic Disc');

%% ============================================================
% 13. Display multiclass mask
% =============================================================

figure('Name', 'Multiclass Segmentation Mask');

imagesc(multiclassMask);
axis image;
colorbar;

title(['Multiclass Mask - ' imageID]);

%% ============================================================
% 14. Display overlap pixels
% =============================================================

figure('Name', 'Overlapping Annotation Pixels');

imshow(overlapPixels);

title(['Overlapping Pixels - ' imageID]);

%% ============================================================
% 15. Display original retinal image
% =============================================================

originalImagePath = fullfile( ...
    projectRoot, ...
    'A. Segmentation', ...
    '1. Original Images', ...
    'a. Training Set', ...
    [imageID '.jpg']);

fprintf('\nOriginal image path:\n%s\n', originalImagePath);

if isfile(originalImagePath)

    originalImage = imread(originalImagePath);

    figure('Name', 'Original Retinal Image');

    imshow(originalImage);

    title(['Original Image - ' imageID]);

else

    fprintf('\nWARNING: Original image was not found.\n');

end

%% ============================================================
% 16. Display unique labels
% =============================================================

uniqueLabels = unique(multiclassMask);

fprintf('\nUnique labels present in multiclass mask:\n');
disp(uniqueLabels');

%% ============================================================
% 17. Completion message
% =============================================================

fprintf('\n============================================\n');
fprintf('SCRIPT COMPLETED SUCCESSFULLY\n');
fprintf('============================================\n');