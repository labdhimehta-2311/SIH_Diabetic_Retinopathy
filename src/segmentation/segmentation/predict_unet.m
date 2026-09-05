%% predict_unet.m
% M3 - Multiclass Diabetic Retinopathy Segmentation
%
% Predicts the segmentation of one preprocessed retinal image.
%
% Classes:
%   0 = Background
%   1 = Microaneurysms
%   2 = Haemorrhages
%   3 = Hard Exudates
%   4 = Soft Exudates
%   5 = Optic Disc
%   255 = Ignore / ambiguous overlap
%
% NOTE:
% The current trained model is only a 5-epoch preliminary model.
% This script is reusable with the final trained model.

clear;
clc;
close all;

fprintf('\n');
fprintf('============================================================\n');
fprintf('        M3 MULTICLASS U-NET PREDICTION\n');
fprintf('============================================================\n');

%% ------------------------------------------------------------
% 1. SETTINGS
% -------------------------------------------------------------

% Image to predict
imageID = 'IDRiD_17';

% Model to use
modelName = 'unet_multiclass_best.mat';

inputSize = [512 512 3];

classNames = {
    'Background'
    'Microaneurysms'
    'Haemorrhages'
    'Hard Exudates'
    'Soft Exudates'
    'Optic Disc'
    };

%% ------------------------------------------------------------
% 2. PATHS
% -------------------------------------------------------------

projectRoot = pwd;

datasetDir = fullfile( ...
    projectRoot, ...
    'src', ...
    'segmentation', ...
    'datasets');

imageDir = fullfile( ...
    datasetDir, ...
    'multiclass_images');

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

predictionDir = fullfile( ...
    outputDir, ...
    'predictions');

overlayDir = fullfile( ...
    outputDir, ...
    'overlays');

if ~exist(outputDir, 'dir')
    mkdir(outputDir);
end

if ~exist(predictionDir, 'dir')
    mkdir(predictionDir);
end

if ~exist(overlayDir, 'dir')
    mkdir(overlayDir);
end

%% ------------------------------------------------------------
% 3. MODEL FILE
% -------------------------------------------------------------

modelFile = fullfile(modelDir, modelName);

if ~isfile(modelFile)

    error( ...
        'Model file not found:\n%s', ...
        modelFile);

end

fprintf('\nLoading model:\n%s\n', modelFile);

S = load(modelFile);

if ~isfield(S, 'net')

    error( ...
        'The model file does not contain a variable named "net".');

end

net = S.net;

fprintf('Model loaded successfully.\n');

%% ------------------------------------------------------------
% 4. INPUT IMAGE
% -------------------------------------------------------------

imageFile = fullfile( ...
    imageDir, ...
    [imageID '.png']);

if ~isfile(imageFile)

    error( ...
        'Input image not found:\n%s', ...
        imageFile);

end

fprintf('\nLoading image:\n%s\n', imageFile);

I = imread(imageFile);

fprintf('Original input size: ');
disp(size(I));

%% ------------------------------------------------------------
% 5. PREPARE IMAGE
% -------------------------------------------------------------

I = im2single(I);

% Make sure image has exactly the expected dimensions
if ~isequal(size(I), inputSize)

    error( ...
        'Unexpected image size. Expected [%d %d %d].', ...
        inputSize(1), ...
        inputSize(2), ...
        inputSize(3));

end

% Add batch dimension
X = reshape(I, [512 512 3 1]);

% Convert to dlarray
dlX = dlarray(X, 'SSCB');

%% ------------------------------------------------------------
% 6. RUN U-NET PREDICTION
% -------------------------------------------------------------

fprintf('\nRunning U-Net prediction...\n');

dlY = predict(net, dlX);

% Convert dlarray to MATLAB array
Y = extractdata(dlY);

% Remove batch dimension
Y = Y(:,:,:,1);

fprintf('Prediction probability size: ');
disp(size(Y));

%% ------------------------------------------------------------
% 7. CHECK SOFTMAX
% -------------------------------------------------------------

probabilitySum = sum(Y, 3);

fprintf('\nSoftmax probability check:\n');

fprintf('Minimum sum: %.6f\n', ...
    min(probabilitySum, [], 'all'));

fprintf('Maximum sum: %.6f\n', ...
    max(probabilitySum, [], 'all'));

fprintf('Mean sum: %.6f\n', ...
    mean(probabilitySum, 'all'));

%% ------------------------------------------------------------
% 8. CONVERT PROBABILITIES TO CLASS LABELS
% -------------------------------------------------------------

[~, predictedMask] = max(Y, [], 3);

% MATLAB max returns:
%
%   1 = Background
%   2 = Microaneurysms
%   3 = Haemorrhages
%   4 = Hard Exudates
%   5 = Soft Exudates
%   6 = Optic Disc
%
% Convert to our class numbering:
%
%   0 = Background
%   1 = Microaneurysms
%   ...
%   5 = Optic Disc

predictedMask = uint8(predictedMask - 1);

%% ------------------------------------------------------------
% 9. DISPLAY PREDICTED CLASS COUNTS
% -------------------------------------------------------------

fprintf('\n');
fprintf('============================================================\n');
fprintf('              PREDICTION CLASS COUNTS\n');
fprintf('============================================================\n');

for classID = 0:5

    count = nnz(predictedMask == classID);

    fprintf( ...
        'Class %d (%-18s): %d pixels\n', ...
        classID, ...
        classNames{classID + 1}, ...
        count);

end

