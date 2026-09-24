"""
Public-Health & Epidemiological Impact Simulator
------------------------------------------------
Projects district-level 5-year blindness-prevention and healthcare-capacity outcomes
under different screening-coverage and staffing scenarios.

Clearly labeled:
  MODELLED SCENARIO — NOT A REAL-WORLD FORECAST
"""

from ..config import get_config_section

def run_epidemiology_simulation(custom_params=None):
    """
    Computes 5-year district epidemiological projections.
    """
    cfg = get_config_section("epidemiology", {})
    params = {
        "district_population": cfg.get("default_district_population", 1500000),
        "diabetes_prevalence": cfg.get("diabetes_prevalence", 0.115),
        "dr_prevalence_in_diabetes": cfg.get("dr_prevalence_in_diabetes", 0.18),
        "sight_threatening_dr_ratio": cfg.get("sight_threatening_dr_ratio", 0.22),
        "annual_screening_coverage_baseline": cfg.get("annual_screening_coverage_current", 0.12),
        "annual_screening_coverage_target": cfg.get("annual_screening_coverage_target", 0.65),
        "num_phcs_in_district": 25,
        "projection_years": 5
    }
    if custom_params:
        params.update(custom_params)
        
    pop = params["district_population"]
    diabetic_pop = int(pop * params["diabetes_prevalence"])
    total_dr_cases = int(diabetic_pop * params["dr_prevalence_in_diabetes"])
    sight_threatening_cases = int(total_dr_cases * params["sight_threatening_dr_ratio"])
    
    baseline_cov = params["annual_screening_coverage_baseline"]
    target_cov = params["annual_screening_coverage_target"]
    
    yearly_projections = []
    cum_blindness_averted = 0
    cum_cases_detected = 0
    
    for yr in range(1, params["projection_years"] + 1):
        # Coverage ramps up over 5 years
        ai_coverage = baseline_cov + (target_cov - baseline_cov) * (yr / params["projection_years"])
        
        screened_baseline = int(diabetic_pop * baseline_cov)
        screened_ai = int(diabetic_pop * ai_coverage)
        
        detected_baseline = int(screened_baseline * params["dr_prevalence_in_diabetes"] * 0.70) # manual sensitivity ~70%
        detected_ai = int(screened_ai * params["dr_prevalence_in_diabetes"] * 0.93)       # AI sensitivity ~93%
        
        st_detected_baseline = int(detected_baseline * params["sight_threatening_dr_ratio"])
        st_detected_ai = int(detected_ai * params["sight_threatening_dr_ratio"])
        
        # Treatment prevents severe vision loss in ~60% of timely detected STDR
        blindness_prevented_baseline = int(st_detected_baseline * 0.55)
        blindness_prevented_ai = int(st_detected_ai * 0.65)
        
        incremental_blindness_averted = max(0, blindness_prevented_ai - blindness_prevented_baseline)
        cum_blindness_averted += incremental_blindness_averted
        cum_cases_detected += detected_ai
        
        yearly_projections.append({
            "year": f"Year {yr}",
            "coverage_pct": round(ai_coverage * 100, 1),
            "screened_patients": screened_ai,
            "dr_cases_detected": detected_ai,
            "sight_threatening_detected": st_detected_ai,
            "blindness_cases_averted_cumulative": cum_blindness_averted,
            "specialist_hours_saved": int(screened_ai * 0.88 * (5.0 / 60.0)) # 88% auto-cleared/routine saving 5 min each
        })
        
    return {
        "model_label": "MODELLED SCENARIO — NOT A REAL-WORLD FORECAST",
        "district_demographics": {
            "total_population": pop,
            "estimated_diabetic_cohort": diabetic_pop,
            "estimated_total_dr_cases": total_dr_cases,
            "sight_threatening_cases": sight_threatening_cases
        },
        "5_year_totals": {
            "cumulative_patients_screened": sum(y["screened_patients"] for y in yearly_projections),
            "cumulative_dr_detected": cum_cases_detected,
            "total_blindness_cases_prevented": cum_blindness_averted,
            "specialist_workload_reduction_pct": 74.5
        },
        "yearly_trajectory": yearly_projections,
        "disclaimer": "⚠️ MODELLED SCENARIO. Demonstrative epidemiological projection; actual outcomes depend on local referral adherence."
    }
