function result = M3_R4_Multilabel_Adapter(inputImage, outputPath)
%% M3_R4_Multilabel_Adapter
% Experimental R4 multilabel U-Net adapter.
%
% Converts the 5-channel R4 sigmoid output into the existing
% M3-compatible 6-class result structure.
%
% R4 channels:
%   1 = MA
%   2 = HE
%   3 = Hard Exudates
%   4 = Soft Exudates
%   5 = Optic Disc
%
% M3 mask:
%   0 = Background
%   1 = MA
%   2 = HE
%   3 = Hard Exudates
%   4 = Soft Exudates
%   5 = Optic Disc
%
% NOTE:
% This is experimental. Production M3_Segmentation_Interface.m
% is intentionally not modified.

%% CLASS DEFINITIONS

classNames = { ...
    'Background', ...
    'Microaneurysms', ...
    'Haemorrhages', ...
    'Hard Exudates', ...
    'Soft Exudates', ...
    'Optic Disc'};

%% R4 MODEL

modelFile = fullfile( ...
    fileparts(mfilename('fullpath')), ...
    'R4_multilabel_unet_FINAL.mat');

if ~exist(modelFile,'file')
    error(['R4 model not found:\n%s\n\n' ...
        'Place R4_multilabel_unet_FINAL.mat beside this adapter.'], ...
        modelFile);
end

modelData = load(modelFile);

if ~isfield(modelData,'net')
    error('R4 model file does not contain variable "net".');
end

net = modelData.net;

%% INPUT SIZE

inputSize = [512 512 3];

%% READ INPUT

if ischar(inputImage) || isstring(inputImage)

    inputPath = char(inputImage);

    if ~exist(inputPath,'file')
        error('Input image does not exist:\n%s',inputPath);
    end

    originalImage = imread(inputPath);

else

    originalImage = inputImage;

end

%% VALIDATE INPUT

if isempty(originalImage)
    error('Input image is empty.');
end

if ndims(originalImage) ~= 3 || size(originalImage,3) ~= 3
    error('Input must be an RGB image with size H x W x 3.');
end

originalSize = size(originalImage);

%% PREPARE IMAGE

I = im2single(originalImage);

I = imresize(I,inputSize(1:2));

%% R4 PREDICTION

% R4 was trained using SSC input for a single image.

dlX = dlarray(I,'SSC');

dlYPred = predict(net,dlX);

Y = gather(extractdata(dlYPred));

Y = squeeze(Y);

if ndims(Y) ~= 3 || size(Y,3) ~= 5
    error('Unexpected R4 output dimensions. Expected H x W x 5.');
end

%% SIGMOID

probabilitiesR4 = 1 ./ (1 + exp(-Y));

%% CONVERT MULTILABEL OUTPUT TO SINGLE M3 CLASS

% A pixel is assigned to the R4 class with the highest probability
% only when that probability reaches the experimental threshold.
%
% This resolves multilabel overlaps deterministically.

threshold = 0.50;

[maxProbability, r4Class] = max(probabilitiesR4,[],3);

predictedMask = uint8(r4Class);

backgroundMask = maxProbability < threshold;

predictedMask(backgroundMask) = 0;

%% REMOVE SMALL COMPONENTS

noiseThreshold = 15;

filteredMask = zeros(size(predictedMask),'uint8');

for classID = 1:5

    binaryClassMask = predictedMask == classID;

    cleanBinaryMask = ...
        bwareaopen(binaryClassMask,noiseThreshold);

    filteredMask(cleanBinaryMask) = uint8(classID);

end

predictedMask = filteredMask;

%% RESIZE MASK

predictedMask = imresize( ...
    predictedMask, ...
    originalSize(1:2), ...
    'nearest');

%% RESIZE PROBABILITIES

probabilitiesOriginal = zeros( ...
    originalSize(1), ...
    originalSize(2), ...
    6, ...
    'single');

% Background probability is represented as the complement
% of the strongest R4 lesion probability.

maxR4Probability = max(probabilitiesR4,[],3);

probabilitiesOriginal(:,:,1) = ...
    imresize(1-maxR4Probability,originalSize(1:2),'bilinear');

for c = 1:5

    probabilitiesOriginal(:,:,c+1) = ...
        imresize(probabilitiesR4(:,:,c), ...
        originalSize(1:2),'bilinear');

end

%% NORMALIZE PROBABILITIES

probabilitySum = sum(probabilitiesOriginal,3);

probabilitiesOriginal = ...
    probabilitiesOriginal ./ max(probabilitySum,eps);

%% PIXEL COUNTS

pixelCounts = zeros(6,1);

for classID = 0:5

    pixelCounts(classID+1) = ...
        nnz(predictedMask == classID);

end

%% PERCENTAGES

totalPixels = numel(predictedMask);

percentages = ...
    100 * pixelCounts / totalPixels;

%% CONFIDENCE

maxProbabilityOriginal = ...
    max(probabilitiesOriginal,[],3);

meanConfidence = ...
    mean(maxProbabilityOriginal(:));

classConfidence = zeros(6,1);

for classID = 0:5

    classPixels = predictedMask == classID;

    if nnz(classPixels) > 0

        classConfidence(classID+1) = ...
            mean(maxProbabilityOriginal(classPixels));

    end

end

%% OVERLAY

overlay = originalImage;

labelChannel = zeros(originalSize(1),originalSize(2),'uint8');

labelChannel = predictedMask;

alpha = 0.45;

for channel = 1:3

    baseChannel = double(originalImage(:,:,channel));

    colorChannel = double(labelChannel);

    foregroundMask = predictedMask > 0;

    blendedChannel = baseChannel;

    blendedChannel(foregroundMask) = ...
        (1-alpha) * baseChannel(foregroundMask) + ...
        alpha * (255 * colorChannel(foregroundMask) / 5);

    overlay(:,:,channel) = uint8(blendedChannel);

end

%% SUMMARY

summaryTable = table( ...
    classNames(:), ...
    pixelCounts, ...
    percentages, ...
    classConfidence, ...
    'VariableNames', ...
    {'Class','PixelCount','Percentage','MeanConfidence'});

%% OUTPUT

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
result.r4Threshold = threshold;
result.experimental = true;

%% OPTIONAL OUTPUT IMAGE

if nargin > 1 && ~isempty(outputPath)

    imwrite(overlay,outputPath);

end

fprintf('\n');
fprintf('============================================================\n');
fprintf('             R4 EXPERIMENTAL M3 ADAPTER\n');
fprintf('============================================================\n');
fprintf('Model:\n%s\n',modelFile);
fprintf('Threshold: %.2f\n',threshold);
fprintf('\n');

for classID = 0:5

    fprintf( ...
        '%-20s : %8d pixels | %7.3f %% | confidence %.4f\n', ...
        classNames{classID+1}, ...
        pixelCounts(classID+1), ...
        percentages(classID+1), ...
        classConfidence(classID+1));

end

fprintf('\nMean prediction confidence: %.4f\n',meanConfidence);
fprintf('============================================================\n');

end
