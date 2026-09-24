"""
SIH UI Enhancement Components
-----------------------------
Provides structured UI components that integrate natively into the existing RetinX
clinical interface. Adheres strictly to the Slate / Teal / Amber design language
of the existing application.

DOES NOT create a separate dashboard or application.
"""

from ..adapters.existing_results_adapter import normalize_existing_results
from ..triage.triage_engine import evaluate_triage
from ..clinical_report.clinical_report import generate_clinical_report
from ..review_queue.priority_engine import calculate_priority_score
from ..audit.audit_trail import get_disagreement_summary
from ..capture_guidance.capture_guidance import evaluate_capture_guidance
from ..dme.dme_risk import assess_dme_risk
from ..offline.offline_queue import get_sync_status
from ..voice.voice_report import generate_voice_report
from ..quality.progressive_quality import evaluate_progressive_quality
from ..validation.validation import get_multidataset_benchmark_suite
from ..robustness.robustness_testing import run_robustness_test
from ..longitudinal.longitudinal import track_longitudinal_progression
from ..bandwidth.bandwidth_optimizer import optimize_bandwidth_transmission
from ..epidemiology.epidemiology_simulator import run_epidemiology_simulation
from ..cost_effectiveness.cost_effectiveness import calculate_cost_effectiveness
from ..security.tamper_log import get_tamper_log_summary
from ..consensus.consensus import evaluate_consensus
from ..federated.federated_demo import simulate_federated_round
from ..multimodal.multimodal_registry import evaluate_multimodal_fusion
from ..camera.camera_calibration import detect_camera_profile
from ..screening.screening_interval import recommend_screening_interval
from ..research.research_signals import extract_research_signals
from ..comorbidity.comorbidity_flag import detect_comorbidities
from ..fairness.fairness_audit import audit_fairness_across_pigmentation

def get_sih_enhancements_data(pipeline_output, patient_info=None):
    """
    Computes all 25 enhancement features and returns a unified JSON payload
    for rendering inside the existing UI.
    """
    normalized = normalize_existing_results(pipeline_output, patient_info)
    
    dme = assess_dme_risk(normalized)
    triage = evaluate_triage(normalized, dme_risk_level=dme.get("status"))
    report = generate_clinical_report(normalized)
    priority = calculate_priority_score(normalized, dme_risk_flag=dme.get("status"))
    capture = evaluate_capture_guidance(None)
    quality = evaluate_progressive_quality(None, fallback_grade=normalized["grade"])
    voice = generate_voice_report(normalized, lang="en")
    offline = get_sync_status()
    audit_summary = get_disagreement_summary()
    tamper = get_tamper_log_summary()
    consensus = evaluate_consensus(normalized["grade"], normalized["confidence"])
    interval = recommend_screening_interval(normalized)
    bandwidth = optimize_bandwidth_transmission(None)
    epidemiology = run_epidemiology_simulation()
    cost = calculate_cost_effectiveness()
    federated = simulate_federated_round(round_number=1)
    multimodal = evaluate_multimodal_fusion(normalized["grade"], normalized["confidence"])
    camera = detect_camera_profile(None)
    research = extract_research_signals(normalized)
    validation = get_multidataset_benchmark_suite()
    robustness = run_robustness_test(baseline_confidence=normalized["confidence"])
    comorbidities = detect_comorbidities(normalized)
    fairness = audit_fairness_across_pigmentation()
    
    # Longitudinal
    prior_case = None
    if patient_info and patient_info.get("screenings") and len(patient_info["screenings"]) > 1:
        prior_case = normalize_existing_results(patient_info["screenings"][-1].get("aiResults"))
    longitudinal = track_longitudinal_progression(normalized, prior_case)
    
    return {
        "case_id": normalized["case_id"],
        "triage": triage,
        "clinical_report": report,
        "dme_risk": dme,
        "review_priority": priority,
        "capture_guidance": capture,
        "image_quality": quality,
        "voice_report": voice,
        "offline_status": offline,
        "audit_trail": audit_summary,
        "tamper_log": tamper,
        "second_opinion_consensus": consensus,
        "screening_interval": interval,
        "bandwidth_optimization": bandwidth,
        "epidemiology_simulation": epidemiology,
        "cost_effectiveness": cost,
        "federated_learning": federated,
        "multimodal_fusion": multimodal,
        "camera_calibration": camera,
        "research_signals": research,
        "validation_benchmarks": validation,
        "robustness": robustness,
        "comorbidities": comorbidities,
        "fairness_audit": fairness,
        "longitudinal": longitudinal
    }

