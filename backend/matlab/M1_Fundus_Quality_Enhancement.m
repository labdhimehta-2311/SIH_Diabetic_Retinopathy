function varargout = M1_Fundus_Quality_Enhancement(input_image_path)
% M1 - FUNDUS IMAGE QUALITY + ENHANCEMENT MODULE (API VERSION)

    if nargin > 0
        config = M1Config();
        thisFile = mfilename('fullpath');
        OUTPUT_DIR = fullfile(fileparts(thisFile), "images_generated");
        
        if ~isfolder(OUTPUT_DIR)
            mkdir(OUTPUT_DIR);
        end
        
        result = processImage(char(input_image_path), config, false);
        
        if result.status == "ACCEPT" && ~isempty(result.image)
            outputPath = chooseOutputFilename(char(input_image_path), OUTPUT_DIR);
            if saveRGBImage(result.image, outputPath)
                varargout{1} = char(outputPath); 
                return;
            else
                error('M1:SaveFailed', 'Could not save the enhanced image.');
            end
        else
            error('M1:QualityRejected', 'Image rejected: %s', result.reason);
        end
    end

    % Standalone Testing Mode
    RUN_MODE = "dataset";
    DATASET_FOLDER = fullfile(pwd, "train_images"); 
    SINGLE_IMAGE = "/MATLAB Drive/SIH/images_test_35/0ecaf177e85f.png";
    thisFile = mfilename('fullpath');
    OUTPUT_DIR = fullfile(fileparts(thisFile), "images_generated");
    
    if RUN_MODE == "single"
        if ~isfile(SINGLE_IMAGE)
            fprintf("ERROR: Single image not found:\n");
        else
            demoSingleImage(SINGLE_IMAGE, OUTPUT_DIR);
        end
    elseif RUN_MODE == "dataset"
        if ~isfolder(DATASET_FOLDER)
            fprintf("ERROR: Dataset folder not found:\n");
        else
            evaluateDataset(DATASET_FOLDER, OUTPUT_DIR);
        end
    end
    
    if nargout > 0
        varargout{1} = "";
    end
end

function config = M1Config()
    config.outputSize = [224 224];
    config.blackThreshold = 10;
    config.minFundusAreaRatio = 0.25;
    config.severeBlurThreshold = 5.0;
    config.severeDarkThreshold = 10.0;
    config.severeBrightThreshold = 235.0;
    config.severeClippingRatio = 0.80;
    config.finalMinQualityScore = 50.0;
    config.finalMinBlurScore = 5.0;
    config.targetBrightnessLow = 55.0;
    config.targetBrightnessHigh = 190.0;
    config.claheClipLimit = 0.02;
    config.claheGridSize = [8 8];
    config.illuminationSigma = 21.0;
    config.denoiseD = 5;
    config.denoiseSigmaColor = 20.0;
    config.denoiseSigmaSpace = 20.0;
    config.sharpeningAmount = 0.20;
    config.sharpeningSigma = 1.0;
    config.minGamma = 0.75;
    config.maxGamma = 1.35;
    config.lowContrastThreshold = 20.0;
    config.blurSharpenThreshold = 100.0;
    config.brightnessAdjustLow = 65.0;
    config.brightnessAdjustHigh = 150.0;
end

function imageRGB = loadImageSafe(imagePath)
    try
        imageRGB = imread(imagePath);
        if isempty(imageRGB)
            imageRGB = [];
            return;
        end
        if ndims(imageRGB) == 2
            imageRGB = repmat(imageRGB, 1, 1, 3);
        elseif size(imageRGB,3) == 4
            imageRGB = imageRGB(:,:,1:3);
        end
        if ~isa(imageRGB, 'uint8')
            imageRGB = im2uint8(imageRGB);
        end
    catch
        imageRGB = [];
    end
end

