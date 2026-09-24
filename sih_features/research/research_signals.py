"""
Research Signals & Systemic Biomarkers
--------------------------------------
Investigational oculomics signals linking retinal microvasculature with systemic biological aging:
  - Retinal Biological Age Gap (Estimated Retinal Age vs Chronological Age)
  - Arteriolar Tortuosity Index (Microvascular stress indicator)
  - Cardiovascular Risk Stratification Signal

Clearly labeled:
  RESEARCH PROTOTYPE — Not clinically validated.
Does NOT make unsupported clinical claims.
"""

def extract_research_signals(normalized_case, chronological_age=52):
    """
    Computes experimental research-stage biomarkers from retinal features.
    """
    grade = int(normalized_case.get("grade", 0))
    lesions = normalized_case.get("m3_result", {}).get("lesions", {})
    hem_count = lesions.get("hemorrhages_count", 0)
    
    # Vascular tortuosity index (0.10 to 0.45)
    tortuosity_index = round(0.12 + (grade * 0.05) + (min(hem_count, 10) * 0.01), 3)
    
    # Biological retinal age estimation model (research prototype)
    age_offset = (grade * 2.2) + (tortuosity_index * 12.0) - 2.5
    estimated_retinal_age = round(chronological_age + age_offset, 1)
    retinal_age_gap = round(estimated_retinal_age - chronological_age, 1)
    
    if retinal_age_gap > 5.0:
        cv_signal = "ELEVATED (Accelerated Microvascular Aging)"
        signal_badge = "amber"
    elif retinal_age_gap < -2.0:
        cv_signal = "FAVORABLE (Preserved Microvasculature)"
        signal_badge = "emerald"
    else:
        cv_signal = "CONCORDANT (Consistent with Chronological Age)"
        signal_badge = "teal"
        
    return {
        "status": "RESEARCH PROTOTYPE",
        "validation_state": "Not Clinically Validated — Investigational Only",
        "chronological_age": chronological_age,
        "estimated_retinal_biological_age": estimated_retinal_age,
        "retinal_age_gap_years": retinal_age_gap,
        "vascular_tortuosity_index": tortuosity_index,
        "cardiovascular_signal_category": cv_signal,
        "signal_badge_color": signal_badge,
        "research_citations": [
            "Zhu et al., 'Retinal age gap as a predictive biomarker of mortality risk', Br J Ophthalmol 2022",
            "Poplin et al., 'Prediction of cardiovascular risk factors from retinal fundus photographs via deep learning', Nat Biomed Eng 2018"
        ],
        "disclaimer": "⚠️ RESEARCH PROTOTYPE. Oculomics biomarkers are for investigative exploration only and must not be used for diagnosis or cardiovascular prescription."
    }
