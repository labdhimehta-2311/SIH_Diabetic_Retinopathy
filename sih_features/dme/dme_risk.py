"""
Diabetic Macular Edema (DME) Risk Co-Classification
---------------------------------------------------
Evaluates the independent risk of Diabetic Macular Edema (DME) using hard exudate
proximity to the foveal/macular center and lesion density metrics from M3/M2.

DR grading alone misses DME, which can cause significant central vision loss even in
Mild/Moderate stages.

Never fabricates DME findings. Clearly states that this is an opportunistic risk flag,
not a definitive OCT-grade diagnosis.
"""

def assess_dme_risk(normalized_case):
    """
    Computes DME risk tier based strictly on observed exudative findings.
    """
    m3_res = normalized_case.get("m3_result", {})
    m3_executed = m3_res.get("executed", False)
    lesions = m3_res.get("lesions", {})
    
    # If M3 was not run or lesions data is empty
    if not m3_executed and not lesions:
        return {
            "status": "UNAVAILABLE",
            "tier": "UNAVAILABLE",
            "symbol": "⚪",
            "badge_color": "slate",
            "title": "DME Assessment Unavailable",
            "reason": "DME assessment unavailable from current model outputs (lesion segmentation not executed).",
            "recommendation": "Perform clinical slit-lamp biomicroscopy or OCT for macular evaluation.",
            "disclaimer": "⚠️ DME assessment requires spatial lesion localization."
        }
        
    hard_ex_count = lesions.get("hard_exudates_count", 0)
    macular_inv = lesions.get("macular_involvement", False)
    grade = normalized_case.get("grade", 0)
    
    # 1. High Risk: Hard exudates within 1 disc diameter of foveal center OR >8 exudates with macular involvement
    if (macular_inv and hard_ex_count >= 3) or (hard_ex_count >= 8):
        return {
            "status": "HIGH",
            "tier": "HIGH DME RISK",
            "symbol": "🔴",
            "badge_color": "rose",
            "title": "High DME-Related Risk Detected",
            "reason": f"Hard exudative clusters ({hard_ex_count} identified) detected within the critical macular region.",
            "exudate_count": hard_ex_count,
            "macular_involvement": True,
            "recommendation": "Priority Optical Coherence Tomography (OCT) referral recommended to assess central macular thickness (CMT).",
            "disclaimer": "⚠️ This is a risk flag, not a definitive DME diagnosis. Requires OCT confirmation."
        }
        
    # 2. Moderate Risk: Exudates present in retina but non-confluent or peripheral
    if hard_ex_count >= 1 or macular_inv or (grade >= 3):
        return {
            "status": "MODERATE",
            "tier": "MODERATE DME RISK",
            "symbol": "🟠",
            "badge_color": "amber",
            "title": "Possible DME-Related Risk",
            "reason": f"Scattered exudative findings ({hard_ex_count} detected) in the vicinity of vascular arcades.",
            "exudate_count": hard_ex_count,
            "macular_involvement": macular_inv,
            "recommendation": "Ophthalmological macular examination indicated.",
            "disclaimer": "⚠️ This is a risk flag, not a definitive DME diagnosis."
        }
        
    # 3. Low Risk: No exudates detected
    return {
        "status": "LOW",
        "tier": "LOW DME RISK",
        "symbol": "🟢",
        "badge_color": "emerald",
        "title": "Low DME Risk",
        "reason": "No discrete hard exudates detected in the macula or peripapillary region.",
        "exudate_count": 0,
        "macular_involvement": False,
        "recommendation": "Maintain annual screening schedule.",
        "disclaimer": "⚠️ Clinical exam remains necessary to exclude non-exudative macular thickening."
    }
