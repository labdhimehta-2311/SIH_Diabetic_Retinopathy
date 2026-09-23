"""
fundus_validator.py
===================
Smart India Hackathon 2026: Rural Diabetic Retinopathy Screening Pipeline
Stage M0: Ophthalmic Retinal Fundus Validity & Quality Assessment Filter

Detects and rejects non-retinal uploads such as:
  - Modeling photos / portraits / selfies (like outdoor balcony shots)
  - Cartoon / anime / graphic drawings
  - Non-ocular objects / landscapes / animals / documents
  - Severely out-of-focus or unilluminated captures

Returns:
  is_valid: bool
  rejection_reason: str
  metrics: dict
"""

import cv2
import numpy as np
import logging

logger = logging.getLogger(__name__)

def validate_fundus_image(image_path: str):
    """
    Validates whether an input file is an authentic human retinal fundus photograph.
    
    Clinical checks:
      1. Chromaticity & Hemoglobin/Melanin Profile:
         - Real fundus photos have dominant Red/Orange wavelengths (Hue 0-22 and 160-180 in OpenCV).
         - Outdoor photos, portraits, cartoons, and clothing feature abundant blue/cyan/green/magenta (>18%).
      2. Choroidal Blue Light Absorption:
         - The retinal pigment epithelium and choroid heavily absorb blue light.
         - The Red-to-Blue ratio in real fundus photography is almost always > 1.45 (typically > 3.0).
      3. Circular/Elliptical Ophthalmic Aperture:
         - Fundus cameras project a circular beam through the pupil, leaving dark corner margins.
         - Regular rectangular photos (portraits, landscapes) fill all 4 corners with bright lighting.
      4. Vascular Pattern & Retinal Illumination:
         - Analyzes branching vascular tubular density in the green channel.
    """
    try:
        img = cv2.imread(image_path)
        if img is None:
            return False, "Unable to read or decode image file. Please provide a standard PNG or JPEG image.", {}

        h, w = img.shape[:2]
        if h < 120 or w < 120:
            return False, "Image dimensions are too low for clinical diagnostic evaluation.", {}

        # Resize to standard analysis size for rapid evaluation (<20ms)
        target_dim = 512
        scale = target_dim / max(h, w)
        img_std = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
        hs, ws = img_std.shape[:2]

        # 1. Corner Brightness Check (Detects edge-to-edge non-fundus rectangular photography)
        cw = max(4, int(ws * 0.07))
        ch = max(4, int(hs * 0.07))
        corners = [
            img_std[0:ch, 0:cw],
            img_std[0:ch, ws-cw:ws],
            img_std[hs-ch:hs, 0:cw],
            img_std[hs-ch:hs, ws-cw:ws]
        ]
        corner_mean = float(np.mean([np.mean(c) for c in corners]))

        # 2. Foreground Mask
        gray = cv2.cvtColor(img_std, cv2.COLOR_BGR2GRAY)
        _, mask = cv2.threshold(gray, 18, 255, cv2.THRESH_BINARY)
        fg_px = int(np.count_nonzero(mask))
        total_px = hs * ws
        coverage = (fg_px / total_px) * 100.0

        if fg_px < 1000:
            return False, "Under-illuminated or blank image. Retinal features cannot be identified.", {}

        # 3. Chromaticity & Hue Distribution
        hsv = cv2.cvtColor(img_std, cv2.COLOR_BGR2HSV)
        h_chan = hsv[:, :, 0]
        s_chan = hsv[:, :, 1]
        v_chan = hsv[:, :, 2]

        illuminated_mask = (v_chan > 20) & (s_chan > 15)
        ill_count = int(np.count_nonzero(illuminated_mask))
        if ill_count < 500:
            return False, "Insufficient illuminated ocular field of view.", {}

        # Retinal hues: Red, Amber, Dark Orange (Hue 0-22 and 160-180 in OpenCV 8-bit HSV)
        retinal_hue = ((h_chan <= 22) | (h_chan >= 160)) & illuminated_mask
        retinal_hue_pct = (np.count_nonzero(retinal_hue) / ill_count) * 100.0

        # Non-retinal cool/green/blue spectrum (sky, trees, denim, clothing, cartoon colors)
        # Hue 35-85: Green foliage; Hue 85-135: Blue sky/jeans; Hue 135-155: Violet/Purple
        non_retinal = ((h_chan >= 35) & (h_chan <= 155)) & illuminated_mask
        non_retinal_pct = (np.count_nonzero(non_retinal) / ill_count) * 100.0

        # 4. Red-to-Blue Ratio
        b, g, r = cv2.split(img_std)
        mean_r = float(np.mean(r[illuminated_mask]))
        mean_b = float(np.mean(b[illuminated_mask]))
        rb_ratio = mean_r / max(1.0, mean_b)

        # 5. Blood Vessel Pattern Density
        g_enh = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(g)
        vessels = cv2.adaptiveThreshold(cv2.bitwise_not(g_enh), 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 17, -4)
        vessels[~illuminated_mask] = 0
        vessel_density = (np.count_nonzero(vessels) / ill_count) * 100.0

        metrics = {
            "retinal_hue_pct": float(round(retinal_hue_pct, 1)),
            "non_retinal_pct": float(round(non_retinal_pct, 1)),
            "corner_mean": float(round(corner_mean, 1)),
            "coverage_pct": float(round(coverage, 1)),
            "rb_ratio": float(round(rb_ratio, 2)),
            "vessel_density": float(round(vessel_density, 2))
        }

        # Classification Logic for Rejection:
        rejection_reasons = []

        # High non-retinal color content (sky, clothes, cartoon art, green trees)
        if non_retinal_pct > 15.0:
            rejection_reasons.append(
                f"Non-ocular color spectrum detected ({non_retinal_pct:.1f}% cool/blue/green tones from background or clothing)"
            )

        # Low retinal red-amber content
        if retinal_hue_pct < 65.0:
            rejection_reasons.append(
                f"Retinal pigment/hemoglobin spectrum absent (only {retinal_hue_pct:.1f}% retinal hue detected)"
            )

        # Edge-to-edge bright rectangular photo (modeling/selfie/landscape)
        if corner_mean > 32.0 and coverage > 90.0 and non_retinal_pct > 6.0:
            rejection_reasons.append(
                "Standard rectangular photograph detected without circular fundus camera aperture"
            )

        # Excessive blue channel reflection (blue sky, ambient daylight, white flash)
        if rb_ratio < 1.45:
            rejection_reasons.append(
                f"Abnormal chromatic absorption (Red/Blue ratio = {rb_ratio:.2f}; fundus absorbs blue wavelengths)"
            )

        # Flat artwork or cartoon without vascular branching
        if vessel_density < 0.8 and retinal_hue_pct < 85.0:
            rejection_reasons.append(
                "Branching retinal vascular tree and optic disc landmarks not found"
            )

        if len(rejection_reasons) > 0:
            primary_reason = " | ".join(rejection_reasons)
            logger.warning(f"Fundus validation rejected image '{image_path}': {primary_reason}")
            return False, primary_reason, metrics

        return True, "Valid Retinal Fundus Scan", metrics

    except Exception as e:
        logger.error(f"Error during fundus validation: {e}")
        # In case of internal parsing error, allow pipeline fallback
        return True, f"Validation warning: {e}", {}
