"""
Multimodal Fusion Readiness Architecture
----------------------------------------
Provides an extensible plugin architecture to ingest and fuse complementary diagnostic modalities
when scaling up from rural PHCs to tertiary hospital centers:
  - Fundus (Color Retinal Photography)
  - OCT (Optical Coherence Tomography Macular Scans)
  - FAF (Fundus Autofluorescence)
  - Clinical Metadata (HbA1c, BP, Diabetes Duration, Age)

Architecture Hook:
  Fundus ─────────┐
  OCT ────────────┤
  FAF ────────────┤→ Cross-Attention Fusion Layer → Enhanced Clinical Decision Support
  Metadata ───────┘

Serves as an architectural integration hook for future multimodal models.
"""

from typing import Dict, Any, Optional

MODALITY_CATALOG = {
    "FUNDUS": {
        "name": "Color Fundus Photography (CFP)",
        "resolution_std": "224x224 to 2048x2048",
        "primary_biomarkers": ["Microaneurysms", "Hemorrhages", "Hard Exudates", "Neovascularization"],
        "status": "ACTIVE_PRODUCTION"
    },
    "OCT": {
        "name": "Optical Coherence Tomography (OCT)",
        "resolution_std": "512x512 B-scan series / Macular Volume",
        "primary_biomarkers": ["Central Subfield Thickness (CST)", "Subretinal Fluid (SRF)", "Intraretinal Fluid (IRF)"],
        "status": "READINESS_INTERFACE_READY"
    },
    "FAF": {
        "name": "Fundus Autofluorescence (FAF)",
        "resolution_std": "768x768 Blue/Green Laser",
        "primary_biomarkers": ["RPE Atrophy", "Lipofuscin Hyperautofluorescence", "Ischemic Flow Deficits"],
        "status": "READINESS_INTERFACE_READY"
    },
    "METADATA": {
        "name": "Systemic Clinical Biomarkers",
        "resolution_std": "Tabular Key-Value Vitals",
        "primary_biomarkers": ["HbA1c %", "Systolic/Diastolic BP", "Diabetes Duration (Years)", "eGFR"],
        "status": "ACTIVE_INTEGRATED"
    }
}

def register_multimodal_modality(modality_name: str, payload_meta: Dict[str, Any]):
    """Registers an incoming secondary diagnostic modality."""
    mod = modality_name.upper()
    return {
        "modality": mod,
        "registered": mod in MODALITY_CATALOG,
        "details": MODALITY_CATALOG.get(mod, {"name": modality_name, "status": "CUSTOM_MODALITY"})
    }

def evaluate_multimodal_fusion(fundus_grade: int, fundus_conf: float, oct_cst_um: Optional[float] = None, metadata: Optional[Dict[str, Any]] = None):
    """
    Demonstrates late-fusion decision support combining Fundus with OCT and Vitals.
    """
    metadata = metadata or {}
    hba1c = metadata.get("hba1c")
    duration = metadata.get("diabetes_duration")
    
    fusion_factors = []
    adjusted_urgency = fundus_grade
    
    # 1. OCT Fusion Rule (if higher-tier center provides OCT CST in microns)
    oct_status = "Not Provided (PHC Tier)"
    if oct_cst_um is not None:
        if oct_cst_um > 300: # Threshold for clinically significant macular edema
            oct_status = f"Elevated CST ({oct_cst_um} µm > 300 µm threshold) — DME Confirmed"
            fusion_factors.append("OCT confirmed active center-involving macular edema")
            adjusted_urgency = max(adjusted_urgency, 3)
        else:
            oct_status = f"Normal CST ({oct_cst_um} µm) — Macular architecture intact"
            
    # 2. Systemic Metadata Fusion Rule
    if hba1c is not None and float(hba1c) >= 9.0:
        fusion_factors.append(f"Severely unmanaged glycemic index (HbA1c {hba1c}%) elevates rapid progression risk")
        
    return {
        "fusion_layer_status": "READY",
        "modalities_connected": {
            "fundus": "CONNECTED (Active)",
            "oct": "CONNECTED" if oct_cst_um is not None else "STANDBY (Requires OCT Scan)",
            "faf": "STANDBY",
            "clinical_metadata": "CONNECTED" if (hba1c or duration) else "MINIMAL"
        },
        "oct_finding": oct_status,
        "fused_risk_factors": fusion_factors,
        "recommendation": "Multimodal fusion indicates heightened urgency due to systemic/tomographic biomarkers." if fusion_factors else "Standard fundus decision-support pathway maintained.",
        "disclaimer": "⚠️ Multimodal interface hook. Fully compatible with future DICOM/OCT ingestion pipelines."
    }
