% RUN_PIPELINE_DEMO End-to-End SIH 2026 DR Screening Pipeline Demonstration
%
% Integrates:
%   - Module 1: Fundus Image Quality Enhancement
%   - Module 2: ResNet-50 5-Class Severity Staging
%   - Module 4: Explainable AI, Grad-CAM & Clinical Reporting (Member 4: labdhimehta-2311)
%
% Usage:
%   run_pipeline_demo

clc; clear; close all;

fprintf('========================================================================\n');
fprintf('  SMART INDIA HACKATHON 2026: RURAL DR SCREENING PIPELINE DEMO\n');
fprintf('  Integrated Pipeline: M1 (Enhancement) -> M2 (Grading) -> M4 (XAI)\n');
fprintf('========================================================================\n\n');

% Set up paths
rootDir = fileparts(mfilename('fullpath'));
addpath(rootDir);
addpath(fullfile(rootDir, 'config'));
addpath(fullfile(rootDir, 'src', 'explainability'));

% Select sample image
sampleDir = fullfile(rootDir, 'data', 'samples');
sampleImages = { ...
    'sample_grade2_moderate.png', ...
    'sample_grade0_normal.png', ...
    'sample_grade1_mild.png', ...
    'sample_grade3_severe.png', ...
    'sample_grade4_pdr.png' ...
};

selectedImage = fullfile(sampleDir, sampleImages{1});
if ~isfile(selectedImage)
    error('Sample image not found: %s', selectedImage);
end

fprintf('[STAGE 1] Loading raw fundus capture: %s\n', sampleImages{1});
rawImg = imread(selectedImage);

% Stage 2: Adaptive Enhancement (M1 CLAHE / Normalization)
fprintf('[STAGE 2] Applying M1 Quality Enhancement (Adaptive CLAHE in Lab Space)...\n');
if isa(rawImg, 'uint8')
    labImg = rgb2lab(rawImg);
    L = labImg(:,:,1) / 100;
    L_clahe = adapthisteq(L, 'ClipLimit', 0.02, 'Distribution', 'rayleigh');
    labImg(:,:,1) = L_clahe * 100;
    enhancedImg = lab2rgb(labImg);
    enhancedImg = im2uint8(enhancedImg);
else
    enhancedImg = rawImg;
end

% Stage 3 & 4: Staging and Explainable AI (M2 & M4)
fprintf('[STAGE 3 & 4] Running M2 DR Grading & Member 4 Explainable AI (Grad-CAM)...\n');
patientId = sprintf('RURAL_PHC_%04d', randi([1000, 9999]));

% Execute M2 DR Grading
[severityLevel, isReferable, confidence, reportPath] = M2_DR_Grading(enhancedImg, patientId);

fprintf('\n------------------------------------------------------------------------\n');
fprintf('SCREENING RESULTS SUMMARY:\n');
fprintf('  Patient ID:               %s\n', patientId);
fprintf('  Predicted DR Grade:       Grade %d\n', severityLevel);
fprintf('  Calibrated Confidence:    %.2f%%\n', confidence * 100);
if isReferable
    fprintf('  Clinical Triage:          [POSITIVE] Referable Diabetic Retinopathy\n');
else
    fprintf('  Clinical Triage:          [NEGATIVE] Non-Referable (Routine Follow-up)\n');
end
fprintf('  Screening Report Path:    %s\n', reportPath);
fprintf('========================================================================\n');
