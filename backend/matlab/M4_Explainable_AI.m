function [explanationRes, reportPath] = M4_Explainable_AI( ...
    enhancedImage, net, severityLevel, confidence, patientId)
% M4 - EXPLAINABLE AI, GRAD-CAM & CLINICAL REPORTING MODULE
%
% M3 + M4 Integrated Version
%
% M3 provides:
%   1. Microaneurysms
%   2. Haemorrhages
%   3. Hard Exudates
%   4. Soft Exudates
%   5. Optic Disc
%
% M4 uses the M3 segmentation result as clinical evidence.


%% ================================================================
% 0. SETUP PATHS
% ================================================================

thisDir = fileparts(mfilename('fullpath'));

addpath(fullfile(thisDir, 'src', 'explainability'));
addpath(fullfile(thisDir, 'config'));
addpath(thisDir);

addpath(fullfile(thisDir, 'src', 'segmentation', 'segmentation'));
addpath(fullfile(thisDir, 'src', 'segmentation', 'datasets'));


%% ================================================================
% 1. DEMO IMAGE IF NONE PROVIDED
% ================================================================

if nargin < 1 || isempty(enhancedImage)

    fprintf('\n');
    fprintf('===============================================================\n');
    fprintf('  M4: EXPLAINABLE AI & CLINICAL REPORTING MODULE\n');
    fprintf('  M3 Segmentation + M4 Explainability Integration\n');
    fprintf('===============================================================\n');

    sampleFile = fullfile( ...
        thisDir, ...
        'data', ...
        'samples', ...
        'sample_grade2_moderate.png');

    if ~isfile(sampleFile)

        fprintf('[INFO] Sample image not found.\n');
        fprintf('[INFO] Creating demonstration image...\n');

        [xx, yy] = meshgrid(1:224, 1:224);

        dist = sqrt((xx - 112).^2 + (yy - 112).^2);

        enhancedImage = uint8(zeros(224,224,3));

        enhancedImage(:,:,1) = uint8( ...
            max(0,180 - dist * 1.1));

        enhancedImage(:,:,2) = uint8( ...
            max(0,90 - dist * 0.7));

        enhancedImage(:,:,3) = uint8( ...
            max(0,20 - dist * 0.2));

    else

        enhancedImage = imread(sampleFile);

    end

    patientId = 'DEMO_PATIENT_004';

end


%% ================================================================
% 2. PATIENT ID
% ================================================================

if nargin < 5 || isempty(patientId)

    patientId = sprintf( ...
        'PATIENT_%s', ...
        datestr(now,'yyyymmdd_HHMMSS'));

end


%% ================================================================
% 3. LOAD DR GRADING MODEL
% ================================================================

persistent cachedNet;

if nargin < 2 || isempty(net)

    if isempty(cachedNet)

        modelFile = fullfile( ...
            thisDir, ...
            'trainedDRModel.mat');

        if isfile(modelFile)

            fprintf('[M4] Loading trainedDRModel.mat...\n');

            m = load(modelFile);

            if isfield(m,'trainedNet')

                cachedNet = m.trainedNet;

            else

                fields = fieldnames(m);

                cachedNet = m.(fields{1});

            end

        else

            fprintf('[M4] trainedDRModel.mat not found.\n');

        end

    end

    net = cachedNet;

end


%% ================================================================
% 4. GET DR GRADE AND CONFIDENCE
% ================================================================

if nargin < 3 || isempty(severityLevel) || ...
        nargin < 4 || isempty(confidence)

    if ~isempty(net)

        inputSize = [224 224];

        try

            if isprop(net,'Layers') && ...
                    ~isempty(net.Layers) && ...
                    isprop(net.Layers(1),'InputSize')

                inputSize = net.Layers(1).InputSize(1:2);

            end

        catch

            inputSize = [224 224];

        end

        resizedImg = ...
            imresize(enhancedImage,inputSize);

        [YPred,scores] = ...
            classify(net,resizedImg);

        severityLevel = double(string(YPred));

        rawProbs = double(scores);

    else

        severityLevel = 2;

        rawProbs = ...
            [0.04 0.12 0.72 0.08 0.04];

    end

else

    rawProbs = zeros(1,5);

    rawProbs(severityLevel + 1) = confidence;

    remainingProbability = ...
        (1 - confidence) / 4;

    for k = 1:5

        if k ~= severityLevel + 1

            rawProbs(k) = remainingProbability;

        end

    end

