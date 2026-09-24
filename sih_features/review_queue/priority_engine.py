"""
Intelligent Review Priority Queue Engine
----------------------------------------
Orders the ophthalmologist review queue by urgency score (referable + high lesion burden +
uncertainty) rather than FIFO, reducing clinical delay for vision-threatening cases.

Configurable weights via sih_config.json.
Does NOT claim the priority score is a clinically validated prognostic metric.
"""

from ..config import get_config_section

def calculate_priority_score(normalized_case, dme_risk_flag=None):
    """
    Computes a composite priority index between 0.0 and 1.0.
    """
    cfg = get_config_section("review_queue", {
        "weights": {
            "grade_weight": 0.45,
            "confidence_uncertainty_weight": 0.20,
            "dme_risk_weight": 0.20,
            "symptom_urgency_weight": 0.15
        },
        "high_priority_threshold": 0.65,
        "review_priority_threshold": 0.35
    })
    
    weights = cfg.get("weights", {})
    w_grade = weights.get("grade_weight", 0.45)
    w_uncert = weights.get("confidence_uncertainty_weight", 0.20)
    w_dme = weights.get("dme_risk_weight", 0.20)
    w_sym = weights.get("symptom_urgency_weight", 0.15)
    
    grade = normalized_case.get("grade", 0)
    confidence = float(normalized_case.get("confidence", 90.0))
    
    # Grade term: 0..4 normalized to 0.0..1.0
    grade_factor = min(1.0, grade / 4.0)
    
    # Uncertainty term: (100 - conf) / 100
    uncertainty_factor = max(0.0, min(1.0, (100.0 - confidence) / 100.0))
    
    # DME term
    dme_factor = 0.0
    if dme_risk_flag == "HIGH":
        dme_factor = 1.0
    elif dme_risk_flag in ["MODERATE", "POSSIBLE"]:
        dme_factor = 0.5
    elif normalized_case.get("m3_result", {}).get("lesions", {}).get("macular_involvement"):
        dme_factor = 0.6
        
    # Quality / symptom urgency
    symptom_factor = 0.0
    if not normalized_case.get("image_quality", {}).get("is_assessable", True):
        symptom_factor = 0.7
    elif grade >= 2:
        symptom_factor = 0.4
        
    score = (
        w_grade * grade_factor +
        w_uncert * uncertainty_factor +
        w_dme * dme_factor +
        w_sym * symptom_factor
    )
    score = round(float(min(1.0, max(0.0, score))), 3)
    
    high_th = cfg.get("high_priority_threshold", 0.65)
    rev_th = cfg.get("review_priority_threshold", 0.35)
    
    if score >= high_th or grade >= 3:
        priority_tier = "HIGH PRIORITY"
        tier_color = "rose"
        symbol = "🔴"
        wait_target_min = 15
        rationale = "High lesion burden / referable disease requires expedited review (<15 min target)."
    elif score >= rev_th or grade >= 1:
        priority_tier = "REVIEW"
        tier_color = "amber"
        symbol = "🟠"
        wait_target_min = 45
        rationale = "Moderate risk or borderline uncertainty placed in regular specialist review queue."
    else:
        priority_tier = "ROUTINE"
        tier_color = "emerald"
        symbol = "🟢"
        wait_target_min = 180
        rationale = "Low-risk non-referable result scheduled for routine validation."
        
    return {
        "case_id": normalized_case.get("case_id", "UNKNOWN"),
        "priority_score": score,
        "priority_tier": priority_tier,
        "symbol": symbol,
        "tier_color": tier_color,
        "estimated_wait_target_minutes": wait_target_min,
        "rationale": rationale,
        "disclaimer": "Operational prioritization index. Not a clinically validated prognostic score."
    }

def prioritize_queue(case_list):
    """
    Sorts a list of cases by descending priority score.
    """
    scored_cases = []
    for c in case_list:
        score_info = calculate_priority_score(c)
        scored_cases.append({
            **c,
            "priority": score_info
        })
    scored_cases.sort(key=lambda x: x["priority"]["priority_score"], reverse=True)
    for idx, c in enumerate(scored_cases):
        c["priority"]["queue_rank"] = idx + 1
    return scored_cases
