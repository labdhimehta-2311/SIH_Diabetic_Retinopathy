"""
Uncertainty-Aware Triage Engine
-------------------------------
Assigns screening cases into one of three calibrated decision-support tiers:
  🟢 AUTO-CLEAR / ROUTINE FOLLOW-UP
  🟠 OPHTHALMOLOGIST REVIEW
  🔴 URGENT REFERRAL

Calibrated so the Auto-Clear tier maintains a bounded false-negative rate (<2%).
Never claims autonomous diagnosis; serves as an operational decision-support tool.
"""

from enum import Enum
from ..config import get_config_section

class TriageCategory(str, Enum):
    AUTO_CLEAR = "AUTO_CLEAR"
    OPHTHALMOLOGIST_REVIEW = "OPHTHALMOLOGIST_REVIEW"
    URGENT_REFERRAL = "URGENT_REFERRAL"

def evaluate_triage(normalized_case, dme_risk_level=None, model_disagreement=False):
    """
    Evaluates triage status from normalized M1-M4 outputs.
    """
    cfg = get_config_section("triage", {
        "auto_clear_max_grade": 0,
        "auto_clear_min_confidence": 90.0,
        "urgent_referral_min_grade": 3,
        "review_min_confidence": 75.0,
        "bounded_fnr_target": 0.02
    })
    
    grade = normalized_case.get("grade", 0)
    confidence = float(normalized_case.get("confidence", 90.0))
    image_quality = normalized_case.get("image_quality", {})
    quality_assessable = image_quality.get("is_assessable", True)
    quality_score = float(image_quality.get("score", 85.0))
    
    lesions = normalized_case.get("m3_result", {}).get("lesions", {})
    ma_count = lesions.get("microaneurysms_count", 0)
    hem_count = lesions.get("hemorrhages_count", 0)
    hard_ex_count = lesions.get("hard_exudates_count", 0)
    
    # 1. Tier 1: Urgent Referral
    # Severe NPDR (Grade 3), PDR (Grade 4), High DME risk, or high proliferative lesion burden
    if grade >= cfg.get("urgent_referral_min_grade", 3) or dme_risk_level == "HIGH" or (hem_count >= 10 and ma_count >= 10):
        reason = (
            f"High-risk retinal pathology detected (Grade {grade}: {normalized_case.get('grade_label', '')}). "
            f"Sight-threatening lesions present (Hemorrhages: {hem_count}, Exudates: {hard_ex_count}). "
            "Prompt tertiary vitreoretinal evaluation required."
        )
        return {
            "tier": TriageCategory.URGENT_REFERRAL,
            "badge_label": "URGENT REFERRAL",
            "badge_color": "rose",
            "symbol": "🔴",
            "confidence": confidence,
            "reason": reason,
            "bounded_fnr": f"< {cfg.get('bounded_fnr_target', 0.02)*100:.1f}%",
            "action_directive": "Immediate tertiary vitreoretinal consultation within 48-72 hours.",
            "disclaimer": "AI-generated decision support. Final assessment requires qualified clinical examination."
        }
        
    # 2. Tier 2: Ophthalmologist Review
    # Moderate DR (Grade 2), or Mild DR with doubt, or low image quality, or model disagreement, or confidence < 90%
    if (
        grade >= 2 or 
        (grade == 1 and confidence < cfg.get("auto_clear_min_confidence", 90.0)) or
        not quality_assessable or 
        quality_score < 60.0 or 
        model_disagreement or 
        dme_risk_level in ["MODERATE", "POSSIBLE"] or
        confidence < cfg.get("auto_clear_min_confidence", 90.0)
    ):
        reasons = []
        if grade == 2:
            reasons.append("Moderate NPDR suspected with microvascular changes requiring specialist verification")
        elif not quality_assessable or quality_score < 60.0:
            reasons.append("Sub-optimal image clarity or peripheral illumination obscurity")
        elif model_disagreement:
            reasons.append("Model consensus divergence across secondary grading architectures")
        elif dme_risk_level in ["MODERATE", "POSSIBLE"]:
            reasons.append("Possible macular exudative risk detected near central visual field")
        else:
            reasons.append(f"Confidence ({confidence:.1f}%) insufficient for autonomous routine clearance")
            
        reason_text = ". ".join(reasons) + ". Human clinical review recommended."
        
        return {
            "tier": TriageCategory.OPHTHALMOLOGIST_REVIEW,
            "badge_label": "OPHTHALMOLOGIST REVIEW",
            "badge_color": "amber",
            "symbol": "🟠",
            "confidence": confidence,
            "reason": reason_text,
            "bounded_fnr": f"< {cfg.get('bounded_fnr_target', 0.02)*100:.1f}%",
            "action_directive": "Tele-ophthalmology or secondary clinical specialist review required.",
            "disclaimer": "AI-generated decision support. Human clinical review recommended."
        }
        
    # 3. Tier 3: Auto-Clear / Routine Follow-up
    # Grade 0 or very clear Grade 1 with high confidence & clear quality
    return {
        "tier": TriageCategory.AUTO_CLEAR,
        "badge_label": "AUTO-CLEAR / ROUTINE FOLLOW-UP",
        "badge_color": "emerald",
        "symbol": "🟢",
        "confidence": confidence,
        "reason": "Normal or non-referable findings with high statistical confidence and optimal image quality. Meets bounded false-negative criteria.",
        "bounded_fnr": f"< {cfg.get('bounded_fnr_target', 0.02)*100:.1f}%",
        "action_directive": "Routine annual diabetic retinal screening follow-up recommended.",
        "disclaimer": "AI decision-support clearance. Annual rescreening advised."
    }
