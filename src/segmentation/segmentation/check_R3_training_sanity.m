function check_R3_training_sanity()

clc;
close all;

fprintf('\n');
fprintf('============================================\n');
fprintf('R3 TRAINING SANITY CHECK\n');
fprintf('============================================\n');

%% =========================================================
% 1. LOAD R3 MODEL
% ==========================================================

modelFile = fullfile( ...
    'src', ...
    'segmentation', ...
    'trained_models', ...
    'unet_multiclass_lesionaware_best.mat');

fprintf('\nLoading R3 model...\n');

S = load(modelFile);

if isfield(S,'net')
    net = S.net;
elseif isfield(S,'dlnet')
    net = S.dlnet;
else
    error('Could not find network variable in R3 model.');
end

fprintf('R3 model loaded successfully.\n');


%% =========================================================
% 2. TRAINING IMAGE
% ==========================================================

imageFile = fullfile( ...
    '..', ...
    'A. Segmentation', ...
    '1. Original Images', ...
    'a. Training Set', ...
    'IDRiD_03.jpg');

fprintf('\nLoading training image:\n%s\n', imageFile);

img = imread(imageFile);

fprintf('Original image size: %d x %d x %d\n', ...
    size(img,1), size(img,2), size(img,3));


%% =========================================================
% 3. LOAD ALL TRAINING MASKS
% ==========================================================

baseMask = fullfile( ...
    '..', ...
    'A. Segmentation', ...
    '2. All Segmentation Groundtruths', ...
    'a. Training Set');

maFile = fullfile(baseMask, ...
    '1. Microaneurysms', ...
    'IDRiD_03_MA.tif');

heFile = fullfile(baseMask, ...
    '2. Haemorrhages', ...
    'IDRiD_03_HE.tif');

exFile = fullfile(baseMask, ...
    '3. Hard Exudates', ...
    'IDRiD_03_EX.tif');

seFile = fullfile(baseMask, ...
    '4. Soft Exudates', ...
    'IDRiD_03_SE.tif');

odFile = fullfile(baseMask, ...
    '5. Optic Disc', ...
    'IDRiD_03_OD.tif');


ma = imread(maFile) > 0;
he = imread(heFile) > 0;
ex = imread(exFile) > 0;
se = imread(seFile) > 0;
od = imread(odFile) > 0;


%% =========================================================
% 4. FIND PATCH WITH MAXIMUM OD
% ==========================================================

patchSize = 512;

[H,W,~] = size(img);

rowStarts = 1:patchSize:(H-patchSize+1);
colStarts = 1:patchSize:(W-patchSize+1);

% Add final boundary positions if necessary
if rowStarts(end) ~= H-patchSize+1
    rowStarts = [rowStarts H-patchSize+1];
end

if colStarts(end) ~= W-patchSize+1
    colStarts = [colStarts W-patchSize+1];
end

maxOD = -1;

bestRow = 1;
bestCol = 1;

for r = 1:length(rowStarts)

    r1 = rowStarts(r);
    r2 = r1 + patchSize - 1;

    for c = 1:length(colStarts)

        c1 = colStarts(c);
        c2 = c1 + patchSize - 1;

        odPatch = od(r1:r2,c1:c2);

        odCount = nnz(odPatch);

        if odCount > maxOD
            maxOD = odCount;
            bestRow = r1;
            bestCol = c1;
        end
    end
end


%% =========================================================
% 5. FIND PATCH WITH ZERO OD
% ==========================================================

zeroFound = false;

zeroRow = 1;
zeroCol = 1;

for r = 1:length(rowStarts)

    r1 = rowStarts(r);
    r2 = r1 + patchSize - 1;

    for c = 1:length(colStarts)

        c1 = colStarts(c);
        c2 = c1 + patchSize - 1;

        odPatch = od(r1:r2,c1:c2);

        if nnz(odPatch) == 0

            zeroRow = r1;
            zeroCol = c1;

            zeroFound = true;
            break;
        end
    end

    if zeroFound
        break;
    end
end


%% =========================================================
% 6. TEST TWO PATCHES
% ==========================================================

fprintf('\n');
fprintf('============================================\n');
fprintf('SELECTED TRAINING PATCHES\n');
fprintf('============================================\n');

fprintf('\nPATCH A - WITH OPTIC DISC\n');
fprintf('Rows    : %d:%d\n', ...
    bestRow, bestRow+patchSize-1);

fprintf('Columns : %d:%d\n', ...
    bestCol, bestCol+patchSize-1);

fprintf('GT OD pixels: %d\n', maxOD);