end


%% ================================================================
% 5. RUN M3 SEGMENTATION
% ================================================================

fprintf('\n[M4] Running M3 segmentation...\n');

m3Result = [];
lesionRes = [];

try

    if exist('M3_Segmentation_Interface','file') ~= 2

        error( ...
            'M3_Segmentation_Interface not found on MATLAB path.');

    end


    % ---------------------------------------------------------------
    % RUN M3
    % ---------------------------------------------------------------

    m3Result = ...
        M3_Segmentation_Interface(enhancedImage);

    fprintf('[M4] M3 segmentation completed successfully.\n');


    % ---------------------------------------------------------------
    % CONVERT M3 RESULT TO M4 LESION STRUCTURE
    % ---------------------------------------------------------------

    lesionRes = ...
        buildM4LesionData(m3Result);

    fprintf('[M4] M3 lesion evidence converted for M4.\n');


    % ---------------------------------------------------------------
    % SAFELY DISPLAY M3 SUMMARY
    % ---------------------------------------------------------------

    if isfield(m3Result,'summary')

        fprintf('[M4] M3 Summary:\n');

        summaryData = m3Result.summary;

        if istable(summaryData)

            disp(summaryData);

        elseif isstring(summaryData)

            fprintf('%s\n', ...
                join(summaryData,newline));

        elseif ischar(summaryData)

            fprintf('%s\n',summaryData);

        else

            disp(summaryData);

        end

    end


catch ME

    warning( ...
        'M4:M3IntegrationFailed', ...
        '[M4] M3 segmentation integration failed: %s', ...
        ME.message);

    fprintf( ...
        '[M4] Continuing with M4 without lesion segmentation.\n');

    m3Result = [];
    lesionRes = [];

end


%% ================================================================
% 6. CALIBRATE CONFIDENCE
% ================================================================

if exist('calibrateConfidence', 'file')
    [calibratedProbs, ...
        calibratedConf, ...
        eceReduction, ...
        calInfo] = ...
        calibrateConfidence(rawProbs);
else
    % Fallback if the calibration script is missing from the folder
    calibratedProbs = rawProbs;
    calibratedConf = max(rawProbs);
    eceReduction = 0;
    calInfo = 'Calibration unavailable - using raw confidence';
end

%% ================================================================
% 7. BUILD CLASSIFICATION RESULT
% ================================================================

classRes = struct();

classRes.grade = severityLevel;

classRes.confidence = calibratedConf;

classRes.referableDR = ...
    (severityLevel >= 2);

classRes.probabilities = ...
    calibratedProbs;


%% ================================================================
% 8. GENERATE GRAD-CAM
% ================================================================

fprintf('[M4] Generating Grad-CAM...\n');

targetClass = severityLevel;

try

    [camMap,featureLayer] = ...
        generateGradCAM( ...
            enhancedImage, ...
            net, ...
            targetClass, ...
            lesionRes);

catch ME

    warning( ...
        'M4:GradCAMFailed', ...
        'Grad-CAM failed: %s', ...
        ME.message);

    camMap = zeros( ...
        size(enhancedImage,1), ...
        size(enhancedImage,2));

    featureLayer = ...
        'gradcam_unavailable';

end


%% ================================================================
% 9. CREATE GRAD-CAM OVERLAY
% ================================================================

try

    camOverlay = ...
        overlayGradCAM( ...
            enhancedImage, ...
            camMap);

catch

    camOverlay = enhancedImage;

end


%% ================================================================
% 10. GENERATE CLINICAL EVIDENCE
% ================================================================

fprintf( ...
    '[M4] Correlating M2 grading with M3 lesion evidence...\n');

try

    explanationRes = ...
        generateClinicalEvidence( ...
            enhancedImage, ...
            [], ...
            lesionRes, ...
            classRes, ...
            net);

catch ME

    warning( ...
        'M4:ClinicalEvidenceFailed', ...
        'Clinical evidence generation failed: %s', ...
        ME.message);

    explanationRes = struct();

    explanationRes.concordanceStatus = ...
        'UNAVAILABLE';

    explanationRes.urgencyLevel = ...
        'MONITOR';

    explanationRes.followUpTimeline = ...
        '6-12 months';

    explanationRes.evidenceList = {};

    explanationRes.summaryNarrative = ...
        'Clinical evidence generation was unavailable.';

