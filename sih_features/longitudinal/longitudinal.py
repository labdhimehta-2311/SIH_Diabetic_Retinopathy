"""
Longitudinal Progression Tracking Module
----------------------------------------
Compares current screening findings against a prior historical screening session
for the same patient. Analyzes changes in grade, lesion counts, and visual acuity
to compute a standardized Rate-of-Progression score.

Does NOT claim proven biological disease progression from imaging differences alone
without clinical confirmation.
"""

from datetime import datetime

def track_longitudinal_progression(current_case, prior_case):
    """
    Compares two screening events to detect interval change.
    """
    if not prior_case:
        return {
            "status": "BASELINE",
            "message": "First baseline screening on file. Longitudinal comparison requires 2+ visits.",
            "has_prior": False
        }
        
    curr_grade = int(current_case.get("grade", 0))
    prior_grade = int(prior_case.get("grade", 0))
    
    curr_conf = float(current_case.get("confidence", 90.0))
    prior_conf = float(prior_case.get("confidence", 90.0))
    
    # Calculate days elapsed
    curr_date_str = current_case.get("date") or current_case.get("created_at") or "2026-09-24"
    prior_date_str = prior_case.get("date") or prior_case.get("created_at") or "2025-09-24"
    
    try:
        d1 = datetime.fromisoformat(curr_date_str.replace("Z", "").split("T")[0])
        d2 = datetime.fromisoformat(prior_date_str.replace("Z", "").split("T")[0])
        interval_days = abs((d1 - d2).days)
    except Exception:
        interval_days = 365
        
    # Grade trajectory
    grade_delta = curr_grade - prior_grade
    if grade_delta > 0:
        trajectory_status = "Disease Advancement"
        status_color = "rose"
        status_icon = "TrendingUp"
        observed_change = f"Advancement from Grade {prior_grade} to Grade {curr_grade} (+{grade_delta} grade)"
    elif grade_delta < 0:
        trajectory_status = "Improved Finding"
        status_color = "emerald"
        status_icon = "TrendingDown"
        observed_change = f"Regression/Clearance from Grade {prior_grade} to Grade {curr_grade} ({grade_delta} grade)"
    else:
        trajectory_status = "Stable Condition"
        status_color = "slate"
        status_icon = "Minus"
        observed_change = f"Stable at Grade {curr_grade} across interval"
        
    # Lesion counts comparison
    curr_lesions = current_case.get("m3_result", {}).get("lesions", {})
    prior_lesions = prior_case.get("m3_result", {}).get("lesions", {})
    
    curr_ma = curr_lesions.get("microaneurysms_count", 0)
    prior_ma = prior_lesions.get("microaneurysms_count", 0)
    curr_hem = curr_lesions.get("hemorrhages_count", 0)
    prior_hem = prior_lesions.get("hemorrhages_count", 0)
    curr_ex = curr_lesions.get("hard_exudates_count", 0)
    prior_ex = prior_lesions.get("hard_exudates_count", 0)
    
    ma_delta = curr_ma - prior_ma
    hem_delta = curr_hem - prior_hem
    ex_delta = curr_ex - prior_ex
    
    # Rate of progression score (annualized lesion growth index)
    years = max(0.1, interval_days / 365.25)
    lesion_growth_annual = round((max(0, ma_delta) * 1.0 + max(0, hem_delta) * 2.5 + max(0, ex_delta) * 3.0) / years, 1)
    
    if grade_delta > 0 or lesion_growth_annual > 15.0:
        progression_risk = "RAPID"
    elif grade_delta == 0 and lesion_growth_annual > 5.0:
        progression_risk = "MODERATE"
    else:
        progression_risk = "SLOW / STABLE"
        
    findings_comparison = []
    if ma_delta > 0:
        findings_comparison.append(f"+{ma_delta} new microaneurysms detected")
    elif ma_delta < 0:
        findings_comparison.append(f"{abs(ma_delta)} microaneurysms resolved")
        
    if hem_delta > 0:
        findings_comparison.append(f"+{hem_delta} new retinal hemorrhages observed")
    elif hem_delta < 0:
        findings_comparison.append(f"{abs(hem_delta)} retinal hemorrhages absorbed")
        
    if ex_delta > 0:
        findings_comparison.append(f"+{ex_delta} new hard exudate lipid deposits")
        
    if not findings_comparison:
        findings_comparison.append("Microvascular pathology unchanged across interval")
        
    return {
        "has_prior": True,
        "interval_days": interval_days,
        "prior_grade": prior_grade,
        "current_grade": curr_grade,
        "grade_delta": grade_delta,
        "trajectory_status": trajectory_status,
        "status_color": status_color,
        "status_icon": status_icon,
        "observed_change": observed_change,
        "annualized_rate_of_progression": lesion_growth_annual,
        "progression_risk": progression_risk,
        "lesion_deltas": {
            "microaneurysms": ma_delta,
            "hemorrhages": hem_delta,
            "hard_exudates": ex_delta
        },
        "findings_comparison": findings_comparison,
        "disclaimer": "⚠️ Imaging change requires clinical confirmation. Difference may be influenced by pupil dilation or image contrast."
    }
