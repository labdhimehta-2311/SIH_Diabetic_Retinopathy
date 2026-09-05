%% build_unet.m
% Build a multiclass U-Net for IDRiD retinal lesion segmentation.
%
% Input:
%   512 x 512 x 3 RGB retinal image
%
% Output:
%   512 x 512 x 6 class probabilities
%
% Classes:
%   0 = Background
%   1 = Microaneurysms
%   2 = Haemorrhages
%   3 = Hard Exudates
%   4 = Soft Exudates
%   5 = Optic Disc
%
% Note:
%   Overlapping ground-truth pixels are stored as 255 in the masks.
%   They will be handled later using an ignore mask during training.

clear;
clc;
close all;

%% ============================================================
% 1. Network configuration
% =============================================================

inputSize = [512 512 3];
numClasses = 6;

fprintf('============================================\n');
fprintf('BUILDING MULTICLASS U-NET\n');
fprintf('============================================\n');

fprintf('Input size:  %d x %d x %d\n', ...
    inputSize(1), inputSize(2), inputSize(3));

fprintf('Number of classes: %d\n\n', numClasses);

%% ============================================================
% 2. Create U-Net layers
% =============================================================

layers = [

    % ---------------------------------------------------------
    % INPUT
    % ---------------------------------------------------------

    imageInputLayer(inputSize, ...
        'Name', 'input', ...
        'Normalization', 'none')


    % ---------------------------------------------------------
    % ENCODER BLOCK 1
    % ---------------------------------------------------------

    convolution2dLayer(3, 32, ...
        'Padding', 'same', ...
        'Name', 'enc1_conv1')

    reluLayer('Name', 'enc1_relu1')

    convolution2dLayer(3, 32, ...
        'Padding', 'same', ...
        'Name', 'enc1_conv2')

    reluLayer('Name', 'enc1_relu2')


    % ---------------------------------------------------------
    % POOL 1
    % ---------------------------------------------------------

    maxPooling2dLayer(2, ...
        'Stride', 2, ...
        'Name', 'pool1')


    % ---------------------------------------------------------
    % ENCODER BLOCK 2
    % ---------------------------------------------------------

    convolution2dLayer(3, 64, ...
        'Padding', 'same', ...
        'Name', 'enc2_conv1')

    reluLayer('Name', 'enc2_relu1')

    convolution2dLayer(3, 64, ...
        'Padding', 'same', ...
        'Name', 'enc2_conv2')

    reluLayer('Name', 'enc2_relu2')


    % ---------------------------------------------------------
    % POOL 2
    % ---------------------------------------------------------

    maxPooling2dLayer(2, ...
        'Stride', 2, ...
        'Name', 'pool2')


    % ---------------------------------------------------------
    % ENCODER BLOCK 3
    % ---------------------------------------------------------

    convolution2dLayer(3, 128, ...
        'Padding', 'same', ...
        'Name', 'enc3_conv1')

    reluLayer('Name', 'enc3_relu1')

    convolution2dLayer(3, 128, ...
        'Padding', 'same', ...
        'Name', 'enc3_conv2')

    reluLayer('Name', 'enc3_relu2')


    % ---------------------------------------------------------
    % POOL 3
    % ---------------------------------------------------------

    maxPooling2dLayer(2, ...
        'Stride', 2, ...
        'Name', 'pool3')


    % ---------------------------------------------------------
    % ENCODER BLOCK 4
    % ---------------------------------------------------------

    convolution2dLayer(3, 256, ...
        'Padding', 'same', ...
        'Name', 'enc4_conv1')

    reluLayer('Name', 'enc4_relu1')

    convolution2dLayer(3, 256, ...
        'Padding', 'same', ...
        'Name', 'enc4_conv2')

    reluLayer('Name', 'enc4_relu2')


    % ---------------------------------------------------------
    % POOL 4
    % ---------------------------------------------------------

    maxPooling2dLayer(2, ...
        'Stride', 2, ...
        'Name', 'pool4')


    % ---------------------------------------------------------
    % BOTTLENECK
    % ---------------------------------------------------------

    convolution2dLayer(3, 512, ...
        'Padding', 'same', ...
        'Name', 'bridge_conv1')

    reluLayer('Name', 'bridge_relu1')

    convolution2dLayer(3, 512, ...
        'Padding', 'same', ...
        'Name', 'bridge_conv2')

    reluLayer('Name', 'bridge_relu2')


    % ---------------------------------------------------------
    % DECODER BLOCK 4
    % ---------------------------------------------------------

    transposedConv2dLayer(2, 256, ...
        'Stride', 2, ...
        'Name', 'up4')

    concatenationLayer(3, 2, ...
        'Name', 'concat4')

    convolution2dLayer(3, 256, ...
        'Padding', 'same', ...
        'Name', 'dec4_conv1')

    reluLayer('Name', 'dec4_relu1')

    convolution2dLayer(3, 256, ...
        'Padding', 'same', ...
        'Name', 'dec4_conv2')

    reluLayer('Name', 'dec4_relu2')


    % ---------------------------------------------------------
    % DECODER BLOCK 3
    % ---------------------------------------------------------

    transposedConv2dLayer(2, 128, ...
        'Stride', 2, ...
        'Name', 'up3')

    concatenationLayer(3, 2, ...
        'Name', 'concat3')

    convolution2dLayer(3, 128, ...
        'Padding', 'same', ...
        'Name', 'dec3_conv1')

    reluLayer('Name', 'dec3_relu1')

    convolution2dLayer(3, 128, ...
        'Padding', 'same', ...
        'Name', 'dec3_conv2')

    reluLayer('Name', 'dec3_relu2')


    % ---------------------------------------------------------
    % DECODER BLOCK 2
    % ---------------------------------------------------------

    transposedConv2dLayer(2, 64, ...
        'Stride', 2, ...
        'Name', 'up2')

    concatenationLayer(3, 2, ...
        'Name', 'concat2')

    convolution2dLayer(3, 64, ...
        'Padding', 'same', ...
        'Name', 'dec2_conv1')

    reluLayer('Name', 'dec2_relu1')

    convolution2dLayer(3, 64, ...
        'Padding', 'same', ...
        'Name', 'dec2_conv2')

    reluLayer('Name', 'dec2_relu2')


    % ---------------------------------------------------------
    % DECODER BLOCK 1
    % ---------------------------------------------------------

    transposedConv2dLayer(2, 32, ...
        'Stride', 2, ...
        'Name', 'up1')

    concatenationLayer(3, 2, ...
        'Name', 'concat1')

    convolution2dLayer(3, 32, ...
        'Padding', 'same', ...
        'Name', 'dec1_conv1')

    reluLayer('Name', 'dec1_relu1')

    convolution2dLayer(3, 32, ...
        'Padding', 'same', ...
        'Name', 'dec1_conv2')

    reluLayer('Name', 'dec1_relu2')


    % ---------------------------------------------------------
    % OUTPUT
    % ---------------------------------------------------------

    convolution2dLayer(1, numClasses, ...
        'Padding', 'same', ...
        'Name', 'class_conv')

    softmaxLayer('Name', 'softmax')

];