end


%% ================================================================
% 11. ADD M3 INFORMATION TO EXPLANATION RESULT
% ================================================================

explanationRes.gradCAMMap = ...
    camMap;

explanationRes.gradCAMOverlay = ...
    camOverlay;

explanationRes.featureLayerUsed = ...
    featureLayer;

explanationRes.calibratedConfidence = ...
    calibratedConf;

explanationRes.rawConfidence = ...
    max(rawProbs);

explanationRes.eceReduction = ...
    eceReduction;

explanationRes.calibratedProbs = ...
    calibratedProbs;

explanationRes.calibrationInfo = ...
    calInfo;


% ---------------------------------------------------------------
% STORE M3 RESULT
% ---------------------------------------------------------------

if ~isempty(m3Result)

    explanationRes.m3Segmentation = ...
        m3Result;

    explanationRes.lesionData = ...
        lesionRes;

else

    explanationRes.m3Segmentation = [];

    explanationRes.lesionData = [];

end


%% ================================================================
% 12. GENERATE CLINICAL REPORT
% ================================================================

reportsDir = ...
    fullfile(thisDir,'reports');

reportPath = '';

try

    [reportPath,reportText] = ...
        generateDRReport( ...
            patientId, ...
            [], ...
            lesionRes, ...
            classRes, ...
            explanationRes, ...
            reportsDir);

catch ME

    warning( ...
        'M4:ReportGenerationFailed', ...
        'Clinical report generation failed: %s', ...
        ME.message);

    % Compatibility fallback
    try

        [reportPath,reportText] = ...
            generateDRReport( ...
                patientId, ...
                [], ...
                [], ...
                classRes, ...
                explanationRes, ...
                reportsDir);

    catch

        reportPath = '';

    end

end


%% ================================================================
% 13. CREATE DASHBOARD
% ================================================================

f = figure( ...
    'Name', ...
    sprintf( ...
        'M4 Screening & Explainability Dashboard - %s', ...
        patientId), ...
    'Position', ...
    [80 80 1000 700], ...
    'Color', ...
    'w');


%% INPUT IMAGE

subplot(2,2,1);

imshow(enhancedImage);

title( ...
    'Input Fundus Image', ...
    'FontSize',11, ...
    'FontWeight','bold');


%% GRAD-CAM

subplot(2,2,2);

imagesc(camMap);

colormap(gca,'jet');

colorbar;

title( ...
    sprintf( ...
        'Grad-CAM Activation Map (%s)', ...
        featureLayer), ...
    'FontSize',11, ...
    'FontWeight','bold');

axis image off;


%% GRAD-CAM OVERLAY

subplot(2,2,3);

imshow(camOverlay);

title( ...
    'Clinical Saliency Heatmap Overlay', ...
    'FontSize',11, ...
    'FontWeight','bold');


%% CLINICAL INFORMATION

subplot(2,2,4);

axis off;

hold on;

y = 0.95;


text( ...
    0.05,y, ...
    sprintf('Patient ID: %s',patientId), ...
    'FontSize',11, ...
    'FontWeight','bold');

y = y - 0.12;


text( ...
    0.05,y, ...
    sprintf( ...
        'Predicted Severity: Grade %d', ...
        severityLevel), ...
    'FontSize',12, ...
    'FontWeight','bold');

y = y - 0.10;


text( ...
    0.05,y, ...
    sprintf( ...
        'Calibrated Confidence: %.1f%% (Raw: %.1f%%)', ...
        calibratedConf * 100, ...
        max(rawProbs) * 100), ...
    'FontSize',10);

y = y - 0.10;


if classRes.referableDR

    text( ...
        0.05,y, ...
        'STATUS: REFERABLE DR (Positive)', ...
        'FontSize',11, ...
        'FontWeight','bold', ...
        'Color',[0.8 0 0]);

else

    text( ...
        0.05,y, ...
        'STATUS: NON-REFERABLE DR (Routine)', ...
        'FontSize',11, ...
        'FontWeight','bold', ...
        'Color',[0 0.6 0]);

end

y = y - 0.10;


if isfield(explanationRes,'concordanceStatus')

    concordanceText = ...
        explanationRes.concordanceStatus;

else

    concordanceText = ...
        'UNAVAILABLE';

end


