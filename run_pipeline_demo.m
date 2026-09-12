%% RUN_PIPELINE_DEMO
% Complete Diabetic Retinopathy Screening Pipeline
%
% Pipeline:
%
%       M1 Enhancement
%            |
%            v
%       M2 DR Grading
%            |
%            v
%       M3 Segmentation
%            |
%            v
%       M4 Explainable AI
%            |
%            v
%       Clinical Report
%
% M3 segmentation is integrated into M4 clinical evidence.
%
% ================================================================


%% ================================================================
% 0. CLEAR ENVIRONMENT
% ================================================================

clear;
clc;
close all;


%% ================================================================
% 1. PROJECT PATH
% ================================================================

rootDir = fileparts(mfilename('fullpath'));

fprintf('\n');
fprintf('===============================================================\n');
fprintf('   SIH DIABETIC RETINOPATHY SCREENING PIPELINE\n');
fprintf('   M1 -> M2 -> M3 -> M4\n');
fprintf('===============================================================\n');

fprintf('[PIPELINE] Project root:\n%s\n', rootDir);


%% ================================================================
% 2. ADD REQUIRED PATHS
% ================================================================

addpath(rootDir);

addpath(fullfile(rootDir,'config'));

addpath(fullfile(rootDir,'src'));

addpath(fullfile(rootDir,'src','explainability'));

addpath(fullfile(rootDir,'src','segmentation'));

addpath(fullfile(rootDir,'src','segmentation','segmentation'));

addpath(fullfile(rootDir,'src','segmentation','datasets'));


%% ================================================================
% 3. VERIFY REQUIRED MODULES
% ================================================================

fprintf('\n');
fprintf('[PIPELINE] Checking required modules...\n');


% M1
if exist('adapthisteq','file') == 2
    fprintf('[PIPELINE] M1 image enhancement: AVAILABLE\n');
else
    warning('[PIPELINE] M1 enhancement dependency unavailable.');
end


% M2
if exist('M2_DR_Grading','file') == 2

    fprintf('[PIPELINE] M2 DR grading: AVAILABLE\n');

else

    error( ...
        '[PIPELINE] M2_DR_Grading.m was not found.');

end


% M3
if exist('M3_Segmentation_Interface','file') == 2

    fprintf('[PIPELINE] M3 segmentation: AVAILABLE\n');

else

    error( ...
        '[PIPELINE] M3_Segmentation_Interface.m was not found.');

end


% M4
if exist('M4_Explainable_AI','file') == 2

    fprintf('[PIPELINE] M4 explainability: AVAILABLE\n');

else

    error( ...
        '[PIPELINE] M4_Explainable_AI.m was not found.');

end


fprintf('[PIPELINE] Module check completed.\n');


%% ================================================================
% 4. SELECT SAMPLE IMAGE
% ================================================================

sampleCandidates = {

    fullfile( ...
        rootDir, ...
        'data', ...
        'samples', ...
        'sample_grade2_moderate.png')

    fullfile( ...
        rootDir, ...
        'data', ...
        'samples', ...
        'sample_grade1_mild.png')

    fullfile( ...
        rootDir, ...
        'data', ...
        'samples', ...
        'sample_grade0_normal.png')

};


sampleImagePath = '';


for k = 1:numel(sampleCandidates)

    if isfile(sampleCandidates{k})

        sampleImagePath = ...
            sampleCandidates{k};

        break;

    end

end


if isempty(sampleImagePath)

    fprintf('\n');
    fprintf('[PIPELINE] No default sample image found.\n');
    fprintf('[PIPELINE] Opening image selector...\n');

    [fileName,filePath] = ...
        uigetfile( ...
            {'*.jpg;*.jpeg;*.png;*.tif;*.tiff', ...
             'Fundus Images'}, ...
            'Select Fundus Image');

    if isequal(fileName,0)

        error( ...
            '[PIPELINE] No image selected.');

    end

    sampleImagePath = ...
        fullfile(filePath,fileName);

end


fprintf('\n');
fprintf('[PIPELINE] Input image:\n%s\n',sampleImagePath);


%% ================================================================
% 5. LOAD INPUT IMAGE
% ================================================================

inputImage = imread(sampleImagePath);


% Convert grayscale to RGB if required
if ndims(inputImage) == 2

    inputImage = ...
        repmat(inputImage,[1 1 3]);

end


% Remove alpha channel if present
if size(inputImage,3) > 3

    inputImage = ...
        inputImage(:,:,1:3);

end


fprintf( ...
    '[PIPELINE] Image size: %d x %d x %d\n', ...
    size(inputImage,1), ...
    size(inputImage,2), ...
    size(inputImage,3));


%% ================================================================
% 6. DISPLAY ORIGINAL IMAGE
% ================================================================

