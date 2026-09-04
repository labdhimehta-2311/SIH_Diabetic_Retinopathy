function overlayImg = overlayGradCAM(img, camMap, alpha, colormapName)
% OVERLAYGRADCAM Fuses Grad-CAM continuous heatmaps over RGB fundus images
%
% Syntax:
%   overlayImg = overlayGradCAM(img, camMap)
%   overlayImg = overlayGradCAM(img, camMap, alpha, colormapName)
%
% Inputs:
%   img          - Original RGB fundus image (uint8 or double)
%   camMap       - M x N continuous attention map in [0.0, 1.0]
%   alpha        - (Optional) Heatmap blending factor in [0.0, 1.0] (default = 0.45)
%   colormapName - (Optional) Colormap string: 'turbo' (default) or 'jet'
%
% Outputs:
%   overlayImg - M x N x 3 uint8 RGB image with blended clinical saliency heatmap
%
% Clinical Relevance:
%   Overlaying saliency maps directly onto fundus photographs enables the reviewing
%   ophthalmologist to instantly verify whether the AI model based its severity grade
%   on genuine clinical lesions (e.g. macular exudates, flame hemorrhages) rather
%   than peripheral artifacts, camera dust, or lens flare.
%
% Authors: SIH 2026 Team (Member 4 - Explainable AI: labdhimehta-2311)

    if nargin < 2
        error('overlayGradCAM:InsufficientInputs', 'img and camMap are required.');
    end

    if ~isa(img, 'uint8')
        img = im2uint8(img);
    end

    [rows, cols, channels] = size(img);
    if channels == 1
        img = repmat(img, [1 1 3]);
    end

    defaultAlpha = 0.45;
    defaultCmap = 'turbo';
    if exist('projectConfig', 'file')
        cfg = projectConfig();
        defaultAlpha = cfg.explainability.overlayAlpha;
        defaultCmap = cfg.explainability.colormap;
    end

    if nargin < 3 || isempty(alpha)
        alpha = defaultAlpha;
    end
    if nargin < 4 || isempty(colormapName)
        colormapName = defaultCmap;
    end

    % 1. Ensure camMap matches image spatial dimensions
    if size(camMap, 1) ~= rows || size(camMap, 2) ~= cols
        camMap = imresize(camMap, [rows, cols]);
    end
    camMap = max(0.0, min(1.0, double(camMap)));

    % 2. Convert Scalar Heatmap to RGB Pseudocolor Map (256-level colormap)
    numColors = 256;
    try
        cmap = feval(colormapName, numColors);
    catch
        cmap = jet(numColors); % Fallback to standard jet
    end

    % Discretize camMap to [1, numColors]
    idxMap = round(camMap * (numColors - 1)) + 1;
    heatmapRgb = ind2rgb(idxMap, cmap);
    heatmapUint8 = im2uint8(heatmapRgb);

    % 3. Alpha Blending: I_out = (1 - alpha) * I_fundus + alpha * I_heatmap
    blended = zeros(rows, cols, 3, 'uint8');
    for c = 1:3
        fundusCh  = double(img(:, :, c));
        heatmapCh = double(heatmapUint8(:, :, c));
        outCh = (1.0 - alpha) * fundusCh + alpha * heatmapCh;
        blended(:, :, c) = uint8(max(0, min(255, outCh)));
    end

    % 4. Preserve Black Non-Retinal Background
    if exist('detectRetinalFOV', 'file')
        fovMask = detectRetinalFOV(img);
    else
        gray = rgb2gray(img);
        fovMask = gray > 12;
        se = strel('disk', 5);
        fovMask = imclose(fovMask, se);
    end

    for c = 1:3
        ch = blended(:, :, c);
        ch(~fovMask) = 0;
        blended(:, :, c) = ch;
    end

    overlayImg = blended;
end
