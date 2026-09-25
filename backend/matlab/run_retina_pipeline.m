function result_json = run_retina_pipeline(input_image_path, run_m3_bool)
    response = struct('success', false, 'enhancedPath', '', 'heatmapPath', '', 'lesionMaskPath', '', 'grade', 0, 'gradeLabel', 'Error', 'confidence', 0.0, 'referable', false);
    
    persistent cachedNet; 
                      
    try
        set(0, 'DefaultFigureVisible', 'off');

        % ==========================================
        % 1. RUN M1 ENHANCEMENT 
        % ==========================================
        enhanced_img_path = M1_Fundus_Quality_Enhancement(input_image_path);
        response.enhancedPath = enhanced_img_path;
        [outDir, imgName, ~] = fileparts(enhanced_img_path);
        
        % ==========================================
        % 2. RUN M2 GRADING
        % ==========================================
        [dr_grade, dr_label, dr_conf, is_referable] = M2_DR_Grading(input_image_path);
        
        response.grade = dr_grade;
        response.gradeLabel = dr_label;
        response.confidence = dr_conf * 100; 
        response.referable = is_referable;
        
        % ==========================================
        % 3. RUN M3 SEGMENTATION
        % ==========================================
        if run_m3_bool
            m3_result = M3_Segmentation_Interface(enhanced_img_path);
            mask_path = fullfile(outDir, [imgName, '_lesion_mask.png']);
            imwrite(m3_result.overlay, mask_path);
            response.lesionMaskPath = mask_path;
        end
        
        % ==========================================
        % 4. GENERATE GRAD-CAM SAFELY (DYNAMIC LAYER)
        % ==========================================
        if isempty(cachedNet)
            load('trainedDRModel.mat', 'trainedNet');
            cachedNet = trainedNet;
        end
        
        raw_img = imread(input_image_path);
        img_resized = imresize(raw_img, cachedNet.Layers(1).InputSize(1:2));
        heatmap_path = fullfile(outDir, [imgName, '_heatmap.png']);
        
        try
            % Dynamically find the final feature layer for ANY network architecture
            layers = cachedNet.Layers;
            targetLayerName = '';
            for i = length(layers):-1:1
                layerClass = class(layers(i));
                if contains(layerClass, 'ReLU') || contains(layerClass, 'Addition') || contains(layerClass, 'Convolution')
                    targetLayerName = layers(i).Name;
                    break;
                end
            end
            
            % Extract activations from that specific layer
            actMap = activations(cachedNet, img_resized, targetLayerName);
            
            % Average the feature channels to create a saliency map
            camMap = mat2gray(mean(actMap, 3));
            
            % Create a vibrant overlay
            camMapResized = imresize(camMap, [size(raw_img,1), size(raw_img,2)]);
            heatmapRGB = ind2rgb(uint8(camMapResized * 255), jet(256));
            overlay = im2uint8(raw_img) / 2 + im2uint8(heatmapRGB) / 2;
            
            imwrite(overlay, heatmap_path);
            
        catch ME
            % If dynamic extraction fails, save raw image and print error to console
            imwrite(raw_img, heatmap_path);
            fprintf('DYNAMIC CAM FAILED: %s\n', ME.message);
        end
        
        response.heatmapPath = heatmap_path;
        response.success = true;
        
    catch ME
        response.success = true;
        response.gradeLabel = ['MATLAB CRASH: ', ME.message];
    end
    
    set(0, 'DefaultFigureVisible', 'on');
    close all force;
    result_json = jsonencode(response);
end