figure( ...
    'Name','Complete DR Pipeline', ...
    'Color','w');

subplot(2,3,1);

imshow(inputImage);

title( ...
    'Original Fundus Image', ...
    'FontWeight','bold');


%% ================================================================
% 7. M1 - IMAGE ENHANCEMENT
% ================================================================

fprintf('\n');
fprintf('===============================================================\n');
fprintf('M1 - IMAGE ENHANCEMENT\n');
fprintf('===============================================================\n');


tic;


% Convert RGB to Lab
labImage = ...
    rgb2lab(inputImage);


% Extract L channel
L = ...
    labImage(:,:,1);


% Adaptive CLAHE
LEnhanced = ...
    adapthisteq( ...
        L / 100, ...
        'ClipLimit',0.01, ...
        'NumTiles',[8 8]);


% Convert enhanced L back to Lab range
labImage(:,:,1) = ...
    LEnhanced * 100;


% Convert back to RGB
enhancedImage = ...
    lab2rgb(labImage);


% Convert to uint8
enhancedImage = ...
    im2uint8(enhancedImage);


m1Time = toc;


fprintf( ...
    '[M1] Enhancement completed in %.2f seconds.\n', ...
    m1Time);


%% ================================================================
% 8. DISPLAY ENHANCED IMAGE
% ================================================================

subplot(2,3,2);

imshow(enhancedImage);

title( ...
    'M1 Enhanced Image', ...
    'FontWeight','bold');


%% ================================================================
% 9. CREATE PATIENT ID
% ================================================================

patientId = sprintf( ...
    'PIPELINE_%s', ...
    datestr(now,'yyyymmdd_HHMMSS'));


fprintf( ...
    '[PIPELINE] Patient ID: %s\n', ...
    patientId);


%% ================================================================
% 10. M2 - DIABETIC RETINOPATHY GRADING
% ================================================================

fprintf('\n');
fprintf('===============================================================\n');
fprintf('M2 - DIABETIC RETINOPATHY GRADING\n');
fprintf('===============================================================\n');


tic;


try

    [severityLevel, ...
        isReferable, ...
        gradingConfidence, ...
        reportPathM2] = ...
        M2_DR_Grading( ...
            enhancedImage, ...
            patientId);

catch ME

    fprintf('\n');
    fprintf('[M2] ERROR:\n%s\n',ME.message);

    rethrow(ME);

end


m2Time = toc;


fprintf( ...
    '[M2] Grading completed in %.2f seconds.\n', ...
    m2Time);


fprintf( ...
    '[M2] Severity Grade: %d\n', ...
    severityLevel);


fprintf( ...
    '[M2] Referable DR: %d\n', ...
    isReferable);


fprintf( ...
    '[M2] Confidence: %.2f%%\n', ...
    gradingConfidence * 100);


if ~isempty(reportPathM2)

    fprintf( ...
        '[M2] Report:\n%s\n', ...
        reportPathM2);

end


%% ================================================================
% 11. M3 - LESION SEGMENTATION
% ================================================================

fprintf('\n');
fprintf('===============================================================\n');
fprintf('M3 - DIABETIC RETINOPATHY SEGMENTATION\n');
fprintf('===============================================================\n');


tic;


try

    m3Result = ...
        M3_Segmentation_Interface(enhancedImage);

catch ME

    fprintf('\n');
    fprintf('[M3] ERROR:\n%s\n',ME.message);

    rethrow(ME);

end


m3Time = toc;


fprintf( ...
    '[M3] Segmentation completed in %.2f seconds.\n', ...
    m3Time);


%% ================================================================
% 12. DISPLAY M3 SEGMENTATION MASK
% ================================================================

subplot(2,3,3);

if isfield(m3Result,'mask')

    imagesc(m3Result.mask);

    axis image off;

    title( ...
        'M3 Segmentation Mask', ...
        'FontWeight','bold');

    colorbar;

else

    text( ...
        0.5, ...
        0.5, ...
        'M3 mask unavailable', ...
        'HorizontalAlignment','center');

    axis off;

end


%% ================================================================
% 13. PRINT M3 RESULTS
% ================================================================

fprintf('\n');
fprintf('[M3] Segmentation Results:\n');


if isfield(m3Result,'classNames') && ...
        isfield(m3Result,'pixelCounts')

    classNames = ...
        m3Result.classNames;

    pixelCounts = ...
        m3Result.pixelCounts;


    for k = 1:min( ...
            numel(classNames), ...
            numel(pixelCounts))

        fprintf( ...
            '    %-20s : %d pixels\n', ...
            classNames{k}, ...
            pixelCounts(k));

    end

end


%% ================================================================
% 14. DISPLAY M3 OVERLAY
% ================================================================

