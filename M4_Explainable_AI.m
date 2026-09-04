function [explanationRes, reportPath] = M4_Explainable_AI(enhancedImage, net, severityLevel, confidence, patientId)
% M4 - EXPLAINABLE AI, GRAD-CAM & CLINICAL REPORTING MODULE
%
% Smart India Hackathon 2026: Rural Diabetic Retinopathy Screening Pipeline
% Member 4 Contribution (labdhimehta-2311)
%
% Syntax:
%   M4_Explainable_AI()                                       % Runs self-contained demo on sample fundus
%   explanationRes = M4_Explainable_AI(enhancedImage)
%   [explanationRes, reportPath] = M4_Explainable_AI(enhancedImage, net, severityLevel, confidence, patientId)
%
% Inputs:
%   enhancedImage - RGB fundus image (from M1 quality enhancement or raw)
%   net           - (Optional) Trained ResNet-50 network (from trainedDRModel.mat)
%   severityLevel - (Optional) Integer DR severity grade (0 to 4)
%   confidence    - (Optional) Raw prediction confidence [0.0, 1.0]
%   patientId     - (Optional) Patient identifier string
%
% Outputs:
%   explanationRes - Struct containing Grad-CAM maps, overlays, and clinical evidence
%   reportPath     - File path to the exported telemedicine clinical report
%
% Authors: SIH 2026 Team (Member 4 - Explainable AI: labdhimehta-2311)

    % Setup search paths
    thisDir = fileparts(mfilename('fullpath'));
    addpath(fullfile(thisDir, 'src', 'explainability'));
    addpath(fullfile(thisDir, 'config'));

    % Self-contained demo if called with no arguments
    if nargin < 1 || isempty(enhancedImage)
        fprintf('===============================================================\n');
        fprintf('  M4: EXPLAINABLE AI & CLINICAL REPORTING MODULE DEMO\n');
        fprintf('  Smart India Hackathon 2026 | Member 4: labdhimehta-2311\n');
        fprintf('===============================================================\n');

        sampleFile = fullfile(thisDir, 'data', 'samples', 'sample_grade2_moderate.png');
        if ~isfile(sampleFile)
            % Fallback: generate a synthetic fundus disc for demonstration
            fprintf('[INFO] Generating synthetic fundus image for demonstration...\n');
            [xx, yy] = meshgrid(1:224, 1:224);
            dist = sqrt((xx - 112).^2 + (yy - 112).^2);
            enhancedImage = uint8(zeros(224, 224, 3));
            enhancedImage(:,:,1) = uint8(max(0, 180 - dist * 1.1));
            enhancedImage(:,:,2) = uint8(max(0, 90 - dist * 0.7));
            enhancedImage(:,:,3) = uint8(max(0, 20 - dist * 0.2));
        else
            enhancedImage = imread(sampleFile);
        end
        patientId = 'DEMO_PATIENT_004';
    end

    if nargin < 5 || isempty(patientId)
        patientId = sprintf('PATIENT_%s', datestr(now, 'yyyymmdd_HHMMSS'));
    end

    % 1. Load Pretrained Model if Not Supplied
    persistent cachedNet;
    if (nargin < 2 || isempty(net))
        if isempty(cachedNet)
            modelFile = fullfile(thisDir, 'trainedDRModel.mat');
            if isfile(modelFile)
                fprintf('[M4] Loading trainedDRModel.mat...\n');
                m = load(modelFile);
                if isfield(m, 'trainedNet')
                    cachedNet = m.trainedNet;
                else
                    fields = fieldnames(m);
                    cachedNet = m.(fields{1});
                end
            end
        end
        net = cachedNet;
    end

    % 2. Derive Prediction & Probabilities if Not Supplied
    if nargin < 3 || isempty(severityLevel) || isempty(confidence)
        if ~isempty(net)
            inputSize = [224 224];
            if isprop(net, 'Layers') && ~isempty(net.Layers) && isprop(net.Layers(1), 'InputSize')
                inputSize = net.Layers(1).InputSize(1:2);
            end
            resizedImg = imresize(enhancedImage, inputSize);
            [YPred, scores] = classify(net, resizedImg);
            severityLevel = double(string(YPred));
            rawProbs = double(scores);
        else
            % Default moderate DR for demonstration
            severityLevel = 2;
            rawProbs = [0.04, 0.12, 0.72, 0.08, 0.04];
        end
    else
        % Construct synthetic raw probabilities centered at severityLevel
        rawProbs = zeros(1, 5);
        rawProbs(severityLevel + 1) = confidence;
        remProb = (1.0 - confidence) / 4.0;
        for k = 1:5
            if k ~= (severityLevel + 1)
                rawProbs(k) = remProb;
            end
        end
    end

    % 3. Apply Temperature-Scaled Probability Calibration (Guo et al. 2017)
    [calibratedProbs, calibratedConf, eceReduction, calInfo] = calibrateConfidence(rawProbs);

    % 4. Generate Explainability: Grad-CAM Activation Saliency & Blended Overlay
    targetClass = severityLevel;
    [camMap, featureLayer] = generateGradCAM(enhancedImage, net, targetClass);
    camOverlay = overlayGradCAM(enhancedImage, camMap);

    % 5. Cross-Correlate Lesion Evidence & Staging Concordance
    classRes = struct();
    classRes.grade = severityLevel;
    classRes.confidence = calibratedConf;
    classRes.referableDR = (severityLevel >= 2);
    classRes.probabilities = calibratedProbs;

    explanationRes = generateClinicalEvidence(enhancedImage, [], [], classRes, net);
    explanationRes.gradCAMMap = camMap;
    explanationRes.gradCAMOverlay = camOverlay;
    explanationRes.featureLayerUsed = featureLayer;
    explanationRes.calibratedConfidence = calibratedConf;
    explanationRes.rawConfidence = max(rawProbs);
    explanationRes.eceReduction = eceReduction;
    explanationRes.calibratedProbs = calibratedProbs;

    % 6. Export Standardized Clinical Screening Report
    reportsDir = fullfile(thisDir, 'reports');
    [reportPath, reportText] = generateDRReport(patientId, [], [], classRes, explanationRes, reportsDir);

    % 7. Render 4-Panel Clinical Explainability Dashboard
    f = figure('Name', sprintf('M4 Screening & Explainability Dashboard - %s', patientId), ...
               'Position', [80, 80, 1000, 700], 'Color', 'w');

    % Panel 1: Original / Enhanced Fundus
    subplot(2, 2, 1);
    imshow(enhancedImage);
    title('Input Fundus Image', 'FontSize', 11, 'FontWeight', 'bold');

    % Panel 2: Continuous Grad-CAM Activation Map
    subplot(2, 2, 2);
    imagesc(camMap);
    colormap(gca, 'jet');
    colorbar;
    title(sprintf('Grad-CAM Activation Map (%s)', featureLayer), 'FontSize', 11, 'FontWeight', 'bold');
    axis image off;

    % Panel 3: Alpha-Blended Clinical Overlay
    subplot(2, 2, 3);
    imshow(camOverlay);
    title('Clinical Saliency Heatmap Overlay', 'FontSize', 11, 'FontWeight', 'bold');

    % Panel 4: Clinical Staging, Calibrated Confidence & Referral
    subplot(2, 2, 4);
    axis off;
    hold on;
    y = 0.95;
    text(0.05, y, sprintf('Patient ID: %s', patientId), 'FontSize', 11, 'FontWeight', 'bold'); y = y - 0.12;
    text(0.05, y, sprintf('Predicted Severity: Grade %d', severityLevel), 'FontSize', 12, 'FontWeight', 'bold'); y = y - 0.10;
    text(0.05, y, sprintf('Calibrated Confidence: %.1f%% (Raw: %.1f%%)', calibratedConf*100, max(rawProbs)*100), 'FontSize', 10); y = y - 0.10;
    
    if classRes.referableDR
        text(0.05, y, 'STATUS: REFERABLE DR (Positive)', 'FontSize', 11, 'FontWeight', 'bold', 'Color', [0.8 0 0]);
    else
        text(0.05, y, 'STATUS: NON-REFERABLE DR (Routine)', 'FontSize', 11, 'FontWeight', 'bold', 'Color', [0 0.6 0]);
    end
    y = y - 0.10;

    text(0.05, y, sprintf('Concordance: [%s]', explanationRes.concordanceStatus), 'FontSize', 10, 'Color', [0 0 0.8]); y = y - 0.10;
    text(0.05, y, sprintf('Urgency: %s', explanationRes.urgencyLevel), 'FontSize', 10, 'FontWeight', 'bold'); y = y - 0.10;
    text(0.05, y, sprintf('Timeline: %s', explanationRes.followUpTimeline), 'FontSize', 10); y = y - 0.10;
    text(0.05, y, sprintf('Report: %s', reportPath), 'FontSize', 8, 'Interpreter', 'none', 'Color', [0.3 0.3 0.3]);

    fprintf('\n[M4] Successfully processed Explainability for Patient: %s\n', patientId);
    fprintf('[M4] Grade: %d | Calibrated Conf: %.2f%% | Urgency: %s\n', ...
        severityLevel, calibratedConf*100, explanationRes.urgencyLevel);
    fprintf('[M4] Full clinical report saved to: %s\n', reportPath);
end