fprintf('\nPredicted labels found:\n');
disp(unique(predictedMask)');

%% ------------------------------------------------------------
% 10. SAVE PREDICTED MASK
% -------------------------------------------------------------

predictionFile = fullfile( ...
    predictionDir, ...
    [imageID '_prediction.png']);

imwrite(predictedMask, predictionFile);

fprintf('\nPredicted mask saved to:\n%s\n', ...
    predictionFile);

%% ------------------------------------------------------------
% 11. DISPLAY ORIGINAL IMAGE
% -------------------------------------------------------------

figure;

imshow(I);

title( ...
    ['Original Retinal Image - ' imageID], ...
    'Interpreter', 'none');

%% ------------------------------------------------------------
% 12. DISPLAY PREDICTED MASK
% -------------------------------------------------------------

figure;

imagesc(predictedMask);

axis image off;

title( ...
    ['Predicted Multiclass Segmentation - ' imageID], ...
    'Interpreter', 'none');

cb = colorbar;

caxis([0 5]);

cb.Ticks = 0:5;

cb.TickLabels = {
    'Background'
    'MA'
    'HE'
    'Hard EX'
    'Soft EX'
    'OD'
    };

%% ------------------------------------------------------------
% 13. CREATE COLORED SEGMENTATION IMAGE
% -------------------------------------------------------------

% Create RGB image for visualization
coloredMask = zeros(512, 512, 3, 'uint8');

% Visualization colors:
%
% Background      = black
% Microaneurysms  = red
% Haemorrhages    = green
% Hard Exudates   = blue
% Soft Exudates   = yellow
% Optic Disc      = cyan

% Microaneurysms
idx = predictedMask == 1;
coloredMask(:,:,1) = ...
    coloredMask(:,:,1) + uint8(idx) * 255;

% Haemorrhages
idx = predictedMask == 2;
coloredMask(:,:,2) = ...
    coloredMask(:,:,2) + uint8(idx) * 255;

% Hard Exudates
idx = predictedMask == 3;
coloredMask(:,:,3) = ...
    coloredMask(:,:,3) + uint8(idx) * 255;

% Soft Exudates
idx = predictedMask == 4;

coloredMask(:,:,1) = ...
    coloredMask(:,:,1) + uint8(idx) * 255;

coloredMask(:,:,2) = ...
    coloredMask(:,:,2) + uint8(idx) * 255;

% Optic Disc
idx = predictedMask == 5;

coloredMask(:,:,2) = ...
    coloredMask(:,:,2) + uint8(idx) * 255;

coloredMask(:,:,3) = ...
    coloredMask(:,:,3) + uint8(idx) * 255;

%% ------------------------------------------------------------
% 14. DISPLAY COLORED SEGMENTATION
% -------------------------------------------------------------

figure;

imshow(coloredMask);

title( ...
    ['Colored Segmentation - ' imageID], ...
    'Interpreter', 'none');

%% ------------------------------------------------------------
% 15. SAVE COLORED SEGMENTATION
% -------------------------------------------------------------

coloredMaskFile = fullfile( ...
    overlayDir, ...
    [imageID '_segmentation.png']);

imwrite(coloredMask, coloredMaskFile);

fprintf('Colored segmentation saved to:\n%s\n', ...
    coloredMaskFile);

%% ------------------------------------------------------------
% 16. CREATE OVERLAY
% -------------------------------------------------------------

% Convert original image to uint8
baseImage = im2uint8(I);

% Blend original image and segmentation.
%
% Only foreground predictions are overlaid.
% Background remains the original retinal image.

overlay = baseImage;

foreground = predictedMask > 0;

% Blend segmentation with original image
alpha = 0.45;

overlay(:,:,1) = uint8( ...
    (1 - alpha) * double(baseImage(:,:,1)) + ...
    alpha * double(coloredMask(:,:,1)) );

overlay(:,:,2) = uint8( ...
    (1 - alpha) * double(baseImage(:,:,2)) + ...
    alpha * double(coloredMask(:,:,2)) );

overlay(:,:,3) = uint8( ...
    (1 - alpha) * double(baseImage(:,:,3)) + ...
    alpha * double(coloredMask(:,:,3)) );

% Restore original pixels for background
for channel = 1:3

    temp = overlay(:,:,channel);
    original = baseImage(:,:,channel);

    temp(~foreground) = original(~foreground);

    overlay(:,:,channel) = temp;

end

%% ------------------------------------------------------------
% 17. DISPLAY OVERLAY
% -------------------------------------------------------------

figure;

imshow(overlay);

title( ...
    ['Segmentation Overlay - ' imageID], ...
    'Interpreter', 'none');

%% ------------------------------------------------------------
% 18. SAVE OVERLAY
% -------------------------------------------------------------

overlayFile = fullfile( ...
    overlayDir, ...
    [imageID '_overlay.png']);

imwrite(overlay, overlayFile);

fprintf('\nOverlay saved to:\n%s\n', ...
    overlayFile);

%% ------------------------------------------------------------
% 19. FINAL SUMMARY
% -------------------------------------------------------------

fprintf('\n');
fprintf('============================================================\n');
fprintf('              PREDICTION COMPLETED\n');
fprintf('============================================================\n');

fprintf('Image ID: %s\n', imageID);

fprintf('\nOutput files:\n');
fprintf('Prediction:\n%s\n', predictionFile);

fprintf('\nColored segmentation:\n%s\n', coloredMaskFile);

fprintf('\nOverlay:\n%s\n', overlayFile);

fprintf('\nM3 prediction pipeline completed successfully.\n');
fprintf('============================================================\n');