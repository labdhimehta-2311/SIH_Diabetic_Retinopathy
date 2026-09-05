function result = M3_Segmentation_Interface(inputImage)
%% M3_Segmentation_Interface.m
% M3 - Diabetic Retinopathy Segmentation Interface
%
% PURPOSE:
% Provides a stable interface for M5 and M6.
%
% INPUT:
%   inputImage
%       Can be:
%       1. A file path to an RGB fundus image
%       2. An RGB image matrix
%
% OUTPUT:
%   result
%
% result.mask
%       Predicted segmentation mask
%
%       0 = Background
%       1 = Microaneurysms
%       2 = Haemorrhages
%       3 = Hard Exudates
%       4 = Soft Exudates
%       5 = Optic Disc
%
% result.overlay
%       RGB image with segmentation overlay
%
% result.classNames
%       Names of the six classes
%
% result.pixelCounts
%       Number of predicted pixels for each class
%
% result.percentages
%       Percentage of predicted pixels for each class
%
% result.meanConfidence
%       Mean maximum prediction probability
%
% result.classConfidence
%       Mean confidence for each predicted class
%
% result.probabilities
%       Six-channel softmax probability map
%
% result.summary
%       MATLAB table containing class statistics
%
% result.modelFile
%       Model used for prediction
%
% result.inputSize
%       U-Net input size
%
% -------------------------------------------------------------------------

%% CLASS DEFINITIONS

classNames = { ...
    'Background', ...
    'Microaneurysms', ...
    'Haemorrhages', ...
    'Hard Exudates', ...
    'Soft Exudates', ...
    'Optic Disc'};

%% DETERMINE PROJECT ROOT

thisFile = mfilename('fullpath');

if isempty(thisFile)
    projectRoot = pwd;
else
    projectRoot = fileparts(thisFile);
end

%% MODEL DIRECTORY

modelDir = fullfile( ...
    projectRoot, ...
    'src', ...
    'segmentation', ...
    'trained_models');

%% SELECT MODEL

% Preferred order:
%
% 1. Improved best model
% 2. Improved final model
% 3. Baseline best model
% 4. Baseline final model
% 5. Initial model

improvedBest = fullfile( ...
    modelDir, ...
    'unet_multiclass_improved_best.mat');

improvedFinal = fullfile( ...
    modelDir, ...
    'unet_multiclass_improved_final.mat');

baselineBest = fullfile( ...
    modelDir, ...
    'unet_multiclass_best.mat');

baselineFinal = fullfile( ...
    modelDir, ...
    'unet_multiclass_final.mat');

initialModel = fullfile( ...
    modelDir, ...
    'unet_multiclass_initial.mat');

%% SELECT BEST AVAILABLE MODEL

if exist(improvedBest,'file')

    modelFile = improvedBest;

elseif exist(improvedFinal,'file')

    modelFile = improvedFinal;

elseif exist(baselineBest,'file')

    modelFile = baselineBest;

elseif exist(baselineFinal,'file')

    modelFile = baselineFinal;

elseif exist(initialModel,'file')

    modelFile = initialModel;

else

    error(['No U-Net model was found.\n' ...
        'Expected model directory:\n%s'], ...
        modelDir);

end

%% LOAD MODEL

modelData = load(modelFile,'net');

net = modelData.net;

%% INPUT SIZE

inputSize = [512 512 3];

%% READ INPUT IMAGE

if ischar(inputImage) || isstring(inputImage)

    inputPath = char(inputImage);

    if ~exist(inputPath,'file')

        error('Input image does not exist:\n%s', ...
            inputPath);

    end

    originalImage = imread(inputPath);

else

    originalImage = inputImage;

end

%% VALIDATE IMAGE

if isempty(originalImage)

    error('Input image is empty.');

end

if ndims(originalImage) ~= 3 || size(originalImage,3) ~= 3

    error('Input must be an RGB image with size H x W x 3.');

end

%% STORE ORIGINAL IMAGE

result.originalImage = originalImage;

originalSize = size(originalImage);

%% PREPARE IMAGE

I = im2single(originalImage);

% Resize to U-Net input size

I = imresize( ...
    I, ...
    inputSize(1:2));

%% CREATE DLARRAY

dlX = dlarray( ...
    reshape( ...
        I, ...
        inputSize(1), ...
        inputSize(2), ...
        3, ...
        1), ...
    'SSCB');

%% PREDICTION

dlYPred = predict(net,dlX);

%% CONVERT TO NUMERIC ARRAY

Y = gather(extractdata(dlYPred));

%% REMOVE BATCH DIMENSION

Y = squeeze(Y);

% Expected dimensions:
%
% 512 x 512 x 6

if ndims(Y) ~= 3

    error('Unexpected U-Net output dimensions.');

end

%% SOFTMAX PROBABILITIES

% The network already contains a softmax layer.
% Normalize defensively in case a different model is supplied.

sumProbabilities = sum(Y,3);

Y = Y ./ max(sumProbabilities,eps);

%% GET PREDICTED CLASS

[maxProbability, predictedClass] = max(Y,[],3);

