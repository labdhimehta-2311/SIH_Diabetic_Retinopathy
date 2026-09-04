function cfg = projectConfig()
% PROJECTCONFIG Central configuration for SIH Diabetic Retinopathy Screening System
%
% Syntax:
%   cfg = projectConfig()
%
% Outputs:
%   cfg - Struct containing system hyperparameters, thresholds,
%         architectural specifications, and relative paths.
%
% Clinical Basis:
%   Thresholds calibrated based on International Clinical Diabetic
%   Retinopathy (ICDR) disease severity guidelines and rural PHC
%   tele-ophthalmology screening constraints.
%
% Authors: SIH 2026 Team (Member 4 - Explainable AI: labdhimehta-2311)

    % Base directory (project root, relative)
    baseDir = fileparts(fileparts(mfilename('fullpath')));

    %% 1. Path Configuration (Relative Paths)
    cfg.paths = struct();
    cfg.paths.root       = baseDir;
    cfg.paths.data       = fullfile(baseDir, 'data');
    cfg.paths.samples    = fullfile(baseDir, 'data', 'samples');
    cfg.paths.reports    = fullfile(baseDir, 'reports');
    cfg.paths.models     = baseDir;

    %% 2. Deep Learning Classification Parameters
    cfg.classification = struct();
    cfg.classification.inputSize        = [224 224 3]; % Input tensor dimensions
    cfg.classification.numClasses       = 5;
    cfg.classification.classNames       = {'No DR', 'Mild', 'Moderate', 'Severe', 'Proliferative DR'};
    cfg.classification.referableClasses = [2 3 4];     % Grades considered referable DR
    cfg.classification.backbone         = 'resnet50';  % Primary transfer learning backbone
    cfg.classification.modelFile        = fullfile(baseDir, 'trainedDRModel.mat');

    %% 3. Explainability & Calibration Parameters (Member 4)
    cfg.explainability = struct();
    cfg.explainability.gradCamLayer     = 'conv5_block3_out'; % Final convolutional layer in ResNet50
    cfg.explainability.overlayAlpha     = 0.45;               % Heatmap blend transparency
    cfg.explainability.colormap         = 'turbo';            % Medical visualization colormap ('turbo' or 'jet')
    cfg.explainability.tempScaleT       = 1.35;               % Calibrated temperature scaling parameter

    %% 4. System Disclaimer
    cfg.disclaimer = sprintf(['PROTOTYPE DECISION-SUPPORT SYSTEM FOR RESEARCH AND SCREENING EVALUATION.\n', ...
                              'Not clinically certified by CDSCO/FDA. Not a substitute for professional ophthalmic examination.']);
end