function success = saveRGBImage(imageRGB, outputPath)
    success = false;
    try
        outputDir = fileparts(outputPath);
        if ~isfolder(outputDir)
            mkdir(outputDir);
        end
        if ~isa(imageRGB, 'uint8')
            imageRGB = uint8(max(min(imageRGB, 255), 0));
        end
        imwrite(imageRGB, outputPath, 'png');
        success = true;
    catch
        success = false;
    end
end

function [cropped, cropMask, areaRatio] = detectFundusRegion(imageRGB, config)
    gray = rgb2gray(imageRGB);
    mask = gray > config.blackThreshold;
    se = strel('square', 7);
    mask = imclose(mask, se);
    mask = imopen(mask, se);
    cc = bwconncomp(mask);
    if cc.NumObjects == 0
        cropped = imageRGB;
        cropMask = mask;
        areaRatio = 0.0;
        return;
    end
    stats = regionprops(cc, 'Area', 'BoundingBox');
    areas = [stats.Area];
    [area, idx] = max(areas);
    areaRatio = double(area) / double(max(numel(gray), 1));
    bbox = stats(idx).BoundingBox;
    x = floor(bbox(1)) + 1;
    y = floor(bbox(2)) + 1;
    bw = floor(bbox(3));
    bh = floor(bbox(4));
    x = max(1, x);
    y = max(1, y);
    x2 = min(size(gray,2), x + bw - 1);
    y2 = min(size(gray,1), y + bh - 1);
    padX = max(1, floor(0.01 * max(x2-x+1,1)));
    padY = max(1, floor(0.01 * max(y2-y+1,1)));
    x1 = max(1, x - padX);
    y1 = max(1, y - padY);
    x2 = min(size(gray,2), x2 + padX);
    y2 = min(size(gray,1), y2 + padY);
    cropped = imageRGB(y1:y2, x1:x2, :);
    cropMask = mask(y1:y2, x1:x2);
end

function mask = createRetinaMask(imageRGB)
    gray = rgb2gray(imageRGB);
    mask = gray > 10;
    se = strel('square', 5);
    mask = imclose(mask, se);
end

function score = calculateBlurScore(imageRGB, mask)
    gray = double(rgb2gray(imageRGB));
    if nargin >= 2 && ~isempty(mask) && nnz(mask) > 100
        [ys, xs] = find(mask > 0);
        if numel(ys) > 100
            y1 = min(ys);  y2 = max(ys);  x1 = min(xs);  x2 = max(xs);
            gray = gray(y1:y2, x1:x2);
        end
    end
    kernel = [0 1 0; 1 -4 1; 0 1 0];
    lap = conv2(gray, kernel, 'same');
    score = var(lap(:), 1);
end

function value = calculateBrightness(imageRGB, mask)
    gray = double(rgb2gray(imageRGB));
    if nargin >= 2 && ~isempty(mask) && nnz(mask) > 100
        values = gray(mask > 0);
    else
        values = gray(:);
    end
    if isempty(values), value = 0.0; else, value = mean(values); end
end

function value = calculateContrast(imageRGB, mask)
    gray = double(rgb2gray(imageRGB));
    if nargin >= 2 && ~isempty(mask) && nnz(mask) > 100
        values = gray(mask > 0);
    else
        values = gray(:);
    end
    if isempty(values), value = 0.0; else, value = std(values, 1); end
end

function value = calculateClippingRatio(imageRGB, mask)
    gray = double(rgb2gray(imageRGB));
    if nargin >= 2 && ~isempty(mask) && nnz(mask) > 100
        values = gray(mask > 0);
    else
        values = gray(:);
    end
    if isempty(values)
        value = 1.0;
        return;
    end
    dark = mean(values <= 5);
    bright = mean(values >= 250);
    value = dark + bright;
end