% MATLAB indices:
%
% 1 = Background
% 2 = Microaneurysms
% 3 = Haemorrhages
% 4 = Hard Exudates
% 5 = Soft Exudates
% 6 = Optic Disc
%
% Convert to requested labels:
%
% 0 = Background
% 1 = Microaneurysms
% 2 = Haemorrhages
% 3 = Hard Exudates
% 4 = Soft Exudates
% 5 = Optic Disc

predictedMask = uint8(predictedClass - 1);

%% RESIZE MASK TO ORIGINAL IMAGE SIZE

predictedMask = imresize( ...
    predictedMask, ...
    originalSize(1:2), ...
    'nearest');

%% RESIZE PROBABILITY MAPS

probabilitiesOriginal = zeros( ...
    originalSize(1), ...
    originalSize(2), ...
    6, ...
    'single');

for c = 1:6

    probabilitiesOriginal(:,:,c) = imresize( ...
        Y(:,:,c), ...
        originalSize(1:2), ...
        'bilinear');

end

%% CALCULATE PIXEL COUNTS

pixelCounts = zeros(6,1);

for classID = 0:5

    pixelCounts(classID + 1) = ...
        nnz(predictedMask == classID);

end

%% CALCULATE PERCENTAGES

totalPixels = numel(predictedMask);

percentages = ...
    100 * pixelCounts / totalPixels;

%% CALCULATE MEAN CONFIDENCE

maxProbabilityOriginal = max( ...
    probabilitiesOriginal,[],3);

meanConfidence = ...
    mean(maxProbabilityOriginal(:));

%% CALCULATE CLASS-SPECIFIC CONFIDENCE

classConfidence = zeros(6,1);

for classID = 0:5

    classPixels = ...
        predictedMask == classID;

    if nnz(classPixels) > 0

        confidenceValues = ...
            maxProbabilityOriginal(classPixels);

        classConfidence(classID + 1) = ...
            mean(confidenceValues);

    else

        classConfidence(classID + 1) = 0;

    end

end

%% CREATE OVERLAY

% Convert original image to RGB uint8 if needed

if ~isa(originalImage,'uint8')

    overlayBase = im2uint8( ...
        mat2gray(originalImage));

else

    overlayBase = originalImage;

end

%% CREATE COLOR LABEL IMAGE

labelImage = zeros( ...
    originalSize(1), ...
    originalSize(2), ...
    3, ...
    'uint8');

% RGB colors:
%
% Background       = black
% Microaneurysms   = red
% Haemorrhages     = green
% Hard Exudates    = blue
% Soft Exudates    = yellow
% Optic Disc       = magenta

classColors = uint8([ ...
    0   0   0;
    255 0   0;
    0   255 0;
    0   0   255;
    255 255 0;
    255 0   255]);

%% APPLY CLASS COLORS

for classID = 1:5

    mask = predictedMask == classID;

    for channel = 1:3

        temp = labelImage(:,:,channel);

        temp(mask) = ...
            classColors(classID + 1,channel);

        labelImage(:,:,channel) = temp;

    end

end

%% BLEND IMAGE AND SEGMENTATION

alpha = 0.45;

overlay = overlayBase;

foregroundMask = predictedMask > 0;

for channel = 1:3

    baseChannel = ...
        single(overlayBase(:,:,channel));

    labelChannel = ...
        single(labelImage(:,:,channel));

    blendedChannel = ...
        baseChannel;

    blendedChannel(foregroundMask) = ...
        (1-alpha) * ...
        baseChannel(foregroundMask) + ...
        alpha * ...
        labelChannel(foregroundMask);

    overlay(:,:,channel) = ...
        uint8(blendedChannel);

end

%% CREATE CLASS SUMMARY TABLE

summaryTable = table( ...
    classNames(:), ...
    pixelCounts, ...
    percentages, ...
    classConfidence, ...
    'VariableNames', ...
    {'Class','PixelCount','Percentage','MeanConfidence'});

%% STORE OUTPUTS

result.mask = predictedMask;

result.overlay = overlay;

result.classNames = classNames;

result.pixelCounts = pixelCounts;

result.percentages = percentages;

result.meanConfidence = meanConfidence;

result.classConfidence = classConfidence;

result.probabilities = probabilitiesOriginal;

result.summary = summaryTable;

result.modelFile = modelFile;

result.inputSize = inputSize;

%% DISPLAY SUMMARY

fprintf('\n');
fprintf('============================================================\n');
fprintf('             M3 SEGMENTATION INTERFACE\n');
fprintf('============================================================\n');

fprintf('Model:\n%s\n',modelFile);

fprintf('\nPredicted segmentation:\n');

for classID = 0:5

    fprintf( ...
        '%-20s : %8d pixels | %7.3f %% | confidence %.4f\n', ...
        classNames{classID+1}, ...
        pixelCounts(classID+1), ...
        percentages(classID+1), ...
        classConfidence(classID+1));

end

fprintf('\nMean prediction confidence: %.4f\n', ...
    meanConfidence);

fprintf('============================================================\n');

end