def render_sih_enhancements_html(pipeline_output, patient_info=None):
    """
    Renders pure HTML / Tailwind markup representing the SIH ENHANCEMENTS section
    to be displayed directly inside the existing report layout below M1-M4.
    """
    data = get_sih_enhancements_data(pipeline_output, patient_info)
    t = data["triage"]
    r = data["clinical_report"]
    d = data["dme_risk"]
    p = data["review_priority"]
    q = data["image_quality"]
    v = data["voice_report"]
    o = data["offline_status"]
    a = data["tamper_log"]["integrity"]
    i = data["screening_interval"]
    
    findings_html = "".join(f"<li>• {item}</li>" for item in r["detected_findings"])
    
    return f"""
<!-- ================================================================ -->
<!--                   SIH ENHANCEMENTS SECTION                       -->
<!--       Integrated directly beneath M1-M4 Diagnostic Matrix        -->
<!-- ================================================================ -->
<div class="sih-enhancements-container border-t-2 border-slate-900 pt-6 mt-6 space-y-6">
  
  <div class="flex items-center justify-between border-b border-slate-300 pb-3">
    <div>
      <span class="text-[9px] font-black uppercase tracking-widest text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
        SIH 2026 Enhanced Diagnostic Decision Support
      </span>
      <h2 class="text-sm font-black text-slate-900 uppercase tracking-tight mt-1">
        Clinical Triage, Lesion Rationale & System Deployment Modules
      </h2>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-[10px] font-bold px-2.5 py-1 rounded bg-slate-100 border border-slate-300 text-slate-700">
        Tamper Log: {a.get('status_badge', '✓ Verified')}
      </span>
      <span class="text-[10px] font-bold px-2.5 py-1 rounded bg-emerald-50 border border-emerald-300 text-emerald-800">
        {o.get('status_badge', '✓ Synced')}
      </span>
    </div>
  </div>

  <!-- Primary Triage & Priority Row -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    
    <!-- 1. Uncertainty-Aware Triage -->
    <div class="bg-white border-2 border-slate-900 p-3.5 rounded space-y-2">
      <div class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
        1. AI Clinical Triage
      </div>
      <div class="flex items-center gap-2">
        <span class="text-lg">{t['symbol']}</span>
        <span class="font-black text-xs text-slate-900 uppercase">{t['badge_label']}</span>
      </div>
      <p class="text-[11px] text-slate-700 font-medium leading-tight">
        {t['reason']}
      </p>
      <div class="text-[9px] text-slate-500 pt-1 border-t border-slate-200">
        Bounded FNR Target: <strong>{t['bounded_fnr']}</strong> | Conf: <strong>{t['confidence']}%</strong>
      </div>
    </div>

    <!-- 2. DME Risk Flag -->
    <div class="bg-white border-2 border-slate-900 p-3.5 rounded space-y-2">
      <div class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
        2. DME Risk Co-Classification
      </div>
      <div class="flex items-center gap-2">
        <span class="text-lg">{d['symbol']}</span>
        <span class="font-black text-xs text-slate-900 uppercase">{d['tier']}</span>
      </div>
      <p class="text-[11px] text-slate-700 font-medium leading-tight">
        {d['reason']}
      </p>
      <div class="text-[9px] text-slate-500 pt-1 border-t border-slate-200">
        Action: <em>{d['recommendation']}</em>
      </div>
    </div>

    <!-- 3. Review Priority Queue -->
    <div class="bg-white border-2 border-slate-900 p-3.5 rounded space-y-2">
      <div class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
        3. Review Priority Tier
      </div>
      <div class="flex items-center gap-2">
        <span class="text-lg">{p['symbol']}</span>
        <span class="font-black text-xs text-slate-900 uppercase">{p['priority_tier']}</span>
      </div>
      <p class="text-[11px] text-slate-700 font-medium leading-tight">
        {p['rationale']}
      </p>
      <div class="text-[9px] text-slate-500 pt-1 border-t border-slate-200">
        Urgency Score: <strong>{p['priority_score']}</strong> (Target: &lt;{p['estimated_wait_target_minutes']} min)
      </div>
    </div>

  </div>

  <!-- Clinical Explanation & Natural Language Report -->
  <div class="bg-white border border-slate-900 p-4 rounded space-y-2.5">
    <div class="flex items-center justify-between border-b border-slate-200 pb-2">
      <span class="text-[10px] font-black uppercase tracking-wider text-slate-900">
        Clinical Lesion-To-Criteria Explanation (ICDR Standard)
      </span>
      <span class="text-[9px] font-bold text-slate-500">
        Neovascularization: {r['neovascularization_status']}
      </span>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
      <div>
        <span class="text-[9px] font-bold text-slate-500 uppercase block mb-1">Detected Lesions:</span>
        <ul class="space-y-1 text-slate-800 font-medium text-[11px]">
          {findings_html}
        </ul>
      </div>
      <div>
        <span class="text-[9px] font-bold text-slate-500 uppercase block mb-1">Clinical Rationale:</span>
        <p class="text-[11px] text-slate-800 leading-snug">
          {r['ai_rationale']}
        </p>
        <p class="text-[9px] text-slate-500 mt-2 italic">
          {r['icdr_criteria_mapping']}
        </p>
      </div>
    </div>
  </div>

  <!-- Adaptive Screening Interval & Regional Voice Readout Strip -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    
    <!-- Adaptive Follow-Up Interval -->
    <div class="bg-slate-50 border border-slate-300 p-3.5 rounded space-y-1.5">
      <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
        Suggested Follow-up Interval
      </span>
      <div class="font-black text-xs text-slate-900">
        {i['recommended_interval']}
      </div>
      <p class="text-[10px] text-slate-600">
        Modifiers: {", ".join(i['risk_modifiers'])}
      </p>
    </div>

    <!-- Regional Voice Readout -->
    <div class="bg-slate-50 border border-slate-300 p-3.5 rounded space-y-1.5">
      <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
        Regional Voice Readout (Hindi / Gujarati / English)
      </span>
      <div class="text-[11px] text-slate-800 italic">
        "{v['spoken_text']}"
      </div>
      <div class="flex items-center gap-2 pt-1 text-[9px] text-teal-800 font-bold">
        <span>🔊 Spoken Summary Available</span>
        <span>• Lang: {v['active_language_name']}</span>
      </div>
    </div>

  </div>

</div>
"""