function score = calculateQualityScore(blurScore, brightness, contrast, clippingRatio, fundusAreaRatio, config)
    blurComponent = min(max(log1p(blurScore) / log1p(300.0), 0.0), 1.0);
    if brightness >= config.targetBrightnessLow && brightness <= config.targetBrightnessHigh
        brightnessComponent = 1.0;
    elseif brightness < config.targetBrightnessLow
        brightnessComponent = min(max(brightness / max(config.targetBrightnessLow, 1.0), 0.0), 1.0);
    else
        brightnessComponent = min(max((255.0 - brightness) / max(255.0 - config.targetBrightnessHigh, 1.0), 0.0), 1.0);
    end
    contrastComponent = min(max(contrast / 60.0, 0.0), 1.0);
    clippingComponent = 1.0 - min(max(clippingRatio / 0.50, 0.0), 1.0);
    areaComponent = min(max(fundusAreaRatio / 0.50, 0.0), 1.0);
    score = 100.0 * (0.25 * blurComponent + 0.25 * brightnessComponent + 0.20 * contrastComponent + 0.15 * clippingComponent + 0.15 * areaComponent);
    score = min(max(score, 0.0), 100.0);
end

function metrics = assessQuality(imageRGB, fundusAreaRatio, config)
    mask = createRetinaMask(imageRGB);
    blur = calculateBlurScore(imageRGB, mask);
    brightness = calculateBrightness(imageRGB, mask);
    contrast = calculateContrast(imageRGB, mask);
    clipping = calculateClippingRatio(imageRGB, mask);
    qualityScore = calculateQualityScore(blur, brightness, contrast, clipping, fundusAreaRatio, config);
    severeReasons = strings(0,1);
    if fundusAreaRatio < config.minFundusAreaRatio
        severeReasons(end+1,1) = "Insufficient fundus region"; %#ok<AGROW>
    end
    if blur < config.severeBlurThreshold
        severeReasons(end+1,1) = "Severe blur"; %#ok<AGROW>
    end
    if brightness < config.severeDarkThreshold
        severeReasons(end+1,1) = "Extremely dark"; %#ok<AGROW>
    end
    if brightness > config.severeBrightThreshold
        severeReasons(end+1,1) = "Extremely bright"; %#ok<AGROW>
    end
    if clipping > config.severeClippingRatio
        severeReasons(end+1,1) = "Severe exposure clipping"; %#ok<AGROW>
    end
    metrics.blur_score = round(blur, 3);
    metrics.brightness = round(brightness, 3);
    metrics.contrast = round(contrast, 3);
    metrics.clipping_ratio = round(clipping, 4);
    metrics.fundus_area_ratio = round(fundusAreaRatio, 4);
    metrics.quality_score = round(qualityScore, 2);
    metrics.severe = ~isempty(severeReasons);
    metrics.severe_reasons = severeReasons;
end

function output = correctIllumination(imageRGB, config)
    lab = rgb2lab(imageRGB);
    L = lab(:,:,1); A = lab(:,:,2); B = lab(:,:,3);
    background = imgaussfilt(L, config.illuminationSigma);
    corrected = (L ./ (background + eps)) * 50.0;
    corrected = min(max(corrected, 0.0), 100.0);
    labCorrected = cat(3, corrected, A, B);
    output = lab2rgb(labCorrected);
    output = im2uint8(min(max(output, 0.0), 1.0));
end

function output = automaticGamma(imageRGB, brightness, config)
    if brightness >= config.brightnessAdjustLow && brightness <= config.brightnessAdjustHigh
        output = imageRGB;
        return;
    end
    target = 105.0;
    denominator = log(max(brightness, 1.0) / 255.0);
    numerator = log(target / 255.0);
    if abs(denominator) < 1e-8
        output = imageRGB;
        return;
    end
    gamma = numerator / denominator;
    gamma = min(max(gamma, config.minGamma), config.maxGamma);
    lut = zeros(256,1,'uint8');
    for i = 0:255
        lut(i+1) = uint8(round(((double(i) / 255.0)^gamma) * 255.0));
    end
    output = zeros(size(imageRGB),'uint8');
    for c = 1:3
        channel = imageRGB(:,:,c);
        output(:,:,c) = intlut(channel, lut);
    end