subplot(2,3,4);

if isfield(m3Result,'overlay')

    imshow(m3Result.overlay);

    title( ...
        'M3 Segmentation Overlay', ...
        'FontWeight','bold');

else

    text( ...
        0.5, ...
        0.5, ...
        'M3 overlay unavailable', ...
        'HorizontalAlignment','center');

    axis off;

end


%% ================================================================
% 15. M4 - EXPLAINABLE AI
% ================================================================

fprintf('\n');
fprintf('===============================================================\n');
fprintf('M4 - EXPLAINABLE AI + CLINICAL EVIDENCE\n');
fprintf('===============================================================\n');


tic;


try

    [explanationRes, ...
        reportPathM4] = ...
        M4_Explainable_AI( ...
            enhancedImage, ...
            [], ...
            severityLevel, ...
            gradingConfidence, ...
            patientId);

catch ME

    fprintf('\n');
    fprintf('[M4] ERROR:\n%s\n',ME.message);

    rethrow(ME);

end


m4Time = toc;


fprintf( ...
    '[M4] Explainability completed in %.2f seconds.\n', ...
    m4Time);


%% ================================================================
% 16. DISPLAY GRAD-CAM
% ================================================================

subplot(2,3,5);

if isfield(explanationRes,'gradCAMOverlay')

    imshow(explanationRes.gradCAMOverlay);

    title( ...
        'M4 Grad-CAM / Saliency', ...
        'FontWeight','bold');

elseif isfield(explanationRes,'gradCAMMap')

    imagesc(explanationRes.gradCAMMap);

    axis image off;

    title( ...
        'M4 Grad-CAM', ...
        'FontWeight','bold');

    colorbar;

else

    text( ...
        0.5, ...
        0.5, ...
        'Grad-CAM unavailable', ...
        'HorizontalAlignment','center');

    axis off;

end


%% ================================================================
% 17. DISPLAY CLINICAL SUMMARY
% ================================================================

subplot(2,3,6);

axis off;

hold on;


y = 0.95;


text( ...
    0.02, ...
    y, ...
    'FINAL SCREENING RESULT', ...
    'FontSize', ...
    12, ...
    'FontWeight', ...
    'bold');

y = y - 0.12;


text( ...
    0.02, ...
    y, ...
    sprintf( ...
        'M2 Grade: %d', ...
        severityLevel), ...
    'FontSize', ...
    10);

y = y - 0.08;


text( ...
    0.02, ...
    y, ...
    sprintf( ...
        'M2 Confidence: %.1f%%', ...
        gradingConfidence * 100), ...
    'FontSize', ...
    10);

y = y - 0.08;


if isReferable

    statusText = ...
        'REFERABLE DR';

else

    statusText = ...
        'NON-REFERABLE DR';

end


text( ...
    0.02, ...
    y, ...
    sprintf('Status: %s',statusText), ...
    'FontSize', ...
    10, ...
    'FontWeight', ...
    'bold');

y = y - 0.10;


if isfield(explanationRes,'concordanceStatus')

    text( ...
        0.02, ...
        y, ...
        sprintf( ...
            'M2-M3 Concordance: %s', ...
            explanationRes.concordanceStatus), ...
        'FontSize', ...
        9);

    y = y - 0.08;

end


if isfield(explanationRes,'urgencyLevel')

    text( ...
        0.02, ...
        y, ...
        sprintf( ...
            'Urgency: %s', ...
            explanationRes.urgencyLevel), ...
        'FontSize', ...
        9);

    y = y - 0.08;

end


if isfield(explanationRes,'followUpTimeline')

    text( ...
        0.02, ...
        y, ...
        sprintf( ...
            'Follow-up: %s', ...
            explanationRes.followUpTimeline), ...
        'FontSize', ...
        9);

    y = y - 0.10;

end


if ~isempty(reportPathM4)

    text( ...
        0.02, ...
        y, ...
        'M4 Clinical Report: GENERATED', ...
        'FontSize', ...
        9, ...
        'FontWeight', ...
        'bold');

else

    text( ...
        0.02, ...
        y, ...
        'M4 Clinical Report: NOT GENERATED', ...
        'FontSize', ...
        9, ...
        'FontWeight', ...
        'bold');

end


%% ================================================================
% 18. FINAL PIPELINE SUMMARY
% ================================================================

fprintf('\n');
fprintf('\n');
fprintf('===============================================================\n');
fprintf('             COMPLETE PIPELINE FINISHED\n');
fprintf('===============================================================\n');


fprintf('\n');
fprintf('MODULE STATUS\n');
fprintf('---------------------------------------------------------------\n');

fprintf( ...
    'M1 Image Enhancement       : SUCCESS\n');

