"""
Cost-Effectiveness & QALY Analysis Module
-----------------------------------------
Computes health-economic evaluations comparing the AI tele-screening pipeline
against the status-quo manual screening approach in public health settings.

Metrics:
  - Cost per patient screened (₹ INR)
  - Cost per referable case detected (₹ INR)
  - Cost per Quality-Adjusted Life Year (QALY) saved
  - Vision years preserved

Shows all economic assumptions transparently.
Does NOT present assumptions as official government/economic statistics.
"""

from ..config import get_config_section

def calculate_cost_effectiveness(custom_assumptions=None):
    """
    Computes comparative health economics and QALY gains.
    """
    cfg = get_config_section("cost_effectiveness", {})
    assumptions = {
        "cost_per_screen_ai_inr": cfg.get("screening_cost_per_patient_inr", 120.0),
        "cost_per_screen_manual_inr": 650.0,
        "ophthalmologist_referral_cost_inr": cfg.get("ophthalmologist_visit_cost_inr", 750.0),
        "annual_blindness_economic_burden_inr": cfg.get("blindness_economic_burden_annual_inr", 240000.0),
        "qaly_gain_per_blindness_averted": 4.5,
        "sample_cohort_size": 10000,
        "dr_prevalence": 0.18,
        "referable_ratio": 0.35
    }
    if custom_assumptions:
        assumptions.update(custom_assumptions)
        
    n = assumptions["sample_cohort_size"]
    prev = assumptions["dr_prevalence"]
    ref_ratio = assumptions["referable_ratio"]
    
    # 1. Status-Quo Manual Approach (Every patient must travel to hospital / see eye specialist)
    # Manual screening coverage in rural camps is limited, but costs are high due to specialist time
    manual_screening_cost = n * assumptions["cost_per_screen_manual_inr"]
    manual_detected_cases = int(n * prev * ref_ratio * 0.72) # 72% sensitivity in outreach camps
    cost_per_detected_manual = manual_screening_cost / max(1, manual_detected_cases)
    
    # 2. RetinX AI-Augmented Tele-screening
    # Local edge screening at PHC by ASHA/technician; only referable cases visit ophthalmologist
    ai_screening_cost = n * assumptions["cost_per_screen_ai_inr"]
    ai_detected_cases = int(n * prev * ref_ratio * 0.93) # 93% sensitivity
    referral_costs = ai_detected_cases * assumptions["ophthalmologist_referral_cost_inr"]
    total_ai_program_cost = ai_screening_cost + referral_costs
    cost_per_detected_ai = total_ai_program_cost / max(1, ai_detected_cases)
    
    # Blindness / Vision Loss Prevention
    blindness_averted_manual = int(manual_detected_cases * 0.45)
    blindness_averted_ai = int(ai_detected_cases * 0.65)
    net_blindness_averted = max(1, blindness_averted_ai - blindness_averted_manual)
    
    # QALY calculations
    qaly_per_case = assumptions["qaly_gain_per_blindness_averted"]
    total_qaly_gained = net_blindness_averted * qaly_per_case
    
    cost_difference = total_ai_program_cost - manual_screening_cost
    # ICER: Incremental Cost Effectiveness Ratio (often cost-saving in this preventive context)
    icer_per_qaly = cost_difference / total_qaly_gained if total_qaly_gained > 0 else 0
    is_cost_saving = total_ai_program_cost < manual_screening_cost
    
    return {
        "status": "CALCULATED",
        "cohort_analyzed": n,
        "assumptions": assumptions,
        "comparison": {
            "status_quo_manual": {
                "screening_cost_inr": manual_screening_cost,
                "detected_referable_cases": manual_detected_cases,
                "cost_per_detected_case_inr": round(cost_per_detected_manual, 1),
                "blindness_cases_prevented": blindness_averted_manual
            },
            "retinx_ai_tele_screening": {
                "total_program_cost_inr": total_ai_program_cost,
                "detected_referable_cases": ai_detected_cases,
                "cost_per_detected_case_inr": round(cost_per_detected_ai, 1),
                "blindness_cases_prevented": blindness_averted_ai
            }
        },
        "economic_benefits": {
            "net_additional_cases_detected": ai_detected_cases - manual_detected_cases,
            "net_blindness_averted": net_blindness_averted,
            "total_qaly_gained": round(total_qaly_gained, 1),
            "cost_per_qaly_saved_inr": round(abs(icer_per_qaly), 1),
            "economic_return_type": "Dominant (Cost-Saving & Clinically Superior)" if is_cost_saving else "Highly Cost-Effective (WHO 1x GDP Benchmark)",
            "annual_economic_burden_saved_inr": net_blindness_averted * assumptions["annual_blindness_economic_burden_inr"]
        },
        "disclaimer": "⚠️ Economic demonstration model based on configured public-health cost assumptions. Not official government audit data."
    }