end

function output = applyCLAHE(imageRGB, config)
    lab = rgb2lab(imageRGB);
    L = lab(:,:,1); A = lab(:,:,2); B = lab(:,:,3);
    Lnorm = min(max(L / 100.0, 0.0), 1.0);
    L_enhanced = adapthisteq(Lnorm, 'ClipLimit', config.claheClipLimit, 'NumTiles', config.claheGridSize);
    labMerged = cat(3, L_enhanced * 100.0, A, B);
    output = lab2rgb(labMerged);
    output = im2uint8(min(max(output, 0.0), 1.0));
end

function output = denoiseImage(imageRGB, config)
    if isempty(imageRGB)
        error("Denoising received an empty image.");
    end
    if ~isa(imageRGB,'uint8')
        imageRGB = uint8(max(min(imageRGB,255),0));
    end
    output = zeros(size(imageRGB),'uint8');
    for c = 1:3
        channel = imageRGB(:,:,c);
        filtered = imbilatfilt(channel, config.denoiseSigmaColor^2, config.denoiseSigmaSpace);
        output(:,:,c) = im2uint8(filtered);
    end
end

function output = sharpenImage(imageRGB, config)
    blurred = imgaussfilt(imageRGB, config.sharpeningSigma);
    sharpened = (1.0 + config.sharpeningAmount) .* im2double(imageRGB) - config.sharpeningAmount .* im2double(blurred);
    sharpened = min(max(sharpened, 0.0), 1.0);
    output = im2uint8(sharpened);
end

function [enhanced, operations] = enhanceImage(imageRGB, initialMetrics, config)
    enhanced = imageRGB;
    operations = strings(0,1);
    brightness = double(initialMetrics.brightness);
    contrast = double(initialMetrics.contrast);
    blur = double(initialMetrics.blur_score);
    initialQuality = double(initialMetrics.quality_score);

    if contrast < config.lowContrastThreshold
        enhanced = correctIllumination(enhanced, config);
        operations(end+1,1) = "illumination_correction"; %#ok<AGROW>
    end
    if brightness < config.brightnessAdjustLow || brightness > config.brightnessAdjustHigh
        enhanced = automaticGamma(enhanced, brightness, config);
        operations(end+1,1) = "gamma_correction"; %#ok<AGROW>
    end
    if contrast < config.lowContrastThreshold
        enhanced = applyCLAHE(enhanced, config);
        operations(end+1,1) = "CLAHE"; %#ok<AGROW>
    end
    if initialQuality < 75.0 || contrast < config.lowContrastThreshold
        enhanced = denoiseImage(enhanced, config);
        operations(end+1,1) = "bilateral_denoising"; %#ok<AGROW>
    end
    if blur >= config.severeBlurThreshold && blur < config.blurSharpenThreshold
        enhanced = sharpenImage(enhanced, config);
        operations(end+1,1) = "mild_sharpening"; %#ok<AGROW>
    end
end

function [status, reason] = finalDecision(finalMetrics, initialMetrics, config)
    if finalMetrics.severe
        status = "REJECT";
        reason = strjoin(finalMetrics.severe_reasons, "; ");
        return;
    end
    if finalMetrics.quality_score < config.finalMinQualityScore
        status = "REJECT";
        reason = "Final quality score below acceptance threshold";
        return;
    end
    if finalMetrics.blur_score < config.finalMinBlurScore
        status = "REJECT";
        reason = "Insufficient sharpness after enhancement";
        return;
    end
    if finalMetrics.quality_score + 10 < initialMetrics.quality_score
        status = "REJECT";
        reason = "Enhancement degraded measured quality";
        return;
    end
    status = "ACCEPT";
    reason = "Image suitable for downstream analysis";
end

function modelInput = prepareModelInput(imageRGB, config)
    resized = imresize(imageRGB, config.outputSize, 'bilinear');
    modelInput = im2single(resized);
end

