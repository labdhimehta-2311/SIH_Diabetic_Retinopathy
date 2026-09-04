function explanationResult = generateClinicalEvidence(img, qualityRes, lesionRes, classRes, net)
% GENERATECLINICALEVIDENCE Master synthesis module fusing Grad-CAM, lesion evidence, and clinical recommendations
%
% Syntax:
%   explanationResult = generateClinicalEvidence(img, classRes)
%   explanationResult = generateClinicalEvidence(img, qualityRes, lesionRes, classRes)
%   explanationResult = generateClinicalEvidence(img, qualityRes, lesionRes, classRes, net)
%
% Inputs:
%   img        - RGB fundus image (uint8 or double)
%   qualityRes - (Optional) Struct from quality assessment
%   lesionRes  - (Optional) Struct from lesion segmentation
%   classRes   - Struct or integer indicating predicted DR grade
%   net        - (Optional) Trained neural network object
%
% Outputs:
%   explanationResult - Standardized XAI struct containing:
%       .gradCAMMap              - Continuous activation heatmap [0.0, 1.0]
%       .gradCAMOverlay          - Heatmap blended over RGB fundus image
%       .featureLayerUsed        - Name of convolutional layer inspected
%       .lesionEvidence          - Cell array of objective pathophysiological findings
%       .clinicalExplanation     - Cohesive narrative report for attending ophthalmologist
%       .referralRecommendation  - Actionable medical next step
%       .followUpTimeline        - Recommended clinical appointment timeframe
%       .urgencyLevel            - Urgency triage code ('ROUTINE' to 'URGENT')
%       .concordanceStatus       - Cross-verification status of CNN vs lesion biomarkers
%       .statutoryDisclaimer     - Mandatory medical device prototype disclaimer
%
% Authors: SIH 2026 Team (Member 4 - Explainable AI: labdhimehta-2311)

    if nargin < 1 || isempty(img)
        error('generateClinicalEvidence:EmptyInput', 'Input image cannot be empty.');
    end

    % Normalize classRes
    targetGrade = 2;
    if nargin == 2
        % Called as generateClinicalEvidence(img, classRes)
        classRes = qualityRes;
        qualityRes = [];
        lesionRes = [];
        net = [];
    elseif nargin < 3
        lesionRes = [];
        classRes = [];
        net = [];
    elseif nargin < 4
        classRes = [];
        net = [];
    elseif nargin < 5
        net = [];
    end

    if isempty(classRes)
        targetGrade = 2;
    elseif isstruct(classRes) && isfield(classRes, 'grade')
        targetGrade = classRes.grade;
    elseif isnumeric(classRes) || iscategorical(classRes) || isstring(classRes)
        targetGrade = double(string(classRes));
    end

    cfgDisclaimer = sprintf(['PROTOTYPE DECISION-SUPPORT SYSTEM FOR RESEARCH AND SCREENING EVALUATION.\n', ...
                            'Not clinically certified by CDSCO/FDA. Not a substitute for professional ophthalmic examination.']);
    if exist('projectConfig', 'file')
        cfg = projectConfig();
        cfgDisclaimer = cfg.disclaimer;
    end

    % 1. Generate Grad-CAM Activation Saliency Map
    [camMap, featureLayer] = generateGradCAM(img, net, targetGrade, lesionRes);

    % 2. Create Colormap Overlay on Fundus
    camOverlay = overlayGradCAM(img, camMap);

    % 3. Cross-Correlate Segmented Lesions with Predicted Grade
    [concordance, evidenceList, summaryNarrative, hasDiscrepancy] = ...
        correlateLesionsWithGrade(targetGrade, lesionRes);

    % 4. Retrieve Clinical Referral Protocol based on ICDR Staging
    if exist('getClinicalMappings', 'file')
        clinMap = getClinicalMappings(targetGrade);
        recommendation = clinMap.recommendation;
        followUpTimeline = clinMap.followUpTimeline;
        urgency = clinMap.urgency;
    else
        urgency = 'REFERRAL';
        if targetGrade < 2
            recommendation = 'Routine annual screening; maintain glycemic control.';
            followUpTimeline = '12 months';
            urgency = 'ROUTINE';
        else
            recommendation = 'Refer to ophthalmologist for comprehensive dilated retinal exam.';
            followUpTimeline = '4-6 weeks';
            urgency = 'REFERRAL';
        end
    end

    % If image was borderline quality, append quality advisory
    if ~isempty(qualityRes) && isstruct(qualityRes) && isfield(qualityRes, 'status')
        if strcmp(qualityRes.status, 'BORDERLINE')
            evidenceList{end+1} = 'Quality Note: Image exhibited borderline optical contrast; adaptive enhancement was applied.';
        end
    end

    if hasDiscrepancy
        evidenceList{end+1} = 'SAFETY ADVISORY: Evidentiary divergence detected between deep CNN and lesion findings. Human specialist review mandatory.';
    end

    % 5. Build Standard Explainability Contract Struct
    explanationResult = struct();
    explanationResult.gradCAMMap             = camMap;
    explanationResult.gradCAMOverlay         = camOverlay;
    explanationResult.featureLayerUsed       = featureLayer;
    explanationResult.lesionEvidence         = evidenceList;
    explanationResult.clinicalExplanation    = summaryNarrative;
    explanationResult.referralRecommendation = recommendation;
    explanationResult.followUpTimeline       = followUpTimeline;
    explanationResult.urgencyLevel           = urgency;
    explanationResult.concordanceStatus      = concordance;
    explanationResult.statutoryDisclaimer    = cfgDisclaimer;
end
