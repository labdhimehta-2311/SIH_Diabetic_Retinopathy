%% M3_Segmentation.m
% M3 - Diabetic Retinopathy Segmentation Module
%
% Main user-facing M3 module.
%
% This module:
%   1. Selects a fundus image
%   2. Sends it to M3_Segmentation_Interface
%   3. Displays the original image
%   4. Displays the segmentation result
%   5. Displays the segmentation overlay
%   6. Displays class statistics
%
% The same interface can be called directly by M5/M6:
%
%   result = M3_Segmentation_Interface(image);

clc;
clear;
close all;

fprintf('\n');
fprintf('============================================================\n');
fprintf('        M3 - DIABETIC RETINOPATHY SEGMENTATION\n');
fprintf('============================================================\n');

%% PROJECT PATH

projectRoot = fileparts(mfilename('fullpath'));

addpath(projectRoot);

%% SELECT FUNDUS IMAGE

fprintf('\nSelect a fundus image...\n');

[fileName, filePath] = uigetfile( ...
    {'*.jpg;*.jpeg;*.png;*.tif;*.tiff', ...
     'Fundus Images (*.jpg, *.jpeg, *.png, *.tif, *.tiff)'}, ...
    'Select Fundus Image');

if isequal(fileName,0)

    fprintf('\nNo image selected.\n');
    fprintf('M3 cancelled.\n');

    return;

end

inputImage = fullfile(filePath,fileName);

fprintf('\nSelected image:\n');
fprintf('%s\n',inputImage);

%% LOAD IMAGE

try

    img = imread(inputImage);

catch ME

    fprintf('\nERROR: Unable to read image.\n');
    fprintf('%s\n',ME.message);

    return;

end

%% DISPLAY ORIGINAL IMAGE

figure('Name','M3 - Original Fundus Image');

imshow(img);

title('Original Fundus Image');

%% RUN M3 SEGMENTATION

fprintf('\n');
fprintf('Running M3 segmentation...\n');

try

    result = M3_Segmentation_Interface(img);

catch ME

    fprintf('\nERROR during M3 segmentation.\n');
    fprintf('%s\n',ME.message);

    return;

end

fprintf('Segmentation completed successfully.\n');

%% DISPLAY SEGMENTATION MASK

figure('Name','M3 - Segmentation Mask');

imshow(result.mask,[]);

title('M3 Multiclass Segmentation Mask');

%% DISPLAY OVERLAY

figure('Name','M3 - Segmentation Overlay');

imshow(result.overlay);

title('M3 Segmentation Overlay');

%% DISPLAY CLASS STATISTICS

fprintf('\n');
fprintf('============================================================\n');
fprintf('              M3 SEGMENTATION RESULTS\n');
fprintf('============================================================\n');

fprintf('\nModel used:\n');
fprintf('%s\n',result.modelFile);

fprintf('\nClass statistics:\n');

fprintf('------------------------------------------------------------\n');
fprintf('%-20s %-15s %-15s\n', ...
    'Class','Pixel Count','Percentage');
fprintf('------------------------------------------------------------\n');

for i = 1:numel(result.classNames)

    fprintf('%-20s %-15d %-15.4f%%\n', ...
        result.classNames{i}, ...
        result.pixelCounts(i), ...
        result.percentages(i));

end

fprintf('------------------------------------------------------------\n');

fprintf('\nMean confidence: %.4f\n', ...
    result.meanConfidence);

%% DISPLAY SUMMARY

fprintf('\nSegmentation summary:\n');
disp(result.summary);

%% FINISHED

fprintf('\n');
fprintf('============================================================\n');
fprintf('             M3 MODULE COMPLETED SUCCESSFULLY\n');
fprintf('============================================================\n');

fprintf('\nM3 is ready to provide segmentation results to M5/M6.\n');

fprintf('\nInterface usage for M5/M6:\n');
fprintf('result = M3_Segmentation_Interface(image);\n');

fprintf('\n============================================================\n');