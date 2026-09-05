%% test_M3_interface.m
% Test program for M3 Segmentation Interface
%
% This script tests the M3 -> M5/M6 interface using IDRiD_17.
%
% Output:
%   1. Original fundus image
%   2. Predicted segmentation mask
%   3. Segmentation overlay
%   4. Class statistics
%   5. Saved prediction, overlay and CSV summary

clear;
clc;
close all;

fprintf('\n');
fprintf('============================================================\n');
fprintf('          TESTING M3 SEGMENTATION INTERFACE\n');
fprintf('============================================================\n');

%% PROJECT ROOT

projectRoot = fileparts(mfilename('fullpath'));

%% TEST IMAGE

testImage = fullfile( ...
    projectRoot, ...
    '..', ...
    'A. Segmentation', ...
    '1. Original Images', ...
    'a. Training Set', ...
    'IDRiD_17.jpg');

%% CHECK TEST IMAGE

if ~exist(testImage,'file')

    error(['Test image not found:\n%s\n\n' ...
        'Expected dataset location:\n%s'], ...
        testImage, ...
        fullfile(projectRoot,'..','A. Segmentation'));

end

fprintf('\nTest image:\n%s\n',testImage);

%% RUN M3 SEGMENTATION

fprintf('\nRunning M3 segmentation...\n');

result = M3_Segmentation_Interface(testImage);

%% DISPLAY CLASS SUMMARY

fprintf('\n');
fprintf('============================================================\n');
fprintf('                  CLASS SUMMARY\n');
fprintf('============================================================\n');

disp(result.summary);

%% DISPLAY ORIGINAL IMAGE

figure('Name','M3 Original Image');

imshow(result.originalImage);

title('Original Fundus Image');

%% DISPLAY PREDICTED MASK

figure('Name','M3 Predicted Mask');

imagesc(result.mask);

axis image off;

title('M3 Predicted Segmentation Mask');

colorbar;

%% DISPLAY OVERLAY

figure('Name','M3 Segmentation Overlay');

imshow(result.overlay);

title('M3 Segmentation Overlay');

%% OUTPUT DIRECTORIES

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

if ~exist(predictionDir,'dir')
    mkdir(predictionDir);
end

if ~exist(overlayDir,'dir')
    mkdir(overlayDir);
end

%% SAVE PREDICTED MASK

predictionFile = fullfile( ...
    predictionDir, ...
    'M3_interface_IDRiD_17_prediction.png');

imwrite( ...
    result.mask, ...
    predictionFile);

%% SAVE OVERLAY

overlayFile = fullfile( ...
    overlayDir, ...
    'M3_interface_IDRiD_17_overlay.png');

imwrite( ...
    result.overlay, ...
    overlayFile);

%% SAVE CLASS SUMMARY

summaryFile = fullfile( ...
    overlayDir, ...
    'M3_interface_IDRiD_17_summary.csv');

writetable( ...
    result.summary, ...
    summaryFile);

%% PRINT IMPORTANT RESULTS

fprintf('\n');
fprintf('============================================================\n');
fprintf('              PREDICTION RESULTS\n');
fprintf('============================================================\n');

for classID = 0:5

    fprintf('%-20s : %8d pixels | %7.3f %%\n', ...
        result.classNames{classID+1}, ...
        result.pixelCounts(classID+1), ...
        result.percentages(classID+1));

end

fprintf('\nMean confidence: %.4f\n', ...
    result.meanConfidence);

fprintf('\n');
fprintf('============================================================\n');
fprintf('              FILES SAVED\n');
fprintf('============================================================\n');

fprintf('\nPrediction:\n%s\n',predictionFile);

fprintf('\nOverlay:\n%s\n',overlayFile);

fprintf('\nSummary:\n%s\n',summaryFile);

fprintf('\n');
fprintf('============================================================\n');
fprintf('              M3 INTERFACE TEST COMPLETE\n');
fprintf('============================================================\n');

fprintf('\nM5/M6 can call M3 using:\n\n');

fprintf('result = M3_Segmentation_Interface(image);\n\n');

fprintf('Then access:\n');
fprintf('result.mask\n');
fprintf('result.overlay\n');
fprintf('result.pixelCounts\n');
fprintf('result.percentages\n');
fprintf('result.classConfidence\n');
fprintf('result.probabilities\n');

fprintf('\n');