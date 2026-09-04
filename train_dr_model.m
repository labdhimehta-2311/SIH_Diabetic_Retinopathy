clear; clc;

% 1. Load Dataset Table
data = readtable("train_enhanced.csv", 'Delimiter', ',', 'VariableNamingRule', 'preserve');
data.diagnosis = categorical(data.diagnosis);

% 2. Stratified Train-Validation Split (80/20)
cv = cvpartition(data.diagnosis, 'HoldOut', 0.20);
trainData = data(training(cv), :);
valData = data(test(cv), :);

% 3. Datastores & Augmentation
inputSize = [224 224 3];

imdsTrain = imageDatastore(trainData.image_path, 'Labels', trainData.diagnosis);
imdsVal = imageDatastore(valData.image_path, 'Labels', valData.diagnosis);

augmenter = imageDataAugmenter( ...
    'RandRotation', [-180 180], ...
    'RandXReflection', true, ...
    'RandYReflection', true, ...
    'RandScale', [0.85 1.15]);

augTrain = augmentedImageDatastore(inputSize(1:2), imdsTrain, 'DataAugmentation', augmenter);
augVal = augmentedImageDatastore(inputSize(1:2), imdsVal);

% 4. Load & Adapt ResNet-50
net = resnet50;
lgraph = layerGraph(net);

numClasses = 5;
newFCLayer = fullyConnectedLayer(numClasses, 'Name', 'fc_dr', ...
    'WeightLearnRateFactor', 10, 'BiasLearnRateFactor', 10);
newClassLayer = classificationLayer('Name', 'output_dr');

lgraph = replaceLayer(lgraph, 'fc1000', newFCLayer);
lgraph = replaceLayer(lgraph, 'ClassificationLayer_fc1000', newClassLayer);

% 5. Training Options
options = trainingOptions('adam', ...
    'MiniBatchSize', 32, ...
    'MaxEpochs', 8, ...
    'InitialLearnRate', 1e-4, ...
    'LearnRateSchedule', 'piecewise', ...
    'LearnRateDropFactor', 0.5, ...
    'LearnRateDropPeriod', 3, ...
    'ValidationData', augVal, ...
    'ValidationFrequency', 20, ...
    'Shuffle', 'every-epoch', ...
    'Plots', 'training-progress', ...
    'Verbose', true);

% 6. Train Network
fprintf("Beginning ResNet-50 Training...\n");
trainedNet = trainNetwork(augTrain, lgraph, options);
save('trainedDRModel.mat', 'trainedNet');

% 7. Referable DR Validation Metrics (Levels 2+ vs 0-1)
[predLabels, ~] = classify(trainedNet, augVal);
trueLabels = imdsVal.Labels;

trueReferable = double(string(trueLabels)) >= 2;
predReferable = double(string(predLabels)) >= 2;

TP = sum((predReferable == 1) & (trueReferable == 1));
TN = sum((predReferable == 0) & (trueReferable == 0));
FP = sum((predReferable == 1) & (trueReferable == 0));
FN = sum((predReferable == 0) & (trueReferable == 1));

sensitivity = TP / (TP + FN);
specificity = TN / (TN + FP);

fprintf("\n--- CLINICAL BENCHMARKS (REFERABLE DR) ---\n");
fprintf("Sensitivity: %.2f%% (Target: >90%%)\n", sensitivity * 100);
fprintf("Specificity: %.2f%% (Target: >85%%)\n", specificity * 100);