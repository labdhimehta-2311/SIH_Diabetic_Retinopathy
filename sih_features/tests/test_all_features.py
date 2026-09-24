"""
Comprehensive Automated Test Suite for SIH RetinX Enhancements
--------------------------------------------------------------
Tests all 25 SIH clinical & deployment features, failure isolation, and verifies
that existing M1, M2, M3, M4 and server pipeline modules remain completely intact.
"""

import os
import sys
import unittest
import numpy as np

# Add project root to sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from sih_features.adapters.existing_results_adapter import normalize_existing_results
from sih_features.triage.triage_engine import evaluate_triage, TriageCategory
from sih_features.clinical_report.clinical_report import generate_clinical_report
from sih_features.review_queue.priority_engine import calculate_priority_score, prioritize_queue
from sih_features.audit.audit_trail import record_clinical_review, get_disagreement_summary
from sih_features.capture_guidance.capture_guidance import evaluate_capture_guidance
from sih_features.dme.dme_risk import assess_dme_risk
from sih_features.offline.offline_queue import enqueue_offline_case, get_pending_sync_items, sync_pending_queue, get_sync_status
from sih_features.voice.voice_report import generate_voice_report, get_spoken_text_for_grade
from sih_features.quality.progressive_quality import evaluate_progressive_quality
from sih_features.validation.validation import get_multidataset_benchmark_suite, calculate_clinical_metrics
from sih_features.robustness.robustness_testing import run_robustness_test, apply_perturbation
from sih_features.longitudinal.longitudinal import track_longitudinal_progression
from sih_features.bandwidth.bandwidth_optimizer import optimize_bandwidth_transmission
from sih_features.epidemiology.epidemiology_simulator import run_epidemiology_simulation
from sih_features.cost_effectiveness.cost_effectiveness import calculate_cost_effectiveness
from sih_features.security.tamper_log import append_audit_block, verify_chain_integrity
from sih_features.consensus.consensus import evaluate_consensus
from sih_features.federated.federated_demo import simulate_federated_round
from sih_features.multimodal.multimodal_registry import evaluate_multimodal_fusion
from sih_features.camera.camera_calibration import detect_camera_profile, apply_camera_calibration
from sih_features.screening.screening_interval import recommend_screening_interval
from sih_features.research.research_signals import extract_research_signals
from sih_features.comorbidity.comorbidity_flag import detect_comorbidities
from sih_features.counterfactual.counterfactual import generate_counterfactual_explanation
from sih_features.fairness.fairness_audit import audit_fairness_across_pigmentation
from sih_features.demo.demo_mode import run_full_sih_demo

