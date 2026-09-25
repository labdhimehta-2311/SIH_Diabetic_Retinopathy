%% test_M3_R4_adapter.m
% Experimental test for R4 Multilabel U-Net M3 Adapter
%
% This test verifies that the experimental R4 model can produce
% an M3-compatible segmentation result.
%
% Production M3 is NOT modified by this test.

clear;
clc;
close all;

fprintf('\n');
fprintf('============================================================\n');
fprintf('        TESTING R4 MULTILABEL M3 ADAPTER\n');
fprintf('============================================================\n');

%% PROJECT ROOT

projectRoot = fileparts(mfilename('fullpath'));

matlabDir = fullfile(projectRoot,'..','backend','matlab');

addpath(matlabDir);

%% TEST IMAGE

testImage = fullfile( ...
    projectRoot, ...
    '..', ...
    'data', ...
    'samples', ...
    'sample_grade0_normal.png');

%% CHECK TEST IMAGE

if ~exist(testImage,'file')

    error(['Test image not found:\n%s'], testImage);

end

fprintf('\nTest image:\n%s\n',testImage);

%% RUN R4 ADAPTER

fprintf('\nRunning experimental R4 adapter...\n');

img = imread(testImage);

resultR4 = M3_R4_Multilabel_Adapter(img);

%% VERIFY EXPERIMENTAL FLAG

assert( ...
    isfield(resultR4,'experimental') && resultR4.experimental == true, ...
    'R4 experimental flag is missing or false.');

%% VERIFY REQUIRED M3 FIELDS

requiredFields = { ...
    'mask', ...
    'overlay', ...
    'classNames', ...
    'pixelCounts', ...
    'percentages', ...
    'meanConfidence', ...
    'classConfidence', ...
    'probabilities', ...
    'summary', ...
    'modelFile'};

for k = 1:numel(requiredFields)

    assert( ...
        isfield(resultR4,requiredFields{k}), ...
        'Missing required result field: %s', ...
        requiredFields{k});

end

%% VERIFY CLASS COUNT

assert( ...
    numel(resultR4.classNames) == 6, ...
    'R4 adapter must return exactly 6 classes.');

assert( ...
    numel(resultR4.pixelCounts) == 6, ...
    'R4 adapter must return 6 pixel counts.');

%% VERIFY MASK

assert( ...
    ismatrix(resultR4.mask), ...
    'R4 mask must be a 2-D matrix.');

%% VERIFY PROBABILITY MAP

assert( ...
    ndims(resultR4.probabilities) == 3 && ...
    size(resultR4.probabilities,3) == 6, ...
    'R4 probabilities must contain 6 channels.');

%% DISPLAY CLASS SUMMARY

fprintf('\n');
fprintf('============================================================\n');
fprintf('                  R4 CLASS SUMMARY\n');
fprintf('============================================================\n');

disp(resultR4.summary);

%% DISPLAY ORIGINAL IMAGE

figure('Name','R4 Original Image');

imshow(img);

title('Original Fundus Image');

%% DISPLAY PREDICTED MASK

figure('Name','R4 Predicted Mask');

imagesc(resultR4.mask);

axis image off;

title('R4 Experimental Segmentation Mask');

colorbar;

%% DISPLAY OVERLAY

figure('Name','R4 Segmentation Overlay');

imshow(resultR4.overlay);

title('R4 Experimental Segmentation Overlay');

%% PRINT IMPORTANT RESULTS

fprintf('\n');
fprintf('============================================================\n');
fprintf('              R4 PREDICTION RESULTS\n');
fprintf('============================================================\n');

for classID = 0:5

    fprintf('%-20s : %8d pixels | %7.3f %%\n', ...
        resultR4.classNames{classID+1}, ...
        resultR4.pixelCounts(classID+1), ...
        resultR4.percentages(classID+1));

end

fprintf('\nMean confidence: %.4f\n', ...
    resultR4.meanConfidence);

fprintf('\nModel:\n%s\n', ...
    resultR4.modelFile);

fprintf('\n');
fprintf('============================================================\n');
fprintf('        R4 M3 ADAPTER TEST PASSED SUCCESSFULLY\n');
fprintf('============================================================\n');

fprintf('\nProduction M3 was NOT modified.\n');
fprintf('R4 remains experimental.\n');

fprintf('\n');