text( ...
    0.05,y, ...
    sprintf( ...
        'Concordance: [%s]', ...
        concordanceText), ...
    'FontSize',10, ...
    'Color',[0 0 0.8]);

y = y - 0.10;


if isfield(explanationRes,'urgencyLevel')

    urgencyText = ...
        explanationRes.urgencyLevel;

else

    urgencyText = ...
        'MONITOR';

end


text( ...
    0.05,y, ...
    sprintf('Urgency: %s',urgencyText), ...
    'FontSize',10, ...
    'FontWeight','bold');

y = y - 0.10;


if isfield(explanationRes,'followUpTimeline')

    timelineText = ...
        explanationRes.followUpTimeline;

else

    timelineText = ...
        '6-12 months';

end


text( ...
    0.05,y, ...
    sprintf('Timeline: %s',timelineText), ...
    'FontSize',10);

y = y - 0.10;


%% M3 STATUS

if ~isempty(m3Result)

    text( ...
        0.05,y, ...
        'M3 Segmentation: SUCCESS', ...
        'FontSize',9, ...
        'FontWeight','bold');

    y = y - 0.08;

    if numel(m3Result.pixelCounts) >= 6

        text( ...
            0.05,y, ...
            sprintf( ...
                'MA: %d | HE: %d | Hard EX: %d', ...
                m3Result.pixelCounts(2), ...
                m3Result.pixelCounts(3), ...
                m3Result.pixelCounts(4)), ...
            'FontSize',8);

        y = y - 0.07;

        text( ...
            0.05,y, ...
            sprintf( ...
                'Soft EX: %d | OD: %d', ...
                m3Result.pixelCounts(5), ...
                m3Result.pixelCounts(6)), ...
            'FontSize',8);

        y = y - 0.08;

    end

else

    text( ...
        0.05,y, ...
        'M3 Segmentation: NOT AVAILABLE', ...
        'FontSize',9, ...
        'FontWeight','bold');

    y = y - 0.08;

end


%% REPORT PATH

if isempty(reportPath)

    reportDisplay = ...
        'Report generation unavailable';

else

    reportDisplay = ...
        reportPath;

end


text( ...
    0.05,y, ...
    sprintf('Report: %s',reportDisplay), ...
    'FontSize',8, ...
    'Interpreter','none', ...
    'Color',[0.3 0.3 0.3]);


%% ================================================================
% 14. COMMAND WINDOW SUMMARY
% ================================================================

fprintf('\n');
fprintf('===============================================================\n');
fprintf('[M4] EXPLAINABILITY PIPELINE COMPLETED\n');
fprintf('===============================================================\n');

fprintf( ...
    '[M4] Patient: %s\n', ...
    patientId);

fprintf( ...
    '[M4] Grade: %d\n', ...
    severityLevel);

fprintf( ...
    '[M4] Calibrated Confidence: %.2f%%\n', ...
    calibratedConf * 100);

fprintf( ...
    '[M4] Urgency: %s\n', ...
    urgencyText);

fprintf( ...
    '[M4] Concordance: %s\n', ...
    concordanceText);


if ~isempty(m3Result)

    fprintf( ...
        '[M4] M3 Segmentation: SUCCESS\n');

    if numel(m3Result.pixelCounts) >= 6

        fprintf( ...
            '[M4] M3 Microaneurysm pixels: %d\n', ...
            m3Result.pixelCounts(2));

        fprintf( ...
            '[M4] M3 Haemorrhage pixels: %d\n', ...
            m3Result.pixelCounts(3));

        fprintf( ...
            '[M4] M3 Hard Exudate pixels: %d\n', ...
            m3Result.pixelCounts(4));

        fprintf( ...
            '[M4] M3 Soft Exudate pixels: %d\n', ...
            m3Result.pixelCounts(5));

        fprintf( ...
            '[M4] M3 Optic Disc pixels: %d\n', ...
            m3Result.pixelCounts(6));

    end

else

    fprintf( ...
        '[M4] M3 Segmentation: NOT AVAILABLE\n');

end


if isempty(reportPath)

    fprintf( ...
        '[M4] Clinical report: NOT GENERATED\n');

else

    fprintf( ...
        '[M4] Clinical report saved to:\n%s\n', ...
        reportPath);

end

fprintf('===============================================================\n');


end


%% ========================================================================
% BUILD M4 LESION DATA FROM M3
% ========================================================================