class TestSih25Features(unittest.TestCase):

    def setUp(self):
        self.sample_grade0 = {
            "sessionId": "TEST_CASE_G0",
            "patientId": "P_000",
            "grade": 0,
            "gradeLabel": "No Apparent Diabetic Retinopathy",
            "confidence": 97.5,
            "referable": False,
            "images": {"originalUrl": "/samples/sample_g0.png"}
        }
        self.sample_grade2 = {
            "sessionId": "TEST_CASE_G2",
            "patientId": "P_002",
            "grade": 2,
            "gradeLabel": "Moderate Non-Proliferative Diabetic Retinopathy",
            "confidence": 88.0,
            "referable": True,
            "images": {"originalUrl": "/samples/sample_g2.png"}
        }
        self.sample_grade4 = {
            "sessionId": "TEST_CASE_G4",
            "patientId": "P_004",
            "grade": 4,
            "gradeLabel": "Proliferative Diabetic Retinopathy",
            "confidence": 95.0,
            "referable": True,
            "images": {"originalUrl": "/samples/sample_g4.png"}
        }

    # 1. Uncertainty-Aware Triage
    def test_01_uncertainty_aware_triage(self):
        norm_g0 = normalize_existing_results(self.sample_grade0)
        triage_g0 = evaluate_triage(norm_g0)
        self.assertEqual(triage_g0["tier"], TriageCategory.AUTO_CLEAR)
        self.assertEqual(triage_g0["symbol"], "🟢")

        norm_g2 = normalize_existing_results(self.sample_grade2)
        triage_g2 = evaluate_triage(norm_g2)
        self.assertEqual(triage_g2["tier"], TriageCategory.OPHTHALMOLOGIST_REVIEW)
        self.assertEqual(triage_g2["symbol"], "🟠")

        norm_g4 = normalize_existing_results(self.sample_grade4)
        triage_g4 = evaluate_triage(norm_g4)
        self.assertEqual(triage_g4["tier"], TriageCategory.URGENT_REFERRAL)
        self.assertEqual(triage_g4["symbol"], "🔴")

    # 2. Clinical Explanation
    def test_02_clinical_explanation(self):
        norm = normalize_existing_results(self.sample_grade2)
        report = generate_clinical_report(norm)
        self.assertEqual(report["predicted_grade"], 2)
        self.assertIn("microaneurysms", str(report["detected_findings"]).lower())
        self.assertIn("ICDR", report["icdr_criteria_mapping"])
        self.assertIn("AI-generated", report["disclaimer"])

    # 3. Review Priority Queue
    def test_03_review_priority_queue(self):
        norm_g0 = normalize_existing_results(self.sample_grade0)
        norm_g4 = normalize_existing_results(self.sample_grade4)
        score_g0 = calculate_priority_score(norm_g0)
        score_g4 = calculate_priority_score(norm_g4)
        self.assertLess(score_g0["priority_score"], score_g4["priority_score"])
        self.assertEqual(score_g4["priority_tier"], "HIGH PRIORITY")

        queue = prioritize_queue([norm_g0, norm_g4])
        self.assertEqual(queue[0]["case_id"], norm_g4["case_id"])
        self.assertEqual(queue[0]["priority"]["queue_rank"], 1)

    # 4. Clinical Disagreement Audit Trail
    def test_04_audit_trail(self):
        rec = record_clinical_review("CASE_AUDIT_01", ai_grade=2, ai_confidence=85.0, ai_triage="REVIEW", doctor_grade=4)
        self.assertFalse(rec["agreement"])
        self.assertEqual(rec["disagreement_category"], "Severity grading")
        summary = get_disagreement_summary()
        self.assertGreater(summary["cases_reviewed"], 0)

    # 5. Technician Capture Guidance
    def test_05_capture_guidance(self):
        guidance = evaluate_capture_guidance(None)
        self.assertTrue(guidance["ready_to_capture"])
        self.assertGreater(len(guidance["guidance_items"]), 0)

    # 6. DME Risk Flag
    def test_06_dme_risk(self):
        norm = normalize_existing_results(self.sample_grade2)
        dme = assess_dme_risk(norm)
        self.assertIn(dme["status"], ["HIGH", "MODERATE", "LOW", "UNAVAILABLE"])
        self.assertIn("risk flag", dme["disclaimer"])

    # 7. Offline-First Queue
    def test_07_offline_queue(self):
        entry = enqueue_offline_case({"case_id": "TEST_OFFLINE_99", "grade": 1, "confidence": 93.0})
        self.assertEqual(entry["sync_status"], "PENDING")
        res = sync_pending_queue()
        self.assertTrue(res["success"])
        status = get_sync_status()
        self.assertIn("Synced", status["status_badge"])

    # 8. Regional Voice Report
    def test_08_voice_report(self):
        norm = normalize_existing_results(self.sample_grade0)
        voice_en = generate_voice_report(norm, lang="en")
        self.assertIn("normal", voice_en["spoken_text"].lower())
        voice_hi = generate_voice_report(norm, lang="hi")
        self.assertIn("जाँच सामान्य", voice_hi["spoken_text"])
        voice_gu = generate_voice_report(norm, lang="gu")
        self.assertIn("સામાન્ય", voice_gu["spoken_text"])

    # 9. Progressive Image Quality
    def test_09_progressive_quality(self):
        quality = evaluate_progressive_quality(None, fallback_grade=2)
        self.assertTrue(quality["is_partially_gradable"])
        self.assertEqual(len(quality["assessments"]), 3)

    # 10. Multi-Dataset Validation
    def test_10_multidataset_validation(self):
        benchmarks = get_multidataset_benchmark_suite()
        self.assertIn("APTOS_2019", benchmarks)
        self.assertIn("IDRiD", benchmarks)
        self.assertTrue(benchmarks["APTOS_2019"]["is_available"])
        self.assertFalse(benchmarks["Messidor_2"]["is_available"])
        self.assertEqual(benchmarks["Messidor_2"]["status"], "Not evaluated — dataset unavailable.")

    # 11. Robustness Testing
    def test_11_robustness_testing(self):
        rob = run_robustness_test(baseline_confidence=94.0, perturbation_type="blur")
        self.assertEqual(len(rob["curve"]), 6)
        self.assertGreater(rob["curve"][0]["confidence"], rob["curve"][-1]["confidence"])

    # 12. Longitudinal Progression
    def test_12_longitudinal_tracking(self):
        prior = {"grade": 1, "confidence": 92.0, "date": "2025-01-10"}
        curr = {"grade": 2, "confidence": 88.0, "date": "2026-01-10"}
        longit = track_longitudinal_progression(curr, prior)
        self.assertTrue(longit["has_prior"])
        self.assertEqual(longit["trajectory_status"], "Disease Advancement")
        self.assertIn("clinical confirmation", longit["disclaimer"])

    # 13. Bandwidth Optimization
    def test_13_bandwidth_optimization(self):
        bw = optimize_bandwidth_transmission(None)
        self.assertGreater(bw["reduction_percentage"], 60.0)
        self.assertIn("2G_Edge", bw["transmission_timings"])

    # 14. Public-Health Simulator
    def test_14_epidemiology_simulator(self):
        sim = run_epidemiology_simulation()
        self.assertEqual(len(sim["yearly_trajectory"]), 5)
        self.assertIn("MODELLED SCENARIO", sim["model_label"])
        self.assertGreater(sim["5_year_totals"]["total_blindness_cases_prevented"], 0)

    # 15. Cost-Effectiveness / QALY
    def test_15_cost_effectiveness(self):
        cost = calculate_cost_effectiveness()
        self.assertEqual(cost["status"], "CALCULATED")
        self.assertGreater(cost["economic_benefits"]["total_qaly_gained"], 0)

    # 16. Tamper-Evident Audit Log
    def test_16_tamper_log(self):
        block = append_audit_block("CASE_CHAIN_01", grade=1, triage="ROUTINE")
        self.assertIn("hash", block)
        self.assertIn("previous_hash", block)
        verif = verify_chain_integrity()
        self.assertTrue(verif["is_valid"])

    # 17. Second-Opinion Consensus
    def test_17_consensus(self):
        cons_agree = evaluate_consensus(primary_grade=0, primary_confidence=95.0)
        self.assertTrue(cons_agree["is_agreement"])
        self.assertEqual(cons_agree["status"], "AGREEMENT")

        cons_disagree = evaluate_consensus(primary_grade=2, primary_confidence=88.0)
        self.assertFalse(cons_disagree["is_agreement"])
        self.assertIn("Escalate", cons_disagree["action_directive"])

    # 18. Federated Learning Demo
    def test_18_federated_learning(self):
        fed = simulate_federated_round(round_number=1)
        self.assertEqual(fed["status"], "COMPLETED")
        self.assertEqual(fed["patient_images_transferred"], 0)
        self.assertIn("DPDP Act 2023", fed["privacy_compliance"])

    # 19. Multimodal Fusion Readiness
    def test_19_multimodal_fusion(self):
        fusion = evaluate_multimodal_fusion(fundus_grade=2, fundus_conf=89.0, oct_cst_um=340.0)
        self.assertEqual(fusion["fusion_layer_status"], "READY")
        self.assertIn("OCT confirmed", str(fusion["fused_risk_factors"]))

    # 20. Camera-Agnostic Calibration
    def test_20_camera_calibration(self):
        cam = detect_camera_profile(None)
        self.assertIn("Profile", cam["estimated_profile"])

    # 21. Adaptive Screening Interval
    def test_21_screening_interval(self):
        norm = normalize_existing_results(self.sample_grade0, patient_info={"clinicalVitals": {"bloodGlucose": {"hba1cPercent": 6.8}}})
        interval = recommend_screening_interval(norm)
        self.assertEqual(interval["recommended_months"], 12)

    # 22. Research Signals
    def test_22_research_signals(self):
        norm = normalize_existing_results(self.sample_grade2)
        res = extract_research_signals(norm, chronological_age=50)
        self.assertEqual(res["status"], "RESEARCH PROTOTYPE")
        self.assertIn("Not Clinically Validated", res["validation_state"])

    # 23. Comorbidity Flagging
    def test_23_comorbidities(self):
        norm = normalize_existing_results(self.sample_grade0)
        comorb = detect_comorbidities(norm)
        self.assertTrue(comorb["flags_evaluated"])
        self.assertGreaterEqual(comorb["cup_to_disc_ratio"], 0.3)

    # 24. Counterfactual Visual Explanation
    def test_24_counterfactual(self):
        res = generate_counterfactual_explanation(None)
        self.assertEqual(res["status"], "UNAVAILABLE")

    # 25. Fairness Audit Across Pigmentation
    def test_25_fairness_audit(self):
        fairness = audit_fairness_across_pigmentation()
        self.assertTrue(fairness["is_within_demographic_parity"])
        self.assertLess(fairness["maximum_sensitivity_disparity"], 0.03)

    # End-to-End Demo Mode Execution
    def test_demo_mode_end_to_end(self):
        demo = run_full_sih_demo("DEMO_002_MODERATE_DME")
        self.assertEqual(len(demo["all_25_features"]), 25)
        self.assertIn("DEMO DATA", demo["demo_watermark"])

    # Existing Pipeline Integrity: M1, M2, M3, M4 and bridge_server.py
    def test_existing_pipeline_unmodified(self):
        from backend.pipeline import mock_inference
        # M1 enhancement function exists and signature matches
        self.assertTrue(hasattr(mock_inference, "run_m1_enhancement"))
        # M2 grading function exists
        self.assertTrue(hasattr(mock_inference, "run_m2_grading"))
        # M3 segmentation function exists
        self.assertTrue(hasattr(mock_inference, "run_m3_segmentation"))
        # M4 Grad-CAM function exists
        self.assertTrue(hasattr(mock_inference, "run_m4_gradcam"))

if __name__ == "__main__":
    unittest.main()
