function [camMap, featureLayerUsed] = gradCAM(varargin)
% GRADCAM Flexible wrapper for Gradient-weighted Class Activation Mapping (Grad-CAM)
%
% Syntax:
%   camMap = gradCAM(net, img, targetClass)
%   camMap = gradCAM(img, net, targetClass)
%   camMap = gradCAM(img)
%   [camMap, featureLayerUsed] = gradCAM(...)
%
% Description:
%   Provides full interoperability with existing group code in M2_DR_Grading.m
%   which invokes: camMap = gradCAM(net, img, YPred);
%   Routes directly to Member 4's high-precision explainability engine.
%
% Authors: SIH 2026 Team (Member 4 - Explainable AI: labdhimehta-2311)

    % Ensure explainability directory is on path
    thisDir = fileparts(mfilename('fullpath'));
    addpath(fullfile(thisDir, 'src', 'explainability'));
    addpath(fullfile(thisDir, 'config'));

    if nargin < 1
        error('gradCAM:InsufficientInputs', 'At least an input image or network must be provided.');
    end

    arg1 = varargin{1};
    net = [];
    img = [];
    targetClass = 2;
    lesionData = [];

    % Determine argument order: (net, img, ...) vs (img, net, ...)
    if (isnumeric(arg1) || isa(arg1, 'uint8')) && (ndims(arg1) >= 2)
        % First arg is image
        img = arg1;
        if nargin >= 2, net = varargin{2}; end
        if nargin >= 3, targetClass = varargin{3}; end
        if nargin >= 4, lesionData = varargin{4}; end
    else
        % First arg is net (as called by M2_DR_Grading: gradCAM(net, img, YPred))
        net = arg1;
        if nargin >= 2, img = varargin{2}; end
        if nargin >= 3, targetClass = varargin{3}; end
        if nargin >= 4, lesionData = varargin{4}; end
    end

    if isempty(img)
        error('gradCAM:EmptyImage', 'Fundus image must be provided.');
    end

    % Call Member 4 core implementation
    [camMap, featureLayerUsed] = generateGradCAM(img, net, targetClass, lesionData);
end