function result = processImage(imagePath, config, returnDebugImages)
    if nargin < 3
        returnDebugImages = false;
    end
    original = loadImageSafe(imagePath);
    if isempty(original)
        result = struct('status',"ERROR",'reason',"Unable to read image",'image',[],'model_input',[],'initial_metrics',[],'final_metrics',[],'quality_improvement',[],'operations',strings(0,1),'debug',[]);
        return;
    end
    original = imresize(original, [512 512]);
    [cropped, ~, areaRatio] = detectFundusRegion(original, config);
    initialMetrics = assessQuality(cropped, areaRatio, config);
    
    if initialMetrics.severe
        debugData = [];
        if returnDebugImages
            debugData = struct('original',original,'cropped',cropped,'enhanced',[]);
        end
        result = struct('status',"REJECT",'reason',strjoin(initialMetrics.severe_reasons,"; "),'image',[],'model_input',[],'initial_metrics',initialMetrics,'final_metrics',[],'quality_improvement',[],'operations',strings(0,1),'debug',debugData);
        return;
    end
    
    [enhanced, operations] = enhanceImage(cropped, initialMetrics, config);
    finalMetrics = assessQuality(enhanced, areaRatio, config);
    [status, reason] = finalDecision(finalMetrics, initialMetrics, config);
    qualityImprovement = round(finalMetrics.quality_score - initialMetrics.quality_score, 2);
    
    modelInput = [];  outputImage = [];
    if status == "ACCEPT"
        outputImage = enhanced;
        modelInput = prepareModelInput(enhanced, config);
    end
    
    debugData = [];
    if returnDebugImages
        debugData = struct('original',original,'cropped',cropped,'enhanced',enhanced);
    end
    
    result = struct('status',status,'reason',reason,'image',outputImage,'model_input',modelInput,'initial_metrics',initialMetrics,'final_metrics',finalMetrics,'quality_improvement',qualityImprovement,'operations',operations,'debug',debugData);
end

function files = findImages(folder)
    validExtensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff'};
    files = strings(0,1);
    if ~isfolder(folder)
        return;
    end
    raw = dir(fullfile(folder, '**', '*'));
    for i = 1:numel(raw)
        if raw(i).isdir
            continue;
        end
        [~,~,ext] = fileparts(raw(i).name);
        if any(strcmpi(ext, validExtensions))
            files(end+1,1) = fullfile(raw(i).folder, raw(i).name); %#ok<AGROW>
        end
    end
    files = sort(files);
end

function outputPath = chooseOutputFilename(sourcePath, outputDir)
    [~, stem, ~] = fileparts(sourcePath);
    outputPath = fullfile(outputDir, stem + "_enhanced.png");
    if ~isfile(outputPath)
        return;
    end
    counter = 1;
    while true
        outputPath = fullfile(outputDir, stem + "_enhanced_" + counter + ".png");
        if ~isfile(outputPath)
            return;
        end
        counter = counter + 1;
    end
end