%% ============================================================
% 3. Convert layers into a layer graph
% =============================================================

lgraph = layerGraph(layers);

%% ============================================================
% 4. Connect U-Net skip connections
% =============================================================

% Encoder 1 -> Decoder 1
lgraph = connectLayers( ...
    lgraph, ...
    'enc1_relu2', ...
    'concat1/in2');

% Encoder 2 -> Decoder 2
lgraph = connectLayers( ...
    lgraph, ...
    'enc2_relu2', ...
    'concat2/in2');

% Encoder 3 -> Decoder 3
lgraph = connectLayers( ...
    lgraph, ...
    'enc3_relu2', ...
    'concat3/in2');

% Encoder 4 -> Decoder 4
lgraph = connectLayers( ...
    lgraph, ...
    'enc4_relu2', ...
    'concat4/in2');

%% ============================================================
% 5. Create dlnetwork
% =============================================================

net = dlnetwork(lgraph);

%% ============================================================
% 6. Display network information
% =============================================================

fprintf('U-Net created successfully.\n\n');

fprintf('Network summary:\n');

summary(net);

%% ============================================================
% 7. Display network graph
% =============================================================

figure('Name', 'Multiclass U-Net Architecture');

plot(net);

title('Multiclass U-Net - IDRiD Segmentation');

%% ============================================================
% 8. Save initial network
% =============================================================

projectRoot = ...
    'C:\Users\ANGEL ACHARYA\SIH\Segmentation_Project';

modelFolder = fullfile( ...
    projectRoot, ...
    'SIH_Diabetic_Retinopathy', ...
    'src', ...
    'segmentation', ...
    'trained_models');

if ~isfolder(modelFolder)
    mkdir(modelFolder);
end

modelFile = fullfile( ...
    modelFolder, ...
    'unet_multiclass_initial.mat');

save(modelFile, 'net');

fprintf('\n============================================\n');
fprintf('NETWORK SAVED\n');
fprintf('============================================\n');

fprintf('File:\n%s\n', modelFile);

fprintf('\n============================================\n');
fprintf('U-NET BUILD COMPLETED SUCCESSFULLY\n');
fprintf('============================================\n');