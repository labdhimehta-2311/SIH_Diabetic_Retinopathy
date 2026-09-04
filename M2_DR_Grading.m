function [severityLevel, isReferable, confidence] = M2_DR_Grading(enhancedImage)
% M2 - DR SEVERITY GRADING & EXPLAINABILITY MODULE

persistent net;
if isempty(net)
    load('trainedDRModel.mat', 'trainedNet'); 
    net = trainedNet;
end

% Preprocess to match ResNet-50 input layer
inputSize = net.Layers(1).InputSize(1:2);
img = imresize(enhancedImage, inputSize);

% Prediction
[YPred, scores] = classify(net, img);
severityLevel = double(string(YPred)); 
confidence = max(scores);
isReferable = severityLevel >= 2;

% Explainability (Grad-CAM)
camMap = gradCAM(net, img, YPred);

% Generate Clinical Report UI
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