function summary = evaluateDataset(inputFolder, outputDir)
    config = M1Config();
    if ~isfolder(outputDir)
        mkdir(outputDir);
    end
    files = findImages(inputFolder);
    fprintf("\n========================================\n");
    fprintf("M1 DATASET PROCESSING\n");
    fprintf("========================================\n");
    fprintf("Input folder : %s\n", inputFolder);
    fprintf("Output folder: %s\n", outputDir);
    fprintf("Images found : %d\n", numel(files));
    n = numel(files);
    filenameCell = strings(n,1); sourcePathCell = strings(n,1); statusCell = strings(n,1); reasonCell = strings(n,1); opsCell = strings(n,1);
    initialBlur = nan(n,1); initialBrightness = nan(n,1); initialContrast = nan(n,1); initialClipping = nan(n,1); initialFundusArea = nan(n,1); initialQuality = nan(n,1);
    finalBlur = nan(n,1); finalBrightness = nan(n,1); finalContrast = nan(n,1); finalClipping = nan(n,1); finalFundusArea = nan(n,1); finalQuality = nan(n,1);
    qualityImprovement = nan(n,1); outputFileCell = strings(n,1);
    accepted = 0; rejected = 0; errors = 0; saved = 0;
    for index = 1:n
        imagePath = char(files(index));
        try
            result = processImage(imagePath, config, false);
            [~, name, ~] = fileparts(imagePath);
            filenameCell(index) = string(name) + string(getFileExtension(imagePath));
            sourcePathCell(index) = string(imagePath);
            statusCell(index) = string(result.status);
            reasonCell(index) = string(result.reason);
            opsCell(index) = strjoin(result.operations, ";");
            if ~isempty(result.initial_metrics)
                initialBlur(index) = result.initial_metrics.blur_score;
                initialBrightness(index) = result.initial_metrics.brightness;
                initialContrast(index) = result.initial_metrics.contrast;
                initialClipping(index) = result.initial_metrics.clipping_ratio;
                initialFundusArea(index) = result.initial_metrics.fundus_area_ratio;
                initialQuality(index) = result.initial_metrics.quality_score;
            end
            if ~isempty(result.final_metrics)
                finalBlur(index) = result.final_metrics.blur_score;
                finalBrightness(index) = result.final_metrics.brightness;
                finalContrast(index) = result.final_metrics.contrast;
                finalClipping(index) = result.final_metrics.clipping_ratio;
                finalFundusArea(index) = result.final_metrics.fundus_area_ratio;
                finalQuality(index) = result.final_metrics.quality_score;
            end
            if ~isempty(result.quality_improvement)
                qualityImprovement(index) = result.quality_improvement;
            end
            if result.status == "ACCEPT" && ~isempty(result.image)
                outputPath = chooseOutputFilename(imagePath, outputDir);
                if saveRGBImage(result.image, outputPath)
                    outputFileCell(index) = string(outputPath);
                    saved = saved + 1;
                end
            end
            if result.status == "ACCEPT"
                accepted = accepted + 1;
            elseif result.status == "REJECT"
                rejected = rejected + 1;
            else
                errors = errors + 1;
            end
        catch ME
            errors = errors + 1;
            [~, name, ext] = fileparts(imagePath);
            filenameCell(index) = string(name) + string(ext);
            sourcePathCell(index) = string(imagePath);
            statusCell(index) = "ERROR";
            reasonCell(index) = "Processing error: " + string(ME.identifier) + ": " + string(ME.message);
            opsCell(index) = "";
        end
    end
    reportPath = fullfile(outputDir, "m1_quality_report.csv");
    T = table(filenameCell, sourcePathCell, statusCell, reasonCell, opsCell, initialBlur, initialBrightness, initialContrast, initialClipping, initialFundusArea, initialQuality, finalBlur, finalBrightness, finalContrast, finalClipping, finalFundusArea, finalQuality, qualityImprovement, outputFileCell, ...
        'VariableNames',{'filename', 'source_path', 'status', 'reason', 'enhancement_operations', 'initial_blur', 'initial_brightness', 'initial_contrast', 'initial_clipping', 'initial_fundus_area', 'initial_quality', 'final_blur', 'final_brightness', 'final_contrast', 'final_clipping', 'final_fundus_area', 'final_quality', 'quality_improvement', 'output_file'});
    writetable(T, reportPath);
    summary = struct('total',n,'accepted',accepted,'rejected',rejected,'errors',errors,'saved',saved);
end

function ext = getFileExtension(filePath)
    [~,~,ext] = fileparts(filePath);
end

function demoSingleImage(imagePath, outputDir)
    if ~isfolder(outputDir), mkdir(outputDir); end
    config = M1Config();
    result = processImage(imagePath, config, false);
    if result.status == "ACCEPT" && ~isempty(result.image)
        outputPath = chooseOutputFilename(imagePath, outputDir);
        saveRGBImage(result.image, outputPath);
    end
end