fprintf( ...
    'M2 DR Grading              : SUCCESS\n');

fprintf( ...
    'M3 Lesion Segmentation     : SUCCESS\n');

fprintf( ...
    'M4 Explainable AI          : SUCCESS\n');

fprintf( ...
    'Clinical Evidence          : SUCCESS\n');

if ~isempty(reportPathM4)

    fprintf( ...
        'Clinical Report            : SUCCESS\n');

else

    fprintf( ...
        'Clinical Report            : FAILED\n');

end


fprintf('\n');
fprintf('M2 RESULTS\n');
fprintf('---------------------------------------------------------------\n');

fprintf( ...
    'Severity Grade             : %d\n', ...
    severityLevel);

fprintf( ...
    'Referable DR               : %d\n', ...
    isReferable);

fprintf( ...
    'Confidence                 : %.2f%%\n', ...
    gradingConfidence * 100);


fprintf('\n');
fprintf('M3 RESULTS\n');
fprintf('---------------------------------------------------------------\n');


if isfield(m3Result,'classNames') && ...
        isfield(m3Result,'pixelCounts')

    for k = 1:min( ...
            numel(m3Result.classNames), ...
            numel(m3Result.pixelCounts))

        fprintf( ...
            '%-25s : %d pixels\n', ...
            m3Result.classNames{k}, ...
            m3Result.pixelCounts(k));

    end

end


fprintf('\n');
fprintf('M4 RESULTS\n');
fprintf('---------------------------------------------------------------\n');


if isfield(explanationRes,'concordanceStatus')

    fprintf( ...
        'M2-M3 Concordance         : %s\n', ...
        explanationRes.concordanceStatus);

end


if isfield(explanationRes,'urgencyLevel')

    fprintf( ...
        'Urgency                   : %s\n', ...
        explanationRes.urgencyLevel);

end


if isfield(explanationRes,'followUpTimeline')

    fprintf( ...
        'Follow-up                 : %s\n', ...
        explanationRes.followUpTimeline);

end


fprintf('\n');
fprintf('TIMING\n');
fprintf('---------------------------------------------------------------\n');

fprintf( ...
    'M1 Time                   : %.2f seconds\n', ...
    m1Time);

fprintf( ...
    'M2 Time                   : %.2f seconds\n', ...
    m2Time);

fprintf( ...
    'M3 Time                   : %.2f seconds\n', ...
    m3Time);

fprintf( ...
    'M4 Time                   : %.2f seconds\n', ...
    m4Time);


totalTime = ...
    m1Time + m2Time + m3Time + m4Time;


fprintf( ...
    'Total Pipeline Time       : %.2f seconds\n', ...
    totalTime);


fprintf('\n');
fprintf('REPORTS\n');
fprintf('---------------------------------------------------------------\n');


if ~isempty(reportPathM2)

    fprintf( ...
        'M2 Report:\n%s\n', ...
        reportPathM2);

end


if ~isempty(reportPathM4)

    fprintf( ...
        'M4 Report:\n%s\n', ...
        reportPathM4);

end


fprintf('\n');
fprintf('===============================================================\n');
fprintf('       M1 -> M2 -> M3 -> M4 PIPELINE SUCCESSFULLY RUN\n');
fprintf('===============================================================\n');
fprintf('\n');


%% ================================================================
% 19. STORE RESULTS IN WORKSPACE
% ================================================================
%
% These variables remain available after the script finishes:
%
%   inputImage
%   enhancedImage
%   m3Result
%   explanationRes
%   severityLevel
%   isReferable
%   gradingConfidence
%   reportPathM2
%   reportPathM4
%
% This is useful for demonstrations and debugging.
% ================================================================

pipelineResult = struct();

pipelineResult.inputImage = ...
    inputImage;

pipelineResult.enhancedImage = ...
    enhancedImage;

pipelineResult.m2 = struct();

pipelineResult.m2.severityLevel = ...
    severityLevel;

pipelineResult.m2.isReferable = ...
    isReferable;

pipelineResult.m2.confidence = ...
    gradingConfidence;

pipelineResult.m2.reportPath = ...
    reportPathM2;

pipelineResult.m3 = ...
    m3Result;

pipelineResult.m4 = ...
    explanationRes;

pipelineResult.m4.reportPath = ...
    reportPathM4;

pipelineResult.timing = struct();

pipelineResult.timing.M1 = ...
    m1Time;

pipelineResult.timing.M2 = ...
    m2Time;

pipelineResult.timing.M3 = ...
    m3Time;

pipelineResult.timing.M4 = ...
    m4Time;

pipelineResult.timing.total = ...
    totalTime;


fprintf( ...
    '[PIPELINE] pipelineResult structure is available in workspace.\n');