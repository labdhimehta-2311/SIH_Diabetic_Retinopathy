function [severityLevel, gradeLabel, confidence, isReferable] = M2_DR_Grading(imageInput)
% M2 - DR SEVERITY GRADING MODULE (API VERSION)

% 1. Handle API String Path (Server) or Direct Image Matrix (Manual Test)
if ischar(imageInput) || isstring(imageInput)
    imgData = imread(char(imageInput));
    isAPI = true;
else
    imgData = imageInput;
    isAPI = false;
end

persistent net;
if isempty(net)
    load('trainedDRModel.mat', 'trainedNet'); 
    net = trainedNet;
end

% Preprocess to match ResNet-50 input layer
inputSize = net.Layers(1).InputSize(1:2);
img = imresize(imgData, inputSize);

% Prediction
[YPred, scores] = classify(net, img);
severityLevel = double(string(YPred)); 
confidence = max(scores);
isReferable = severityLevel >= 2;

% Map severity level to the text label expected by the frontend
labels = {'No Apparent Diabetic Retinopathy', ...
          'Mild Diabetic Retinopathy', ...
          'Moderate Diabetic Retinopathy', ...
          'Severe Diabetic Retinopathy', ...
          'Proliferative Diabetic Retinopathy'};

idx = min(max(severityLevel + 1, 1), 5);
gradeLabel = labels{idx};

% Explainability (Grad-CAM)
% camMap = gradCAM(net, img, YPred); % Only execute GradCAM if needed outside API

% Generate UI ONLY when running locally, skip on the server
if ~isAPI
    camMap = gradCAM(net, img, YPred);
    f = figure('Name', 'Automated DR Screening Report', 'Position', [100, 100, 800, 400]);

    subplot(1,2,1); 
    imshow(img); 
    title(sprintf('Predicted Level: %d (Conf: %.1f%%)', severityLevel, confidence*100));

    if isReferable
        text(10, 20, 'ACTION: REFER TO OPHTHALMOLOGIST', 'Color', 'red', 'FontSize', 12, 'FontWeight', 'bold');
    else
        text(10, 20, 'ACTION: ROUTINE SCREENING', 'Color', 'green', 'FontSize', 12, 'FontWeight', 'bold');
    end

    subplot(1,2,2); 
    imshow(img); 
    hold on;
    imagesc(camMap, 'AlphaData', 0.5); 
    colormap jet; 
    title('Grad-CAM Evidence (Lesion Localization)');
    hold off;
end
end