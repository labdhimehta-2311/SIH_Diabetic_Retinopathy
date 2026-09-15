function check_R3_OD_training_false_positive()

clc;
close all;

fprintf('============================================\n');
fprintf('R3 TRAINING OD FALSE-POSITIVE CHECK\n');
fprintf('============================================\n\n');

%% ---------------------------------------------------------
% PATHS
% ----------------------------------------------------------

projectRoot = fileparts(fileparts(fileparts(fileparts(mfilename('fullpath')))));

modelFile = fullfile(projectRoot, ...
    'src','segmentation','trained_models', ...
    'unet_multiclass_lesionaware_best.mat');

imageDir = fullfile(projectRoot, '..', ...
    'A. Segmentation', ...
    '1. Original Images', ...
    'a. Training Set');

odDir = fullfile(projectRoot, '..', ...
    'A. Segmentation', ...
    '2. All Segmentation Groundtruths', ...
    'a. Training Set', ...
    '5. Optic Disc');

patchSize = 512;

%% ---------------------------------------------------------
% LOAD MODEL
% ----------------------------------------------------------

fprintf('Loading R3 model...\n');

S = load(modelFile);

if isfield(S,'net')
    net = S.net;
elseif isfield(S,'dlnet')
    net = S.dlnet;
else
    error('Could not find network inside R3 model file.');
end

fprintf('R3 model loaded successfully.\n\n');

%% ---------------------------------------------------------
% TRAINING IMAGE IDs
% ----------------------------------------------------------

trainIDs = [ ...
     3  8 13 14 22 23 25 31 32 33 35 ...
    38 39 46 47 48 49 51 52 53 54];

%% ---------------------------------------------------------
% STORAGE
% ----------------------------------------------------------

allResults = [];

fprintf('Checking %d training images...\n\n',numel(trainIDs));

%% ---------------------------------------------------------
% LOOP THROUGH TRAINING IMAGES
% ----------------------------------------------------------

for k = 1:numel(trainIDs)

    id = trainIDs(k);

    fprintf('--------------------------------------------\n');
    fprintf('Training image IDRiD_%02d\n',id);
    fprintf('--------------------------------------------\n');

    %% Load image

    imageFile = fullfile(imageDir, ...
        sprintf('IDRiD_%02d.jpg',id));

    img = imread(imageFile);

    %% Load OD ground truth

    odFile = fullfile(odDir, ...
        sprintf('IDRiD_%02d_OD.tif',id));

    odGT = imread(odFile);

    odGT = odGT > 0;

    [H,W,~] = size(img);

    %% Patch positions

    rowStarts = getPatchStarts(H,patchSize);
    colStarts = getPatchStarts(W,patchSize);

    patchNumber = 0;

    %% -----------------------------------------------------
    % CHECK EVERY PATCH
    % ------------------------------------------------------

    for r = 1:numel(rowStarts)

        r1 = rowStarts(r);
        r2 = r1 + patchSize - 1;

        for c = 1:numel(colStarts)

            c1 = colStarts(c);
            c2 = c1 + patchSize - 1;

            patchNumber = patchNumber + 1;

            %% Extract image patch

            patch = img(r1:r2,c1:c2,:);

            %% Extract OD GT

            gtPatch = odGT(r1:r2,c1:c2);

            gtODPercent = 100 * nnz(gtPatch) / numel(gtPatch);

            %% Normalize

            patchSingle = single(patch) / 255;

            %% Predict

            dlX = dlarray(patchSingle,'SSCB');

            scores = predict(net,dlX);

            scores = extractdata(scores);

            if ndims(scores) == 4
                scores = scores(:,:,:,1);
            end

            [~,predPatch] = max(scores,[],3);

            predOD = predPatch == 6;

            predODPercent = 100 * nnz(predOD) / numel(predOD);

            %% Store

            resultRow = [
                id ...
                patchNumber ...
                r1 ...
                c1 ...
                gtODPercent ...
                predODPercent
            ];

            allResults = [allResults; resultRow];

            %% Print only suspicious patches

            if gtODPercent == 0 && predODPercent >= 10

                fprintf(['FALSE POSITIVE PATCH %2d | ' ...
                         'Row %4d | Col %4d | ' ...
                         'GT OD %7.3f%% | ' ...
                         'Pred OD %7.3f%%\n'], ...
                         patchNumber, ...
                         r1,c1, ...
                         gtODPercent, ...
                         predODPercent);

            end

        end
    end

end

%% ---------------------------------------------------------
% SUMMARY
% ----------------------------------------------------------

fprintf('\n============================================\n');
fprintf('FINAL SUMMARY\n');
fprintf('============================================\n');

totalPatches = size(allResults,1);

gtZero = allResults(:,5) == 0;

predictedOD = allResults(:,6) > 0;

largeFalsePositive = ...
    gtZero & allResults(:,6) >= 10;

fprintf('Total training patches checked : %d\n', ...
    totalPatches);

fprintf('GT OD = 0 patches              : %d\n', ...
    sum(gtZero));

fprintf('GT OD = 0 but predicted OD > 0 : %d\n', ...
    sum(gtZero & predictedOD));

fprintf('GT OD = 0 and predicted OD >=10%% : %d\n', ...
    sum(largeFalsePositive));

fprintf('Maximum predicted OD on GT=0 patches : %.3f%%\n', ...
    max(allResults(gtZero,6)));

fprintf('Mean predicted OD on GT=0 patches    : %.3f%%\n', ...
    mean(allResults(gtZero,6)));

%% ---------------------------------------------------------
% SAVE CSV
% ----------------------------------------------------------

outputDir = fullfile(projectRoot, ...
    'src','segmentation','outputs','metrics');

if ~exist(outputDir,'dir')
    mkdir(outputDir);
end

T = array2table(allResults, ...
    'VariableNames',{ ...
    'ImageID', ...
    'PatchNumber', ...
    'RowStart', ...
    'ColStart', ...
    'GT_OD_Percent', ...
    'Predicted_OD_Percent'});

outputFile = fullfile(outputDir, ...
    'R3_training_OD_false_positive_check.csv');

writetable(T,outputFile);

fprintf('\nResults saved to:\n%s\n',outputFile);

fprintf('\n============================================\n');
fprintf('DIAGNOSTIC COMPLETED\n');
fprintf('============================================\n');

end


%% =========================================================
% HELPER FUNCTION
% =========================================================

function starts = getPatchStarts(imageSize,patchSize)

if imageSize <= patchSize

    starts = 1;

else

    starts = 1:patchSize:(imageSize-patchSize+1);

    lastStart = imageSize-patchSize+1;

    if starts(end) ~= lastStart
        starts = [starts lastStart];
    end

end

end