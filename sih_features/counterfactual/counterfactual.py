"""
Counterfactual Visual Explanation
---------------------------------
Synthesizes a "What a healthier retina would look like here" visual counterpart
by removing localized lesion focal anomalies and inpainting them with healthy surrounding
retinal background tissue. Clinicians find this generative comparison more intuitive
and explainable than abstract gradient heatmaps alone.

Does NOT modify existing M1-M4 models.
"""

import os
import cv2
import numpy as np

def generate_counterfactual_explanation(enhanced_img_path, lesion_mask_path=None, output_path=None):
    """
    Generates a counterfactual (healthy counterpart) fundus image using inpainting.
    """
    if not enhanced_img_path or not os.path.exists(enhanced_img_path):
        return {
            "status": "UNAVAILABLE",
            "message": "Input enhanced image not found for counterfactual generation."
        }
        
    img = cv2.imread(enhanced_img_path)
    if img is None:
        return {"status": "ERROR", "message": "Failed to read fundus image."}
        
    h, w = img.shape[:2]
    
    # Generate lesion inpainting mask
    if lesion_mask_path and os.path.exists(lesion_mask_path):
        mask_raw = cv2.imread(lesion_mask_path, cv2.IMREAD_GRAYSCALE)
        if mask_raw is not None:
            _, inpaint_mask = cv2.threshold(mask_raw, 30, 255, cv2.THRESH_BINARY)
        else:
            inpaint_mask = np.zeros((h, w), dtype=np.uint8)
    else:
        # Inpaint dark lesion spots detected in green channel
        green = img[:, :, 1]
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
        bg = cv2.morphologyEx(green, cv2.MORPH_OPEN, kernel)
        diff = cv2.subtract(bg, green)
        _, inpaint_mask = cv2.threshold(diff, 18, 255, cv2.THRESH_BINARY)
        
    # Dilate slightly for seamless edge inpainting
    inpaint_mask = cv2.dilate(inpaint_mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)))
    
    # Inpaint using Navier-Stokes based fluid dynamics inpainting
    counterfactual_img = cv2.inpaint(img, inpaint_mask, inpaintRadius=4, flags=cv2.INPAINT_NS)
    
    if output_path:
        cv2.imwrite(output_path, counterfactual_img)
        
    return {
        "status": "SUCCESS",
        "method": "Navier-Stokes Generative Retinal Inpainting",
        "lesion_pixels_inpainted": int(np.count_nonzero(inpaint_mask)),
        "clinical_utility": "Clinicians can toggle between actual lesion pathology and simulated healthy retinal bed to assess microvascular remodeling.",
        "disclaimer": "⚠️ Synthesized counterfactual visual explanation for clinical explainability. Not an actual historical image."
    }
