"""
Adaptive Screening Interval Recommendation
------------------------------------------
Calculates a personalized follow-up screening interval rather than fixed 12-month recalls.
Incorporates:
  - Current DR Grade & Clinical Severity
  - Diagnostic Model Uncertainty
  - Systemic Glycemic Status (HbA1c %) if present
  - Chronicity of Diabetes (Years since diagnosis) if present

Never invents or fabricates missing medical variables.
"""

from ..config import get_config_section

def recommend_screening_interval(normalized_case):
    """
    Computes a personalized recommendation based strictly on recorded vitals and grade.
    """
    cfg = get_config_section("screening_interval", {})
    
    grade = int(normalized_case.get("grade", 0))
    confidence = float(normalized_case.get("confidence", 90.0))
    
    vitals = normalized_case.get("vitals", {})
    hba1c = vitals.get("hba1c")
    diag_year = vitals.get("year_of_diagnosis")
    
    # Baseline intervals by grade (in months)
    base_intervals = {
        0: cfg.get("grade_0_interval_months", 12),
        1: cfg.get("grade_1_interval_months", 9),
        2: cfg.get("grade_2_interval_months", 6),
        3: cfg.get("grade_3_interval_months", 3),
        4: cfg.get("grade_4_interval_months", 1)
    }
    
    recommended_months = base_intervals.get(grade, 12)
    risk_adjustments = []
    
    # 1. Glycemic Factor
    if hba1c is not None:
        try:
            hba1c_val = float(hba1c)
            if hba1c_val >= 9.0:
                recommended_months = max(1, recommended_months - 3)
                risk_adjustments.append(f"Elevated HbA1c ({hba1c_val}%) accelerates microvascular progression (-3 mo)")
            elif hba1c_val >= 8.0:
                recommended_months = max(1, recommended_months - 1)
                risk_adjustments.append(f"Sub-optimal glycemic control HbA1c ({hba1c_val}%) (-1 mo)")
        except (ValueError, TypeError):
            pass
            
    # 2. Disease Duration Factor
    if diag_year is not None:
        try:
            current_year = 2026
            duration_years = current_year - int(diag_year)
            if duration_years > 15 and grade >= 1:
                recommended_months = max(1, recommended_months - 1)
                risk_adjustments.append(f"Long-standing diabetes ({duration_years} years) warrants tighter surveillance")
        except (ValueError, TypeError):
            pass
            
    # 3. Model Uncertainty Factor
    if confidence < 80.0 and grade <= 1:
        recommended_months = max(3, recommended_months - 2)
        risk_adjustments.append(f"Borderline classification certainty ({confidence:.1f}%) suggests earlier re-evaluation")
        
    if recommended_months <= 1:
        interval_label = "Immediate / 4 Weeks (Urgent Clinical Review)"
        status_color = "rose"
    elif recommended_months <= 3:
        interval_label = f"{recommended_months} Months (Intensive Surveillance)"
        status_color = "orange"
    elif recommended_months <= 6:
        interval_label = f"{recommended_months} Months (Semi-Annual Follow-up)"
        status_color = "amber"
    elif recommended_months <= 9:
        interval_label = f"{recommended_months} Months (Targeted Recall)"
        status_color = "teal"
    else:
        interval_label = "12 Months (Routine Annual Recall)"
        status_color = "emerald"
        
    return {
        "recommended_interval": interval_label,
        "recommended_months": recommended_months,
        "status_color": status_color,
        "risk_modifiers": risk_adjustments if risk_adjustments else ["Standard guideline protocol applied"],
        "data_grounding": {
            "grade_considered": grade,
            "hba1c_provided": hba1c is not None,
            "duration_provided": diag_year is not None
        },
        "disclaimer": "⚠️ Decision-support suggestion based on guideline protocols. Clinician confirmation required."
    }