fprintf('\nPATCH B - WITHOUT OPTIC DISC\n');

if zeroFound

    fprintf('Rows    : %d:%d\n', ...
        zeroRow, zeroRow+patchSize-1);

    fprintf('Columns : %d:%d\n', ...
        zeroCol, zeroCol+patchSize-1);

else

    error('Could not find a zero-OD patch.');

end


%% =========================================================
% 7. RUN BOTH PATCHES THROUGH R3
% ==========================================================

patchNames = {'WITH OD','WITHOUT OD'};
rowList = [bestRow zeroRow];
colList = [bestCol zeroCol];

for k = 1:2

    r1 = rowList(k);
    c1 = colList(k);

    r2 = r1 + patchSize - 1;
    c2 = c1 + patchSize - 1;

    %% Get image patch
    patch = img(r1:r2,c1:c2,:);

    %% Normalize exactly like normal input
    patch = im2single(patch);

    %% Convert to dlarray
    dlX = dlarray(patch,'SSCB');

    %% Predict
    scores = predict(net,dlX);

    scores = extractdata(scores);

    %% Remove batch dimension if needed
    scores = squeeze(scores);

    %% Convert to H x W x Classes if necessary
    if size(scores,1) == 6

        scores = permute(scores,[2 3 1]);

    end

    %% Predicted class
    [~,predicted] = max(scores,[],3);


    %% =====================================================
    % Ground truth
    % ======================================================

    gtOD = od(r1:r2,c1:c2);

    gtODCount = nnz(gtOD);

    predODCount = nnz(predicted == 6);

    totalPixels = patchSize * patchSize;

    gtODPercent = 100 * gtODCount / totalPixels;

    predODPercent = 100 * predODCount / totalPixels;


    %% =====================================================
    % Probability statistics
    % ======================================================

    meanBG = mean(scores(:,:,1),'all');

    meanMA = mean(scores(:,:,2),'all');

    meanHE = mean(scores(:,:,3),'all');

    meanEX = mean(scores(:,:,4),'all');

    meanSE = mean(scores(:,:,5),'all');

    meanOD = mean(scores(:,:,6),'all');


    %% =====================================================
    % DISPLAY
    % ======================================================

    fprintf('\n');
    fprintf('============================================\n');
    fprintf('PATCH %d - %s\n',k,patchNames{k});
    fprintf('============================================\n');

    fprintf('\nGROUND TRUTH\n');

    fprintf('OD pixels      : %d\n',gtODCount);

    fprintf('OD percentage  : %.3f%%\n',gtODPercent);


    fprintf('\nR3 PREDICTION\n');

    fprintf('Background     : %.3f%%\n', ...
        100*nnz(predicted==1)/totalPixels);

    fprintf('Microaneurysm  : %.3f%%\n', ...
        100*nnz(predicted==2)/totalPixels);

    fprintf('Haemorrhage    : %.3f%%\n', ...
        100*nnz(predicted==3)/totalPixels);

    fprintf('Hard Exudates  : %.3f%%\n', ...
        100*nnz(predicted==4)/totalPixels);

    fprintf('Soft Exudates  : %.3f%%\n', ...
        100*nnz(predicted==5)/totalPixels);

    fprintf('Optic Disc     : %.3f%%\n',predODPercent);


    fprintf('\nPROBABILITY MEANS\n');

    fprintf('Background     : %.6f\n',meanBG);

    fprintf('Microaneurysm  : %.6f\n',meanMA);

    fprintf('Haemorrhage    : %.6f\n',meanHE);

    fprintf('Hard Exudates  : %.6f\n',meanEX);

    fprintf('Soft Exudates  : %.6f\n',meanSE);

    fprintf('Optic Disc     : %.6f\n',meanOD);


    %% =====================================================
    % VISUALIZATION
    % ======================================================

    figure('Name',['R3 Training Sanity - ' patchNames{k}], ...
        'Color','w');

    subplot(1,3,1);

    imshow(patch);

    title('Training Image Patch');


    subplot(1,3,2);

    imagesc(gtOD);

    axis image off;

    title(sprintf('GT Optic Disc (%.2f%%)', ...
        gtODPercent));

    colormap(gca,gray);


    subplot(1,3,3);

    imagesc(predicted);

    axis image off;

    title(sprintf('R3 Prediction OD %.2f%%', ...
        predODPercent));

    colorbar;


end


fprintf('\n');
fprintf('============================================\n');
fprintf('SANITY CHECK COMPLETED\n');
fprintf('============================================\n');

end