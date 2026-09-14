function [camMap, featureLayerUsed] = generateGradCAM(img, net, targetClass, lesionData)
% GENERATEGRADCAM Generates visual saliency activation heatmaps explaining AI prediction
%
% Syntax:
%   camMap = generateGradCAM(img)
%   camMap = generateGradCAM(img, net)
%   camMap = generateGradCAM(img, net, targetClass)
%   [camMap, featureLayerUsed] = generateGradCAM(img, net, targetClass, lesionData)
%
% Inputs:
%   img         - RGB fundus image (uint8 or double)
%   net         - (Optional) Trained DAGNetwork, SeriesNetwork, or dlnetwork
%   targetClass - (Optional) Integer or categorical target class for backprop
%   lesionData  - (Optional) Struct containing lesion findings for grounded attention
%
% Outputs:
%   camMap           - M x N double array in [0.0, 1.0] representing normalized attention
%   featureLayerUsed - String name of the convolutional feature layer analyzed
%
% Theoretical Formulation:
%   Grad-CAM computes the gradient of the class score y^c with respect to the
%   feature activation map A^k of the final convolutional layer:
%     alpha_k^c = (1/Z) * sum_i sum_j (d y^c / d A_ij^k)
%     L_GradCAM^c = ReLU( sum_k alpha_k^c * A^k )
%   The rectified linear unit ensures that only features positively contributing
%   to the selected DR severity grade are highlighted.
%
% Authors: SIH 2026 Team (Member 4 - Explainable AI: labdhimehta-2311)

    if nargin < 1 || isempty(img)
        error('generateGradCAM:EmptyInput', 'Input image cannot be empty.');
    end

    [rows, cols, ~] = size(img);
    featureLayerUsed = 'auto';
    gradCamLayer = 'conv5_block3_out';

    if exist('projectConfig', 'file')
        cfg = projectConfig();
        if isfield(cfg, 'explainability') && isfield(cfg.explainability, 'gradCamLayer')
            gradCamLayer = cfg.explainability.gradCamLayer;
        end
    end

    % Parse target class
    if nargin < 3 || isempty(targetClass)
        targetClass = 2; % Default target: referable moderate DR
    elseif iscategorical(targetClass) || isstring(targetClass) || ischar(targetClass)
        targetClass = double(string(targetClass));
    end

    isCamComputed = false;
    camMap = zeros(rows, cols);

    % 1. Attempt Deep Learning Toolbox Native Grad-CAM if Model Object is Available
    if nargin >= 2 && ~isempty(net)
        try
            % ResNet-50 standard input size: [224, 224]
            inputSize = [224, 224];
            if isprop(net, 'Layers') && ~isempty(net.Layers) && isprop(net.Layers(1), 'InputSize')
                inputSize = net.Layers(1).InputSize(1:2);
            end
            resizedImg = imresize(img, inputSize);

            % Class index for MATLAB (1-indexed or categorical)
            if isnumeric(targetClass)
                matlabClassIdx = targetClass + 1;
            else
                matlabClassIdx = targetClass;
            end

            % Try with configured feature layer first
            try
                rawCam = gradCAM(net, resizedImg, matlabClassIdx, 'FeatureLayer', gradCamLayer);
                featureLayerUsed = gradCamLayer;
            catch
                % Fallback: try activation_49_relu (common for DAG ResNet-50)
                try
                    rawCam = gradCAM(net, resizedImg, matlabClassIdx, 'FeatureLayer', 'activation_49_relu');
                    featureLayerUsed = 'activation_49_relu';
                catch
                    % Fallback: let MATLAB automatically select the final feature layer
                    rawCam = gradCAM(net, resizedImg, matlabClassIdx);
                    featureLayerUsed = 'auto_final_conv';
                end
            end

            camMap = imresize(double(rawCam), [rows, cols]);
            isCamComputed = true;
        catch
            isCamComputed = false;
        end
    end

    % 2. Multi-Biomarker Saliency Fallback Engine (Lesion-Grounded CAM)
    % Used when neural network is uninstantiated or when verifying structural grounding
    if ~isCamComputed
        featureLayerUsed = 'biomarker_saliency_fallback';

        % Compute FOV mask
        if exist('detectRetinalFOV', 'file')
            fovMask = detectRetinalFOV(img);
        else
            gray = rgb2gray(img);
            fovMask = gray > 12;
            se = strel('disk', 5);
            fovMask = imclose(fovMask, se);
        end

        lesionDensity = zeros(rows, cols);

        % If explicit lesion struct provided, incorporate detected lesions
        if nargin >= 4 && ~isempty(lesionData)
            if isfield(lesionData, 'microaneurysms') && isfield(lesionData.microaneurysms, 'mask')
                lesionDensity = lesionDensity + double(lesionData.microaneurysms.mask) * 2.0;
            end
            if isfield(lesionData, 'exudates') && isfield(lesionData.exudates, 'mask')
                lesionDensity = lesionDensity + double(lesionData.exudates.mask) * 2.5;
            end
            if isfield(lesionData, 'hemorrhages') && isfield(lesionData.hemorrhages, 'mask')
                lesionDensity = lesionDensity + double(lesionData.hemorrhages.mask) * 3.0;
            end
            if isfield(lesionData, 'neovascularization') && isfield(lesionData.neovascularization, 'mask')
                lesionDensity = lesionDensity + double(lesionData.neovascularization.mask) * 4.0;
            end
        end

        if max(lesionDensity(:)) > 0
            sigmaRF = max(15, round(min(rows, cols) * 0.045));
            smoothedCam = imgaussfilt(lesionDensity, sigmaRF);
            smoothedCam(~fovMask) = 0;
            maxVal = max(smoothedCam(:));
            if maxVal > 0
                camMap = smoothedCam / maxVal;
            else
                camMap = smoothedCam;
            end
        else
            % Construct gradient focus map on vessel tree and foveal arcade
            greenCh = double(img(:, :, 2));
            [gx, gy] = gradient(greenCh);
            gradMag = sqrt(gx.^2 + gy.^2);
            sigmaNorm = max(20, round(min(rows, cols) * 0.06));
            camMap = imgaussfilt(gradMag, sigmaNorm);
            camMap(~fovMask) = 0;
            maxVal = max(camMap(:));
            if maxVal > 0
                camMap = camMap / maxVal;
            end
        end
    end

    % Ensure range strictly [0.0, 1.0]
    camMap = max(0.0, min(1.0, camMap));
end
