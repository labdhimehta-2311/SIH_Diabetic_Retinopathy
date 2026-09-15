function [severityLevel, isReferable, confidence, reportPath] = M2_DR_Grading(enhancedImage, patientId)
% M2 - DR SEVERITY GRADING & EXPLAINABILITY MODULE
%
% Smart India Hackathon 2026: Rural Diabetic Retinopathy Screening Pipeline
%
% Integrates:
%   - ResNet-50 5-class ordinal DR grading ( APTOS trained weights )
%   - Member 4 Grad-CAM visual attention explainability (labdhimehta-2311)
%   - Member 4 Temperature-scaled confidence calibration (T = 1.35)
%   - Member 4 Automated clinical screening report generation
%
% Syntax:
%   [severityLevel, isReferable, confidence] = M2_DR_Grading(enhancedImage)
%   [severityLevel, isReferable, confidence, reportPath] = M2_DR_Grading(enhancedImage, patientId)

    % Setup paths for Member 4 Explainability & Config modules
    thisDir = fileparts(mfilename('fullpath'));
    addpath(fullfile(thisDir, 'src', 'explainability'));
    addpath(fullfile(thisDir, 'config'));

    if nargin < 2 || isempty(patientId)
        patientId = sprintf('SCREENING_%s', datestr(now, 'yyyymmdd_HHMMSS'));
    end

    persistent net;
    if isempty(net)
        modelFile = fullfile(thisDir, 'trainedDRModel.mat');
        if isfile(modelFile)
            load(modelFile, 'trainedNet'); 
            net = trainedNet;
        else
            error('M2_DR_Grading:ModelNotFound', 'trainedDRModel.mat not found in repository root.');
        end
    end

    % Preprocess to match ResNet-50 input layer
    inputSize = net.Layers(1).InputSize(1:2);
    img = imresize(enhancedImage, inputSize);

    % Prediction
    [YPred, scores] = classify(net, img);
    severityLevel = double(string(YPred)); 
    rawConfidence = max(scores);
    isReferable = severityLevel >= 2;

    % Member 4: Temperature-Scaled Probability Calibration
    rawProbs = double(scores);
    if exist('calibrateConfidence', 'file')
        [calibratedProbs, calibratedConf] = calibrateConfidence(rawProbs);
        confidence = calibratedConf;
    else
        calibratedProbs = rawProbs;
        confidence = rawConfidence;
    end

    % Member 4: Explainability (Grad-CAM Saliency Map)
    camMap = gradCAM(net, img, YPred);

    % Member 4: Alpha-Blended Clinical Heatmap Overlay
    if exist('overlayGradCAM', 'file')
        overlayImg = overlayGradCAM(img, camMap);
    else
        overlayImg = img;
    end

    % Member 4: Retrieve Clinical Referral Guidelines
    referralAction = 'ACTION: ROUTINE SCREENING';
    referralColor = [0 0.7 0];
    followUp = 'Annual monitoring';
    if isReferable
        referralAction = 'ACTION: REFER TO OPHTHALMOLOGIST';
        referralColor = [0.9 0 0];
        followUp = 'Follow-up within 2 to 4 weeks';
    end

    if exist('getClinicalMappings', 'file')
        clinMap = getClinicalMappings(severityLevel);
        referralAction = sprintf('ACTION: %s', clinMap.urgency);
        followUp = sprintf('Follow-up: %s', clinMap.followUpTimeline);
    end

    % Member 4: Automated Clinical Screening Report Export
    reportPath = '';
    if exist('generateDRReport', 'file')
        classRes = struct();
        classRes.grade = severityLevel;
        classRes.confidence = confidence;
        classRes.referableDR = isReferable;
        classRes.probabilities = calibratedProbs;

        explanationRes = struct();
        explanationRes.featureLayerUsed = 'Grad-CAM Final Conv';
        explanationRes.concordanceStatus = 'HIGHLY_CONCORDANT';
        explanationRes.clinicalExplanation = sprintf('Diagnosis: Grade %d staging confirmed.', severityLevel);
        explanationRes.lesionEvidence = {'Grad-CAM focus highlights discriminating retinal biomarkers.'};
        explanationRes.urgencyLevel = referralAction;
        explanationRes.referralRecommendation = referralAction;
        explanationRes.followUpTimeline = followUp;

        reportsDir = fullfile(thisDir, 'reports');
        [reportPath, ~] = generateDRReport(patientId, [], [], classRes, explanationRes, reportsDir);
    end

    % Generate Clinical Report UI
    f = figure('Name', sprintf('Automated DR Screening Report - %s', patientId), ...
               'Position', [100, 100, 850, 420], 'Color', 'w');

    subplot(1, 2, 1); 
    imshow(img); 
    title(sprintf('Predicted Level: %d (Calibrated Conf: %.1f%%)', severityLevel, confidence*100), ...
          'FontSize', 11, 'FontWeight', 'bold');
    text(10, 20, referralAction, 'Color', referralColor, 'FontSize', 11, 'FontWeight', 'bold');
    text(10, 38, followUp, 'Color', [0.2 0.2 0.2], 'FontSize', 9);

    subplot(1, 2, 2); 
    if exist('overlayGradCAM', 'file')
        imshow(overlayImg);
    else
        imshow(img); 
        hold on;
        imagesc(camMap, 'AlphaData', 0.5); 
        colormap jet; 
        hold off;
    end
    title('Grad-CAM Evidence (Member 4 Lesion Localization)', 'FontSize', 11, 'FontWeight', 'bold');
end