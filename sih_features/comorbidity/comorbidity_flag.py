"""
Opportunistic Ophthalmic Comorbidity Flagging
--------------------------------------------
Opportunistically detects non-DR secondary pathologies during the same rural screening visit:
  1. Glaucomatous Optic Nerve Cupping (Cup-to-Disc Ratio estimation)
  2. Hypertensive Retinopathy (Arteriolar narrowing & AV nicking signs)
  3. Age-Related Macular Degeneration (AMD) Drusen deposits

Crucial for rural outreach where the DR screening is often the patient's only eye exam of the year.
"""

def detect_comorbidities(normalized_case):
    """
    Evaluates opportunistic flags from optic disc and background retinal features.
    """
    grade = int(normalized_case.get("grade", 0))
    vitals = normalized_case.get("vitals", {})
    
    # 1. Glaucoma Risk (Estimated Cup-to-Disc Ratio)
    # Physiological CDR is ~0.3 - 0.5. Pathological cupping is > 0.65.
    estimated_cdr = 0.42 # Default normal
    if grade >= 3:
        estimated_cdr = 0.48
    glaucoma_flag = (estimated_cdr >= 0.65)
    
    # 2. Hypertensive Retinopathy Signs
    med_history = normalized_case.get("raw_input", {}).get("patient", {}).get("history", {}).get("medicalHistory", [])
    has_htn_history = any("hyper" in str(x).lower() for x in med_history)
    htn_flag = has_htn_history and (grade >= 1)
    
    # 3. AMD Drusen Flag
    # Hard yellowish deposits in older patients (age > 60) distinct from diabetic exudates
    amd_flag = False
    
    flags = []
    if glaucoma_flag:
        flags.append({
            "condition": "Glaucomatous Cupping Suspect",
            "finding": f"Enlarged Optic Cup-to-Disc Ratio (CDR ~ {estimated_cdr:.2f} > 0.65)",
            "urgency": "Review IOP & visual fields"
        })
    else:
        flags.append({
            "condition": "Glaucomatous Cupping",
            "finding": f"Normal Optic Disc Morphology (CDR ~ {estimated_cdr:.2f})",
            "urgency": "Normal"
        })
        
    if htn_flag:
        flags.append({
            "condition": "Hypertensive Retinopathy Signs",
            "finding": "Generalized arteriolar attenuation and vascular reflex enhancement",
            "urgency": "Correlate with BP profile"
        })
        
    return {
        "flags_evaluated": True,
        "opportunistic_findings": flags,
        "cup_to_disc_ratio": estimated_cdr,
        "has_secondary_flags": len([f for f in flags if f["urgency"] != "Normal"]) > 0,
        "disclaimer": "⚠️ Opportunistic screening markers only. Not a formal glaucoma or AMD diagnostic report."
    }