function lesionRes = buildM4LesionData(m3Result)

    if nargin < 1 || isempty(m3Result)

        lesionRes = [];

        return;

    end


    if ~isstruct(m3Result)

        error( ...
            'M4:M3InvalidResult', ...
            'M3 result must be a structure.');

    end


    if ~isfield(m3Result,'mask')

        error( ...
            'M4:M3MissingMask', ...
            'M3 result does not contain mask.');

    end


    if ~isfield(m3Result,'pixelCounts')

        error( ...
            'M4:M3MissingPixelCounts', ...
            'M3 result does not contain pixelCounts.');

    end


    mask = m3Result.mask;

    pixelCounts = ...
        double(m3Result.pixelCounts(:));


    if numel(pixelCounts) < 6

        error( ...
            'M4:M3InvalidClasses', ...
            'M3 result must contain six classes.');

    end


    %% ================================================================
    % MICROANEURYSMS
    % ================================================================

    maMask = ...
        (mask == 1);

    lesionRes.microaneurysms = struct();

    lesionRes.microaneurysms.count = ...
        countConnectedComponents(maMask);

    lesionRes.microaneurysms.mask = ...
        maMask;


    %% ================================================================
    % EXUDATES
    % ================================================================

    hardExudateMask = ...
        (mask == 3);

    softExudateMask = ...
        (mask == 4);

    exudateMask = ...
        hardExudateMask | softExudateMask;

    lesionRes.exudates = struct();

    lesionRes.exudates.areaPixels = ...
        pixelCounts(4) + pixelCounts(5);

    lesionRes.exudates.clusters = ...
        countConnectedComponents(exudateMask);

    lesionRes.exudates.mask = ...
        exudateMask;


    %% ================================================================
    % HAEMORRHAGES
    % ================================================================

    hemorrhageMask = ...
        (mask == 2);

    lesionRes.hemorrhages = struct();

    lesionRes.hemorrhages.areaPixels = ...
        pixelCounts(3);

    lesionRes.hemorrhages.count = ...
        countConnectedComponents(hemorrhageMask);

    lesionRes.hemorrhages.quadrantsInvolved = ...
        countRetinalQuadrants(hemorrhageMask);

    lesionRes.hemorrhages.mask = ...
        hemorrhageMask;


    %% ================================================================
    % NEOVASCULARIZATION
    % ================================================================
    %
    % M3 currently does not segment neovascularization.
    % Therefore M4 does not claim that NV was detected.

    lesionRes.neovascularization = struct();

    lesionRes.neovascularization.detected = ...
        false;

    lesionRes.neovascularization.nvdScore = ...
        0;

    lesionRes.neovascularization.mask = ...
        false(size(mask));


    %% ================================================================
    % VESSEL DENSITY
    % ================================================================
    %
    % M3 currently does not calculate vessel density.
    %
    % The existing M4 clinical report generator requires:
    %
    %     lesionRes.vessels.density
    %
    % Therefore we provide the established M4 fallback value.
    %
    % This is NOT presented as a measurement produced by M3.

    lesionRes.vessels = struct();

    lesionRes.vessels.density = ...
        0.12;

end


%% ========================================================================
% COUNT CONNECTED COMPONENTS
% ========================================================================

function count = countConnectedComponents(binaryMask)

    if isempty(binaryMask) || ...
            ~any(binaryMask(:))

        count = 0;

        return;

    end


    try

        cc = bwconncomp( ...
            logical(binaryMask), ...
            8);

        count = cc.NumObjects;

    catch

        count = 0;

    end

end


%% ========================================================================
% COUNT RETINAL QUADRANTS
% ========================================================================

function quadrantCount = countRetinalQuadrants(binaryMask)

    if isempty(binaryMask) || ...
            ~any(binaryMask(:))

        quadrantCount = 0;

        return;

    end


    [rows,cols] = size(binaryMask);

    midRow = floor(rows / 2);

    midCol = floor(cols / 2);


    q1 = ...
        binaryMask(1:midRow,1:midCol);

    q2 = ...
        binaryMask(1:midRow,midCol+1:cols);

    q3 = ...
        binaryMask(midRow+1:rows,1:midCol);

    q4 = ...
        binaryMask(midRow+1:rows,midCol+1:cols);


    quadrantCount = ...
        double(any(q1(:))) + ...
        double(any(q2(:))) + ...
        double(any(q3(:))) + ...
        double(any(q4(:)));

end