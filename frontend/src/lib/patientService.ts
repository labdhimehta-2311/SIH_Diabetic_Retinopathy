import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';

export interface BloodGlucoseData {
  fastingMgDl?: number;
  postPrandialMgDl?: number;
  hba1cPercent?: number;
}

export interface ClinicalVitals {
  diabetesType: string;
  yearOfDiagnosis: number;
  diabetesManagement: string;
  medicationDetails: string;
  bloodGlucose: BloodGlucoseData;
}

export interface HistoryAndSymptoms {
  otherSymptoms: string[];
  medicalHistory: string[];
  lifestyle: string;
  familyHistory: string;
}

export interface VisualExamData {
  vaRight: string;
  vaLeft: string;
  iopRight: string;
  iopLeft: string;
  notes: string;
}

export interface CategorizedProgressionFindings {
  improved: string[];
  worsened: string[];
  stable: string[];
  newlyDetected: string[];
  resolved: string[];
}

export interface EyeMetricChange {
  previous: string;
  current: string;
  status: 'Improved' | 'Worsened' | 'Stable';
}

export interface ScreeningComparison {
  previousScreeningId: string;
  previousScreeningDate: string;
  currentScreeningId: string;
  currentScreeningDate: string;
  screeningIntervalDays: number;
  previousGrade: number;
  currentGrade: number;
  previousGradeLabel: string;
  currentGradeLabel: string;
  gradeChangeStatus: 'Improved' | 'Worsened' | 'Stable';
  previousConfidence: number;
  currentConfidence: number;
  confidenceDelta: number;
  visualAcuity: {
    rightEye: EyeMetricChange;
    leftEye: EyeMetricChange;
  };
  iop: {
    rightEye: { previous: string; current: string };
    leftEye: { previous: string; current: string };
  };
  categorizedFindings: CategorizedProgressionFindings;
  clinicalProgressionSummary: string;
}

export interface HealthSupportiveMeasures {
  conditionFocus: string;
  physicalActivity: {
    recommendation: string;
    precautions: string;
  };
  dietaryAndNutrition: {
    guideline: string;
    glycemicControlTip: string;
  };
  monitoringAndAdherence: {
    selfMonitoring: string;
    followUpSchedule: string;
  };
  riskFactorManagement: {
    bloodPressureTarget: string;
    lipidTarget: string;
  };
  medicalDisclaimer: string;
}

export interface TreatmentClassInfo {
  className: string;
  clinicalIndication: string;
  evidenceRationale: string;
  evidenceSource?: string;
  considerations: string;
}

export interface ClinicianTreatmentReview {
  clinicianDisclaimer: string;
  primaryGuidelineCitation: string;
  severityStage: string;
  relevantTreatmentClasses: TreatmentClassInfo[];
}

export interface OfficialBookReference {
  bookTitle: string;
  chapterAndSection: string;
  biologicalPharmacology: string;
  trialEvidence?: string;
}

export interface RelevantMedication {
  drugName: string;
  genericInn: string;
  pharmacologicalClass: string;
  routeAndDosing: string;
  clinicalIndication: string;
  mechanismOfAction: string;
  prescribingConsiderations: string;
  officialTextbookReference: OfficialBookReference;
}

export interface OfficialMedicationsGuidance {
  grade: number;
  stageTitle: string;
  clinicalSummary: string;
  primaryOphthalmicMedications: RelevantMedication[];
  systemicMicrovascularMedications: RelevantMedication[];
  officialTextbookCitations: string[];
  pharmacotherapyDisclaimer: string;
}

export interface ScreeningSession {
  id: string;
  visitNumber?: number;
  date: string;
  doctorId: string;
  doctorName: string;
  visualExam: VisualExamData;
  checkM3Setup: boolean;
  aiResults: {
    grade: number;
    gradeLabel: string;
    confidence: number;
    referable: boolean;
    m3Executed: boolean;
    executionTimeSec: number;
    engine: string;
    images: {
      originalUrl: string;
      enhancedUrl: string;
      heatmapUrl: string;
      lesionMaskUrl?: string | null;
    };
  };
  clinicalNotes: string;
  recommendation: string;
  followUpInterval: string;
  comparisonReport?: ScreeningComparison | null;
  healthMeasures?: HealthSupportiveMeasures;
  treatmentReview?: ClinicianTreatmentReview;
  relevantMedications?: OfficialMedicationsGuidance;
  finalized: boolean;
  createdAt: string;
}

export interface Patient {
  id: string;
  doctorId: string;
  name: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  phone: string;
  address: string;
  occupation: string;
  dateOfRegistration: string;
  clinicalVitals: ClinicalVitals;
  history: HistoryAndSymptoms;
  screenings: ScreeningSession[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'dr_patients_store_v1';

/**
 * Generate Evidence-Based Health Supportive Measures based on detected DR severity grade.
 * Adheres strictly to American Diabetes Association (ADA) and WHO lifestyle guidelines.
 */
export function getHealthMeasuresForGrade(grade: number): HealthSupportiveMeasures {
  const disclaimer = 
    "CLINICAL SAFETY NOTICE: The following supportive measures are general, evidence-based recommendations derived from international clinical guidelines (ADA Standards of Care / AAO). They do not constitute personalized medical prescriptions and are not a cure for diabetic retinopathy. Individualized adjustments must be made in consultation with the treating physician.";

  if (grade >= 3) {
    // Severe NPDR or PDR (Grade 3 or 4)
    return {
      conditionFocus: "High-Risk Diabetic Retinopathy Microvascular Stabilization",
      physicalActivity: {
        recommendation: "Engage in gentle to moderate walking or non-impact aerobic exercise (20-30 minutes daily).",
        precautions: "CRITICAL: Strictly avoid vigorous high-intensity exercise, heavy weightlifting, inverted postures, or strenuous Valsalva maneuvers (straining) which can spike intraocular pressure and precipitate vitreous hemorrhage."
      },
      dietaryAndNutrition: {
        guideline: "Adopt a strict Mediterranean or DASH dietary pattern rich in leafy vegetables, antioxidants (lutein, zeaxanthin), and whole grains while strictly avoiding refined sugars.",
        glycemicControlTip: "Minimize postprandial glucose surges; rapid large glycemic swings can aggravate retinal microvascular capillary fragility."
      },
      monitoringAndAdherence: {
        selfMonitoring: "Perform daily SMBG (Self-Monitoring of Blood Glucose) or use continuous glucose monitoring (CGM). Target time-in-range (70-180 mg/dL) > 70%.",
        followUpSchedule: "Urgent vitreoretinal follow-up required within 1 to 4 weeks. Do not delay scheduled retinal imaging and laser/injection appointments."
      },
      riskFactorManagement: {
        bloodPressureTarget: "Strict blood pressure control (Target < 130/80 mmHg per ADA 2024 standards).",
        lipidTarget: "Aggressive lipid management; target LDL < 70 mg/dL to reduce retinal hard exudate accumulation."
      },
      medicalDisclaimer: disclaimer
    };
  } else if (grade >= 1) {
    // Mild to Moderate NPDR (Grade 1 or 2)
    return {
      conditionFocus: "Early-to-Intermediate Diabetic Retinopathy Progression Prevention",
      physicalActivity: {
        recommendation: "Aim for at least 150 minutes of moderate-intensity aerobic physical activity per week (e.g. brisk walking, cycling, swimming) spread over at least 3 days.",
        precautions: "Stay well-hydrated during physical activity. Avoid sudden extreme ocular trauma risks (contact sports without protective eyewear)."
      },
      dietaryAndNutrition: {
        guideline: "Focus on dietary fiber, omega-3 fatty acids, and low-glycemic-index carbohydrates. Restrict dietary sodium to < 2,300 mg/day.",
        glycemicControlTip: "Consistency in carbohydrate distribution across meals helps maintain steady glycemic control."
      },
      monitoringAndAdherence: {
        selfMonitoring: "Monitor fasting and post-meal blood glucose routinely. Track quarterly HbA1c to ensure target remains < 7.0%.",
        followUpSchedule: "Comprehensive dilated eye examination every 3 to 6 months to monitor microvascular stability."
      },
      riskFactorManagement: {
        bloodPressureTarget: "Maintain systolic blood pressure < 130 mmHg and diastolic < 80 mmHg.",
        lipidTarget: "Control serum triglycerides and maintain LDL < 100 mg/dL to prevent progressive lipid leakage."
      },
      medicalDisclaimer: disclaimer
    };
  } else {
    // Grade 0: No Apparent DR
    return {
      conditionFocus: "Primary Retinopathy Prevention & Metabolic Optimization",
      physicalActivity: {
        recommendation: "Maintain an active lifestyle with 150–300 minutes of moderate aerobic exercise and 2 resistance sessions per week.",
        precautions: "Standard cardiovascular safety clearance."
      },
      dietaryAndNutrition: {
        guideline: "Balanced nutrient-dense diet emphasizing whole foods, colorful vegetables, legumes, and lean proteins.",
        glycemicControlTip: "Maintain optimal glycemic control (target HbA1c < 6.5–7.0%) to prevent initial capillary pericyte loss."
      },
      monitoringAndAdherence: {
        selfMonitoring: "Regular fasting glucose and HbA1c checks every 3–6 months.",
        followUpSchedule: "Annual routine dilated fundus examination."
      },
      riskFactorManagement: {
        bloodPressureTarget: "Normotensive targets (< 120/80 mmHg).",
        lipidTarget: "Routine lipid panel screening annually."
      },
      medicalDisclaimer: disclaimer
    };
  }
}

/**
 * Generate Clinician Review & Treatment Reference Information.
 * STRICTLY DOCTOR-FACING, EVIDENCE-BASED, WITH CLINICAL DISCLAIMER.
 * NO AUTONOMOUS PRESCRIBING.
 */
export function getClinicianTreatmentReview(grade: number, referable: boolean): ClinicianTreatmentReview {
  const disclaimer = 
    "PHYSICIAN REFERENCE ONLY: This section provides recognized therapeutic categories and clinical trial evidence for licensed medical practitioners. It DOES NOT provide patient-specific prescription directives, drug dosages, or dispense medical orders. All pharmaceutical prescribing, laser photocoagulation, and surgical decisions must be independently evaluated and executed by a certified ophthalmologist or medical specialist.";

  if (grade >= 3) {
    return {
      clinicianDisclaimer: disclaimer,
      primaryGuidelineCitation: "AAO Retina/Vitreous Preferred Practice Patterns (2023) & DRCR Retina Network Protocols S, T, and V.",
      severityStage: grade === 4 ? "Proliferative Diabetic Retinopathy (PDR)" : "Severe Non-Proliferative Diabetic Retinopathy (Severe NPDR)",
      relevantTreatmentClasses: [
        {
          className: "Intravitreal Anti-VEGF Therapeutics (Vascular Endothelial Growth Factor Inhibitors)",
          clinicalIndication: "Active center-involving diabetic macular edema (CI-DME) and high-risk proliferative retinopathy.",
          evidenceRationale: "Anti-VEGF therapy (e.g., Aflibercept, Ranibizumab, Faricimab, Bevacizumab) demonstrates robust visual acuity improvement and induces DR severity scale regression (DRCR.net Protocol T).",
          considerations: "Requires strict clinician adherence to aseptic intravitreal injection technique and monitoring for intraocular pressure spikes or endophthalmitis."
        },
        {
          className: "Panretinal Photocoagulation (PRP Laser)",
          clinicalIndication: "High-risk proliferative retinopathy and select cases of severe NPDR with poor follow-up reliability.",
          evidenceRationale: "Reduces severe visual loss risk by > 50% via targeted ablation of ischemic peripheral retina, suppressing intraocular angiogenic drive (Diabetic Retinopathy Study - DRS).",
          considerations: "May cause peripheral visual field constriction and dark adaptation reduction; assess for co-existing DME prior to completion."
        },
        {
          className: "Intensive Systemic Glycemic & Microvascular Protection Agents",
          clinicalIndication: "Cardiovascular and microvascular co-management with endocrinology.",
          evidenceRationale: "SGLT2 inhibitors and GLP-1 receptor agonists offer documented renoprotective and glycemic stabilizing outcomes in diabetic populations (UKPDS / ACCORD studies).",
          considerations: "Coordinate with primary endocrinologist; avoid excessively precipitous drops in HbA1c without close retinal surveillance (transient early worsening phenomenon)."
        }
      ]
    };
  } else if (grade >= 1) {
    return {
      clinicianDisclaimer: disclaimer,
      primaryGuidelineCitation: "American Academy of Ophthalmology (AAO) Diabetic Retinopathy PPP & ADA Guidelines 2024.",
      severityStage: grade === 2 ? "Moderate Non-Proliferative Diabetic Retinopathy" : "Mild Non-Proliferative Diabetic Retinopathy",
      relevantTreatmentClasses: [
        {
          className: "Optical Coherence Tomography (OCT) & Diagnostic Surveillance",
          clinicalIndication: "Assess for subclinical macular thickening or non-center-involving DME.",
          evidenceRationale: "Spectral domain OCT provides micron-level resolution of intraretinal cysts and retinal nerve fiber layer integrity (DRCR.net Protocol V).",
          considerations: "Perform OCT if patient reports unexplained visual acuity loss or metamorphopsia."
        },
        {
          className: "Renin-Angiotensin-Aldosterone System (RAAS) Blockade (ACE-I / ARB)",
          clinicalIndication: "Hypertensive patients with diabetic microvascular complications.",
          evidenceRationale: "ACE inhibitors / ARBs reduce progression of retinal microvascular damage and diabetic nephropathy independent of blood pressure lowering alone (EUCLID / DIRECT studies).",
          considerations: "Monitor serum potassium and renal parameters periodically."
        },
        {
          className: "Focal / Grid Laser Photocoagulation (Physician Discretion)",
          clinicalIndication: "Clinically significant non-center-involving macular edema with distinct leaking microaneurysms.",
          evidenceRationale: "Reduces visual loss risk in non-center-involving focal exudative lesions (ETDRS standard).",
          considerations: "Anti-VEGF is now preferred first-line for center-involving edema, but focal laser remains relevant for isolated extrafoveal lesions."
        }
      ]
    };
  } else {
    return {
      clinicianDisclaimer: disclaimer,
      primaryGuidelineCitation: "ADA Standards of Care in Diabetes (2024) - Retinopathy Screening Chapter.",
      severityStage: "No Apparent Diabetic Retinopathy (Baseline / Prevention)",
      relevantTreatmentClasses: [
        {
          className: "Preventive Metformin / First-Line Antihyperglycemic Therapy",
          clinicalIndication: "Fundamental glycemic stabilization in Type 2 Diabetes.",
          evidenceRationale: "Tight glycemic control remains the single most effective intervention to delay the onset and slow the progression of diabetic microangiopathy (DCCT / UKPDS).",
          considerations: "Assess eGFR and renal status periodically."
        },
        {
          className: "Periodic Tele-Ophthalmology & Fundus Examination",
          clinicalIndication: "Annual screening surveillance for asymptomatic patients with diabetes.",
          evidenceRationale: "Early detection of silent microaneurysms before visual decline permits timely intervention and preserves sight.",
          considerations: "Advise patient to schedule follow-up immediately if any visual changes (floaters, blurriness) occur prior to 12-month interval."
        }
      ]
    };
  }
}

/**
 * Official Medical & Biological Textbook-Grounded Pharmacotherapy Guidance.
 * STRICTLY SOURCED FROM ACCREDITED MEDICAL PHARMACOLOGY TEXTBOOKS:
 *  - Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)
 *  - Katzung’s Basic & Clinical Pharmacology (15th Edition)
 *  - American Academy of Ophthalmology (AAO) Retina Preferred Practice Patterns
 *  - ADA Standards of Care in Diabetes (2024)
 *  - DRCR Retina Network Clinical Protocols
 */
export function getOfficialMedicationsGuidance(
  grade: number,
  referable: boolean,
  vitals?: ClinicalVitals
): OfficialMedicationsGuidance {
  const disclaimer =
    "OFFICIAL PHARMACOTHERAPY REFERENCE FOR CLINICIANS: All listed medications, therapeutic classes, biological mechanisms, and dosing guidelines are grounded in recognized medical pharmacology textbooks (Goodman & Gilman's The Pharmacological Basis of Therapeutics 14th Ed.; Katzung's Basic & Clinical Pharmacology 15th Ed.; AAO Retina PPP). This document is strictly an evidence-based clinical aid for licensed ophthalmologists and physicians. It DOES NOT constitute an autonomous prescription or automated drug dispensing order. Individual patient pharmacotherapy must be tailored following comprehensive systemic and vitreoretinal examination.";

  if (grade === 4) {
    // Proliferative Diabetic Retinopathy (PDR)
    return {
      grade: 4,
      stageTitle: "Proliferative Diabetic Retinopathy (PDR) — Neovascularization Active Stage",
      clinicalSummary: "Marked retinal ischemia inducing severe intraocular VEGF upregulation, pre-retinal and/or disc neovascularization (NVD/NVE), and high risk of vitreous hemorrhage or tractional retinal detachment. Urgent intravitreal biologic anti-VEGF therapy is indicated.",
      pharmacotherapyDisclaimer: disclaimer,
      officialTextbookCitations: [
        "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Ed.), Chapter 69: Ophthalmic Pharmacology, pp. 1247–1250",
        "Katzung’s Basic & Clinical Pharmacology (15th Ed.), Chapter 65: Specialized Biologics & Ophthalmic Therapeutics",
        "American Academy of Ophthalmology (AAO) Retina/Vitreous Preferred Practice Pattern (2023–2024)",
        "DRCR Retina Network Protocols S & T (JAMA Ophthalmology / NEJM)"
      ],
      primaryOphthalmicMedications: [
        {
          drugName: "Aflibercept (Eylea / VEGF Trap-Eye)",
          genericInn: "Aflibercept (recombinant fusion protein)",
          pharmacologicalClass: "Soluble Decoy Receptor Fusion Protein (VEGFR-1 & VEGFR-2 fused to human IgG1 Fc)",
          routeAndDosing: "Intravitreal Injection: 2.0 mg (0.05 mL) every 4 weeks for the first 5 doses, then 2.0 mg every 8 weeks (with treat-and-extend flexibility).",
          clinicalIndication: "High-risk Proliferative Diabetic Retinopathy (PDR) and Center-Involving Diabetic Macular Edema (CI-DME).",
          mechanismOfAction: "Acts as an all-isoform decoy receptor binding VEGF-A, VEGF-B, and Placental Growth Factor (PlGF) with picomolar affinity (Kd ~0.5 pM), completely preventing endothelial VEGFR activation, inhibiting abnormal neovascularization, and sealing hyperpermeable capillaries.",
          prescribingConsiderations: "Must be administered under sterile ophthalmic conditions using 30-gauge needle. Monitor intraocular pressure (IOP) 30 min post-injection. Screen for active ocular or periocular infections.",
          officialTextbookReference: {
            bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
            chapterAndSection: "Chapter 69: Ophthalmic Pharmacology — Antiangiogenic Agents, pp. 1247–1249",
            biologicalPharmacology: "Recombinant dimeric glycoprotein blocking VEGF-A/B and PlGF signaling pathways with higher binding affinity than native receptors.",
            trialEvidence: "DRCR.net Protocol T (NEJM 2015; 372:1193-1204) & VIVID/VISTA Trials (Ophthalmology 2015)"
          }
        },
        {
          drugName: "Ranibizumab (Lucentis)",
          genericInn: "Ranibizumab",
          pharmacologicalClass: "Recombinant Humanized Monoclonal Antibody Fab Fragment",
          routeAndDosing: "Intravitreal Injection: 0.5 mg (0.05 mL) for PDR or 0.3 mg (0.05 mL) for DME administered monthly.",
          clinicalIndication: "Proliferative Diabetic Retinopathy and Diabetic Macular Edema.",
          mechanismOfAction: "Affinity-matured humanized Fab fragment lacking Fc domain (lowering systemic retention) that selectively binds and neutralizes all biologically active isoforms of VEGF-A (including cleaved VEGF110), arresting endothelial proliferation and reducing vascular leakage.",
          prescribingConsiderations: "Proven non-inferior to panretinal photocoagulation (PRP) for visual acuity preservation with lower rates of peripheral visual field loss when patient compliance is verified.",
          officialTextbookReference: {
            bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
            chapterAndSection: "Chapter 69: Ophthalmic Pharmacology, pp. 1248–1250",
            biologicalPharmacology: "Monoclonal antibody Fab fragment engineered without Fc domain to accelerate retinal penetration and vitreal clearance while neutralizing VEGF-A.",
            trialEvidence: "DRCR.net Protocol S (JAMA 2015; 314:2137-2146) & RIDE/RISE Trials"
          }
        },
        {
          drugName: "Faricimab (Vabysmo)",
          genericInn: "Faricimab-svoa",
          pharmacologicalClass: "Bispecific Monoclonal Antibody (Dual VEGF-A & Angiopoietin-2 [Ang-2] Antagonist)",
          routeAndDosing: "Intravitreal Injection: 6.0 mg (0.05 mL) every 4 weeks for initial 4 doses, followed by OCT-guided maintenance every 8, 12, or 16 weeks.",
          clinicalIndication: "Active Proliferative Diabetic Retinopathy and Diabetic Macular Edema requiring extended durability.",
          mechanismOfAction: "Dual-target biologic that simultaneously neutralizes VEGF-A (blocking neovascular sprouting) and Angiopoietin-2 (inhibiting Tie2 receptor antagonism). This dual inhibition restores endothelial junctional tightness and pericyte coverage, significantly reducing retinal vascular leakage and inflammation.",
          prescribingConsiderations: "Allows extended treatment intervals (up to 16 weeks) in over 60% of eligible patients, reducing injection frequency burden.",
          officialTextbookReference: {
            bookTitle: "Katzung’s Basic & Clinical Pharmacology (15th Edition)",
            chapterAndSection: "Chapter 65: Specialized Biologics & Ophthalmic Therapeutics — Dual-Pathway Inhibitors",
            biologicalPharmacology: "First bispecific antibody approved for the eye, modulating both VEGF-mediated angiogenesis and Ang-2-mediated vascular destabilization.",
            trialEvidence: "YOSEMITE and RHINE 2-Year Phase III Clinical Trials (Lancet 2022; 399:741-755)"
          }
        },
        {
          drugName: "Dexamethasone Intravitreal Implant (Ozurdex)",
          genericInn: "Dexamethasone (sustained-release PLGA polymer matrix)",
          pharmacologicalClass: "Potent Synthetic Glucocorticoid Anti-inflammatory Implant",
          routeAndDosing: "0.7 mg intravitreal implant into posterior vitreous segment via preloaded 22-gauge applicator every 4 to 6 months.",
          clinicalIndication: "Persistent or refractory Diabetic Macular Edema unresponsive to anti-VEGF, or in pseudophakic patients.",
          mechanismOfAction: "Suppresses intraocular transcription of VEGF, IL-6, ICAM-1, and prostaglandins via glucocorticoid receptor activation; reinforces endothelial tight junctions and halts breakdown of the blood-retinal barrier.",
          prescribingConsiderations: "Monitor for secondary ocular hypertension (elevated IOP occurs in ~25-30% of eyes, responsive to topical IOP-lowering drops). Contraindicated in active ocular herpes simplex or mycobacterial infections.",
          officialTextbookReference: {
            bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
            chapterAndSection: "Chapter 46: Adrenocorticotropic Hormone & Adrenal Steroids, pp. 815–826; Chapter 69, p. 1245",
            biologicalPharmacology: "Micronized dexamethasone in poly(lactic-co-glycolic acid) biodegradable polymer matrix providing therapeutic vitreous drug concentrations for up to 180 days.",
            trialEvidence: "MEAD Study Group (Ophthalmology 2014; 121:2473-2481)"
          }
        }
      ],
      systemicMicrovascularMedications: [
        {
          drugName: "Lisinopril / Enalapril (or Telmisartan / Losartan)",
          genericInn: "Lisinopril (ACE Inhibitor) or Telmisartan (ARB)",
          pharmacologicalClass: "Renin-Angiotensin-Aldosterone System (RAAS) Antagonist",
          routeAndDosing: "Oral: Lisinopril 10–40 mg PO once daily or Telmisartan 40–80 mg PO once daily.",
          clinicalIndication: "Blood pressure optimization (target <130/80 mmHg) and microvascular capillary protection in diabetic retinopathy.",
          mechanismOfAction: "Blocks Angiotensin II-mediated vasoconstriction, attenuating excessive intraglomerular and retinal capillary hydraulic pressure; suppresses local retinal capillary cell apoptosis and downregulates retinal VEGF expression.",
          prescribingConsiderations: "Monitor serum creatinine and potassium 2 weeks post-initiation. Avoid dual ACE-I + ARB combination.",
          officialTextbookReference: {
            bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
            chapterAndSection: "Chapter 26: Renin and Angiotensin, pp. 471–488",
            biologicalPharmacology: "Competitive inhibition of angiotensin-converting enzyme prevents conversion of angiotensin I to active vasoconstrictor angiotensin II.",
            trialEvidence: "EUCLID Study (Lancet 1997) & DIRECT Retinopathy Program (Lancet 2008)"
          }
        },
        {
          drugName: "Fenofibrate (Lipanthyl / Tricor)",
          genericInn: "Fenofibrate",
          pharmacologicalClass: "Peroxisome Proliferator-Activated Receptor Alpha (PPAR-alpha) Agonist",
          routeAndDosing: "Oral: 145 mg to 200 mg PO once daily with meals.",
          clinicalIndication: "Adjunctive systemic pharmacotherapy to slow diabetic retinopathy progression and reduce laser photocoagulation requirement.",
          mechanismOfAction: "Stimulates nuclear receptor PPAR-alpha, enhancing fatty acid beta-oxidation, downregulating intraretinal inflammation, protecting pericytes from apoptotic demise, and preserving inner blood-retinal barrier integrity independent of baseline serum triglyceride concentrations.",
          prescribingConsiderations: "Dose reduction necessary in mild-to-moderate chronic kidney disease (eGFR 30–59 mL/min). Contraindicated in severe renal impairment (eGFR <30).",
          officialTextbookReference: {
            bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
            chapterAndSection: "Chapter 33: Lipid-Lowering Drugs — Fibrates, pp. 612–616",
            biologicalPharmacology: "Synthetic PPAR-alpha ligand modulating transcriptional expression of endothelial adhesion molecules and lipid transport apolipoproteins.",
            trialEvidence: "FIELD Trial (Lancet 2007; 370:1687-1697) & ACCORD-Eye Trial (NEJM 2010; 363:233-244)"
          }
        }
      ]
    };
  } else if (grade === 3) {
    // Severe Non-Proliferative Diabetic Retinopathy (Severe NPDR)
    return {
      grade: 3,
      stageTitle: "Severe Non-Proliferative Diabetic Retinopathy (Severe NPDR) — Pre-Proliferative Stage",
      clinicalSummary: "Extensive retinal microvascular non-perfusion fulfilling the 4:2:1 international clinical rule (>20 intraretinal hemorrhages in 4 quadrants, venous beading in 2+ quadrants, or IRMA in 1+ quadrant). Approximately 50% probability of progressing to Proliferative DR within 12 months without therapeutic intervention.",
      pharmacotherapyDisclaimer: disclaimer,
      officialTextbookCitations: [
        "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Ed.), Chapter 69: Ophthalmic Pharmacology, pp. 1247–1250",
        "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Ed.), Chapter 47: Endocrine Pancreas & Pharmacotherapy of Diabetes Mellitus, pp. 838–846",
        "American Academy of Ophthalmology (AAO) Diabetic Retinopathy Preferred Practice Pattern (2023)",
        "DRCR Retina Network Protocol W (JAMA Ophthalmology 2021; 139:701-712)"
      ],
      primaryOphthalmicMedications: [
        {
          drugName: "Aflibercept (Eylea)",
          genericInn: "Aflibercept (recombinant fusion protein)",
          pharmacologicalClass: "Soluble Decoy Receptor Biologic (Anti-VEGF / Anti-PlGF)",
          routeAndDosing: "Intravitreal Injection: 2.0 mg (0.05 mL) at baseline, 1 month, 2 months, 4 months, then every 4 months (DRCR Protocol W preventive regimen).",
          clinicalIndication: "Severe NPDR at high risk of rapid progression to Proliferative DR or Center-Involving DME.",
          mechanismOfAction: "Prophylactic blockade of elevated intraocular VEGF-A and PlGF halts endothelial capillary closure, reverses non-perfusion areas, and prevents the outgrowth of fragile new vessels on the disc and retina.",
          prescribingConsiderations: "Protocol W demonstrated a 68% relative reduction in the development of PDR or center-involving DME over 2 years in eyes with severe NPDR.",
          officialTextbookReference: {
            bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
            chapterAndSection: "Chapter 69: Ophthalmic Pharmacology — Antiangiogenesis, pp. 1247–1249",
            biologicalPharmacology: "High-affinity binding of all VEGF isoforms suppresses pre-proliferative angiogenic drive before irreversible neovascular complications arise.",
            trialEvidence: "DRCR Retina Network Protocol W (JAMA Ophthalmol 2021; 139:701-712)"
          }
        },
        {
          drugName: "Ranibizumab (Lucentis)",
          genericInn: "Ranibizumab",
          pharmacologicalClass: "Monoclonal Antibody Fab Fragment Anti-VEGF-A",
          routeAndDosing: "Intravitreal Injection: 0.5 mg (0.05 mL) monthly as clinically indicated.",
          clinicalIndication: "Severe pre-proliferative diabetic retinopathy with impending neovascularization or non-clearing exudation.",
          mechanismOfAction: "Binds active isoforms of VEGF-A, reversing progressive microvascular permeability and microaneurysm leakage.",
          prescribingConsiderations: "Assess for co-existing macular edema using optical coherence tomography (OCT) prior to dosing.",
          officialTextbookReference: {
            bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
            chapterAndSection: "Chapter 69: Ophthalmic Pharmacology, pp. 1248–1250",
            biologicalPharmacology: "Neutralization of VEGF-A suppresses intracellular endothelial nitric oxide synthase (eNOS) hyperactivation and prevents vascular leakage.",
            trialEvidence: "RIDE & RISE Long-term Extension Analyses"
          }
        }
      ],
      systemicMicrovascularMedications: [
        {
          drugName: "Metformin Hydrochloride + SGLT2 Inhibitor (Empagliflozin / Dapagliflozin)",
          genericInn: "Metformin + Empagliflozin",
          pharmacologicalClass: "Biguanide + Sodium-Glucose Cotransporter-2 (SGLT2) Inhibitor",
          routeAndDosing: "Oral: Metformin 1000 mg BD + Empagliflozin 10 mg to 25 mg PO once daily in the morning.",
          clinicalIndication: "Dual glycemic control, weight reduction, and renal/cardiovascular microvascular protection.",
          mechanismOfAction: "Metformin activates AMPK, dampening hepatic gluconeogenesis; Empagliflozin blocks proximal renal glucose reabsorption, lowering systemic glucose toxicity, systemic arterial stiffness, and microvascular hyperfiltration.",
          prescribingConsiderations: "Check eGFR prior to initiation. Educate patient on genitourinary hygiene and signs of euglycemic DKA.",
          officialTextbookReference: {
            bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
            chapterAndSection: "Chapter 47: Endocrine Pancreas & Pharmacotherapy of Diabetes Mellitus, pp. 838–846",
            biologicalPharmacology: "AMPK-mediated cellular metabolic regulation coupled with osmotic renal glycosuria.",
            trialEvidence: "EMPA-REG OUTCOME (NEJM 2015) & UKPDS 34 (Lancet 1998)"
          }
        },
        {
          drugName: "Fenofibrate (Lipanthyl)",
          genericInn: "Fenofibrate",
          pharmacologicalClass: "PPAR-alpha Agonist / Retinal Neuroprotective Agent",
          routeAndDosing: "Oral: 145 mg to 200 mg PO once daily with main meal.",
          clinicalIndication: "Prevention of pre-proliferative microvascular worsening and reduction in laser interventions.",
          mechanismOfAction: "Upregulates retinal antioxidant defenses, suppresses intercellular adhesion molecule 1 (ICAM-1), and preserves pericyte-endothelial cross-talk in ischemic capillary beds.",
          prescribingConsiderations: "Indicated independent of baseline lipid profile based on landmark clinical trial data.",
          officialTextbookReference: {
            bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
            chapterAndSection: "Chapter 33: Lipid-Lowering Drugs, pp. 612–616",
            biologicalPharmacology: "Activates transcriptional co-activators regulating apolipoprotein synthesis and downregulating pro-inflammatory chemokines.",
            trialEvidence: "ACCORD-Eye Study (NEJM 2010; 363:233-244)"
          }
        }
      ]
    };
  } else if (grade === 2) {
    // Moderate Non-Proliferative Diabetic Retinopathy (Moderate NPDR)
    return {
      grade: 2,
      stageTitle: "Moderate Non-Proliferative Diabetic Retinopathy (Moderate NPDR) — Established Microvascular Injury",
      clinicalSummary: "Manifest by multiple microaneurysms, blot/dot retinal hemorrhages, hard lipid exudates, and early cotton-wool spots. Primary goal is stabilizing retinal capillary endothelium, preventing progression to severe ischemic stages, and identifying any early subclinical macular edema via OCT.",
      pharmacotherapyDisclaimer: disclaimer,
      officialTextbookCitations: [
        "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Ed.), Chapter 47: Endocrine Pancreas & Pharmacotherapy of Diabetes Mellitus, pp. 838–846",
        "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Ed.), Chapter 26: Renin and Angiotensin, pp. 471–488",
        "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Ed.), Chapter 69: Ophthalmic Pharmacology, pp. 1247–1250",
        "ADA Standards of Care in Diabetes (2024), Chapter 12: Retinopathy & Microvascular Complications"
      ],
      primaryOphthalmicMedications: [
        {
          drugName: "Aflibercept / Ranibizumab (Conditional on OCT-Confirmed DME)",
          genericInn: "Aflibercept 2.0 mg or Ranibizumab 0.3 mg",
          pharmacologicalClass: "Anti-VEGF Biologic Therapy",
          routeAndDosing: "Intravitreal Injection: Only indicated if Center-Involving Diabetic Macular Edema (CI-DME) is documented on Macular OCT.",
          clinicalIndication: "Center-involving macular edema threatening visual acuity (DRCR.net Protocol V).",
          mechanismOfAction: "Suppresses vascular permeability factor, resolving subretinal and intraretinal fluid accumulation within the macula.",
          prescribingConsiderations: "If macular edema is non-center-involving and visual acuity is 6/6 (20/20), initial observation with close 16-week OCT surveillance is supported by DRCR Protocol V.",
          officialTextbookReference: {
            bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
            chapterAndSection: "Chapter 69: Ophthalmic Pharmacology, pp. 1247–1250",
            biologicalPharmacology: "Endothelial stabilization via targeted competitive antagonism of VEGF receptors.",
            trialEvidence: "DRCR.net Protocol V (JAMA 2019; 321:1886-1894)"
          }
        }
      ],
      systemicMicrovascularMedications: [
        {
          drugName: "Metformin Hydrochloride",
          genericInn: "Metformin Hydrochloride",
          pharmacologicalClass: "Biguanide / AMPK Activator",
          routeAndDosing: "Oral: 500 mg to 1000 mg PO twice daily with meals (titrated to achieve target HbA1c <7.0%).",
          clinicalIndication: "Foundation glycemic control to minimize advanced glycation end-product (AGE) accumulation in retinal capillaries.",
          mechanismOfAction: "Activates hepatic and endothelial AMP-activated protein kinase (AMPK), lowering glucose toxicity and mitigating sorbitol pathway flux in retinal pericytes.",
          prescribingConsiderations: "Verify renal function: eGFR >45 mL/min safe for full dosing; discontinue if eGFR drops <30 mL/min.",
          officialTextbookReference: {
            bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
            chapterAndSection: "Chapter 47: Endocrine Pancreas & Pharmacotherapy of Diabetes Mellitus, pp. 838–841",
            biologicalPharmacology: "Inhibition of mitochondrial respiratory chain complex I leads to increased cellular AMP/ATP ratio, stimulating AMPK phosphorylation.",
            trialEvidence: "UK Prospective Diabetes Study (UKPDS 34, Lancet 1998)"
          }
        },
        {
          drugName: "Lisinopril / Enalapril (or Telmisartan)",
          genericInn: "Lisinopril (ACE Inhibitor) or Telmisartan (ARB)",
          pharmacologicalClass: "RAAS Inhibitor / Capillary Vasodilator",
          routeAndDosing: "Oral: Lisinopril 10–20 mg PO once daily (target systolic BP <130 mmHg).",
          clinicalIndication: "Systemic blood pressure optimization and reduction of microvascular shear injury in retinal precapillary arterioles.",
          mechanismOfAction: "Attenuates angiotensin II-mediated vasoconstriction, reducing capillary transmural hydrostatic filtration pressure and curbing exudate formation.",
          prescribingConsiderations: "Measure baseline potassium and creatinine. Warn female patients of reproductive age regarding teratogenicity.",
          officialTextbookReference: {
            bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
            chapterAndSection: "Chapter 26: Renin and Angiotensin, pp. 471–488",
            biologicalPharmacology: "Blocks the conversion of angiotensin I to angiotensin II, augmenting bradykinin-mediated endothelial nitric oxide release.",
            trialEvidence: "EUCLID Study Group (Lancet 1997; 349:1797-1802)"
          }
        },
        {
          drugName: "Fenofibrate (Lipanthyl)",
          genericInn: "Fenofibrate",
          pharmacologicalClass: "Peroxisome Proliferator-Activated Receptor Alpha (PPAR-alpha) Agonist",
          routeAndDosing: "Oral: 145 mg to 200 mg PO once daily.",
          clinicalIndication: "Slowing rate of diabetic retinopathy progression in patients with pre-existing mild-to-moderate lesions.",
          mechanismOfAction: "Inhibits VEGF expression, downregulates retinal leukostasis, and attenuates apoptotic death of pericytes via PPAR-alpha transcriptional control.",
          prescribingConsiderations: "Demonstrated a 31% reduction in retinopathy progression in the FIELD study, confirmed in the ACCORD-Eye trial.",
          officialTextbookReference: {
            bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
            chapterAndSection: "Chapter 33: Lipid-Lowering Drugs, pp. 612–616",
            biologicalPharmacology: "Ligand-activated transcription factor regulating genes involved in fatty acid oxidation, vascular inflammation, and oxidative stress.",
            trialEvidence: "FIELD Study (Lancet 2007) & ACCORD-Eye Trial (NEJM 2010)"
          }
        }
      ]
    };
  } else if (grade === 1) {
    // Mild Non-Proliferative Diabetic Retinopathy (Mild NPDR)
    return {
      grade: 1,
      stageTitle: "Mild Non-Proliferative Diabetic Retinopathy (Mild NPDR) — Incipient Microangiopathy",
      clinicalSummary: "Characterized by the appearance of isolated microaneurysms without hard exudates, cotton-wool spots, or macular thickening. Intravitreal ophthalmic pharmacotherapy is NOT indicated. Focus is on intensive systemic microvascular stabilization to halt disease progression.",
      pharmacotherapyDisclaimer: disclaimer,
      officialTextbookCitations: [
        "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Ed.), Chapter 47: Endocrine Pancreas & Pharmacotherapy of Diabetes Mellitus, pp. 838–841",
        "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Ed.), Chapter 33: Lipid-Lowering Drugs — Statins, pp. 605–612",
        "American Diabetes Association (ADA) Standards of Care in Diabetes (2024), Chapter 12: Retinopathy",
        "Katzung’s Basic & Clinical Pharmacology (15th Ed.), Chapter 41: Pancreatic Hormones & Antidiabetic Drugs"
      ],
      primaryOphthalmicMedications: [
        {
          drugName: "Topical Lubricants / Ocular Surface Protection (Symptomatic Only)",
          genericInn: "Carboxymethylcellulose 0.5% or Sodium Hyaluronate 0.1%",
          pharmacologicalClass: "Ophthalmic Demulcent / Tear Substitute",
          routeAndDosing: "Topical Ophthalmic: 1 drop in each eye 3–4 times daily as needed for comfort.",
          clinicalIndication: "Neurotrophic dry eye symptoms and tear-film instability frequently co-occurring with diabetic autonomic neuropathy.",
          mechanismOfAction: "Provides high-viscosity ocular surface hydration, stabilizing pre-corneal tear film without affecting intraretinal microvasculature.",
          prescribingConsiderations: "Preservative-free formulations preferred if instilled >4 times daily.",
          officialTextbookReference: {
            bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
            chapterAndSection: "Chapter 69: Ophthalmic Pharmacology — Lubricants & Artificial Tears",
            biologicalPharmacology: "Viscoelastic polymers forming a protective hydration shield over corneal epithelial microvilli.",
            trialEvidence: "DEWS II Ocular Surface Consensus Guidelines"
          }
        }
      ],
      systemicMicrovascularMedications: [
        {
          drugName: "Metformin Hydrochloride",
          genericInn: "Metformin Hydrochloride",
          pharmacologicalClass: "Biguanide First-Line Insulin Sensitizer",
          routeAndDosing: "Oral: 500 mg to 1000 mg PO twice daily with meals (target HbA1c <7.0%).",
          clinicalIndication: "Stabilization of blood glucose to suppress polyol pathway activity and pericyte loss.",
          mechanismOfAction: "Improves cellular insulin sensitivity, downregulates hepatic gluconeogenesis, and dampens reactive oxygen species (ROS) formation in vascular endothelial cells.",
          prescribingConsiderations: "Titrate slowly over 2–4 weeks to minimize gastrointestinal discomfort.",
          officialTextbookReference: {
            bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
            chapterAndSection: "Chapter 47: Endocrine Pancreas & Pharmacotherapy of Diabetes Mellitus, pp. 838–841",
            biologicalPharmacology: "AMP-activated protein kinase (AMPK) stimulation promotes GLUT4 translocation and mitochondrial homeostasis.",
            trialEvidence: "UKPDS 34 (Lancet 1998) & DCCT 10-Year Microvascular Cohort (NEJM 1993)"
          }
        },
        {
          drugName: "Atorvastatin Calcium",
          genericInn: "Atorvastatin",
          pharmacologicalClass: "HMG-CoA Reductase Inhibitor (Moderate-to-High Intensity Statin)",
          routeAndDosing: "Oral: 20 mg to 40 mg PO once daily at bedtime (target LDL-C <70 mg/dL).",
          clinicalIndication: "Dyslipidemia management to prevent serum lipoprotein extravasation and hard lipid exudate formation in retinal tissue.",
          mechanismOfAction: "Competitive inhibitor of 3-hydroxy-3-methylglutaryl-coenzyme A reductase, lowering circulating apoB-containing atherogenic lipoproteins and exerting pleiotropic anti-inflammatory endothelial stabilization.",
          prescribingConsiderations: "Assess baseline liver transaminases. Counsel on reporting unexplained muscle soreness or weakness.",
          officialTextbookReference: {
            bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
            chapterAndSection: "Chapter 33: Lipid-Lowering Drugs — Statins, pp. 605–612",
            biologicalPharmacology: "Competitive inhibition of the rate-limiting step of cholesterol biosynthesis upregulates hepatic LDL receptor clearance.",
            trialEvidence: "CARDS Trial (Lancet 2004; 364:685-696)"
          }
        }
      ]
    };
  } else {
    // Grade 0: No Apparent Diabetic Retinopathy
    return {
      grade: 0,
      stageTitle: "No Apparent Diabetic Retinopathy — Baseline Metabolic Protection",
      clinicalSummary: "Normal retinal fundus without diabetic microvascular lesions. Primary clinical objective is primary prevention: maintaining tight glycemic, blood pressure, and lipid parameters to prevent the initiation of retinal capillary basement membrane thickening and pericyte apoptosis.",
      pharmacotherapyDisclaimer: disclaimer,
      officialTextbookCitations: [
        "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Ed.), Chapter 47: Endocrine Pancreas & Pharmacotherapy of Diabetes Mellitus, pp. 838–846",
        "American Diabetes Association (ADA) Standards of Care in Diabetes (2024), Chapter 12: Retinopathy Screening & Prevention",
        "Katzung’s Basic & Clinical Pharmacology (15th Ed.), Chapter 41: Pancreatic Hormones & Antidiabetic Drugs"
      ],
      primaryOphthalmicMedications: [],
      systemicMicrovascularMedications: [
        {
          drugName: "Metformin Hydrochloride (Preventive Maintenance)",
          genericInn: "Metformin Hydrochloride",
          pharmacologicalClass: "Biguanide First-Line Antihyperglycemic",
          routeAndDosing: "Oral: 500 mg to 1000 mg PO twice daily with meals (individualized to maintain HbA1c <6.5–7.0%).",
          clinicalIndication: "Fundamental glycemic stabilization in Type 2 Diabetes to maintain healthy retinal and renal microvasculature.",
          mechanismOfAction: "Reduces hepatic glucose output and improves peripheral glucose utilization, preventing microvascular endothelial oxidative stress.",
          prescribingConsiderations: "Periodic annual monitoring of serum vitamin B12 levels and renal function (eGFR).",
          officialTextbookReference: {
            bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
            chapterAndSection: "Chapter 47: Endocrine Pancreas & Pharmacotherapy of Diabetes Mellitus, pp. 838–841",
            biologicalPharmacology: "AMPK-mediated insulin sensitization reduces long-term microvascular complication rates in newly diagnosed diabetes.",
            trialEvidence: "UKPDS Long-Term Follow-up (NEJM 2008; 359:1577-1589)"
          }
        },
        {
          drugName: "Antihypertensive Maintenance (ACE-I / ARB if indicated)",
          genericInn: "Enalapril / Lisinopril or Losartan",
          pharmacologicalClass: "RAAS Modulator",
          routeAndDosing: "Oral: Initiated as clinically indicated if BP exceeds 120/80 mmHg (titrate for normotension).",
          clinicalIndication: "Primary vascular protection against diabetic endothelial shear stress and hypertensive retinopathy.",
          mechanismOfAction: "Prevents pressure-induced capillary microaneurysm outpouching and basement membrane degradation.",
          prescribingConsiderations: "Standard annual surveillance of blood pressure and urine albumin-to-creatinine ratio (uACR).",
          officialTextbookReference: {
            bookTitle: "Goodman & Gilman’s The Pharmacological Basis of Therapeutics (14th Edition)",
            chapterAndSection: "Chapter 26: Renin and Angiotensin, pp. 471–488",
            biologicalPharmacology: "Selective blockade of the renin-angiotensin-aldosterone cascade reduces vascular remodeling and capillary hypertension.",
            trialEvidence: "ADA Standards of Care 2024 — Cardiovascular Disease & Risk Management"
          }
        }
      ]
    };
  }
}

/**
 * Compare two visual acuity values (e.g. "6/6", "6/9", "6/18", "6/60", "3/60").
 */
function parseVaDenominator(va: string): number {
  if (!va) return 6;
  const match = va.match(/(\d+)\/(\d+)/);
  if (match) {
    const num = parseFloat(match[1]);
    const den = parseFloat(match[2]);
    return den / (num || 1); // higher number means worse vision
  }
  return 6;
}

function compareVisualAcuity(prevVa: string, currVa: string): EyeMetricChange {
  if (!prevVa || !currVa) {
    return { previous: prevVa || 'N/A', current: currVa || 'N/A', status: 'Stable' };
  }
  const prevVal = parseVaDenominator(prevVa);
  const currVal = parseVaDenominator(currVa);

  if (currVal < prevVal - 0.2) {
    return { previous: prevVa, current: currVa, status: 'Improved' };
  } else if (currVal > prevVal + 0.2) {
    return { previous: prevVa, current: currVa, status: 'Worsened' };
  }
  return { previous: prevVa, current: currVa, status: 'Stable' };
}

/**
 * Longitudinal Comparison Engine.
 * Compares an immediately previous completed screening with the current screening.
 * Categorizes changes into Improved, Worsened, Stable, Newly Detected, and Resolved.
 */
export function compareScreenings(previous: ScreeningSession, current: ScreeningSession): ScreeningComparison {
  const prevDate = previous.date || previous.createdAt?.split('T')[0] || 'Unknown Date';
  const currDate = current.date || current.createdAt?.split('T')[0] || 'Unknown Date';

  // Calculate days between screenings
  let intervalDays = 0;
  try {
    const pD = new Date(prevDate).getTime();
    const cD = new Date(currDate).getTime();
    if (!isNaN(pD) && !isNaN(cD)) {
      intervalDays = Math.max(0, Math.round((cD - pD) / (1000 * 60 * 60 * 24)));
    }
  } catch (e) {
    intervalDays = 0;
  }

  const prevGrade = previous.aiResults?.grade ?? 0;
  const currGrade = current.aiResults?.grade ?? 0;
  const prevLabel = previous.aiResults?.gradeLabel || `Grade ${prevGrade}`;
  const currLabel = current.aiResults?.gradeLabel || `Grade ${currGrade}`;

  let gradeChangeStatus: 'Improved' | 'Worsened' | 'Stable' = 'Stable';
  if (currGrade < prevGrade) {
    gradeChangeStatus = 'Improved';
  } else if (currGrade > prevGrade) {
    gradeChangeStatus = 'Worsened';
  } else {
    gradeChangeStatus = 'Stable';
  }

  const prevConf = previous.aiResults?.confidence || 0;
  const currConf = current.aiResults?.confidence || 0;
  const confidenceDelta = Number((currConf - prevConf).toFixed(1));

  // Visual Acuity
  const vaRightChange = compareVisualAcuity(previous.visualExam?.vaRight, current.visualExam?.vaRight);
  const vaLeftChange = compareVisualAcuity(previous.visualExam?.vaLeft, current.visualExam?.vaLeft);

  // Categorized Findings Lists
  const improved: string[] = [];
  const worsened: string[] = [];
  const stable: string[] = [];
  const newlyDetected: string[] = [];
  const resolved: string[] = [];

  // Grade evaluations
  if (gradeChangeStatus === 'Improved') {
    improved.push(
      `Retinopathy severity regression: primary grading improved from ${prevLabel} (Grade ${prevGrade}) to ${currLabel} (Grade ${currGrade}).`
    );
  } else if (gradeChangeStatus === 'Worsened') {
    worsened.push(
      `Disease advancement detected: progression from ${prevLabel} (Grade ${prevGrade}) to ${currLabel} (Grade ${currGrade}).`
    );
  } else {
    stable.push(
      `Primary severity grade stable at ${currLabel} (Grade ${currGrade}) across the screening interval.`
    );
  }

  // Visual acuity findings
  if (vaRightChange.status === 'Improved') {
    improved.push(`Visual Acuity improvement in Right Eye (OD): improved from ${vaRightChange.previous} to ${vaRightChange.current}.`);
  } else if (vaRightChange.status === 'Worsened') {
    worsened.push(`Visual Acuity deterioration in Right Eye (OD): dropped from ${vaRightChange.previous} to ${vaRightChange.current}.`);
  } else if (vaRightChange.previous && vaRightChange.previous !== 'N/A') {
    stable.push(`Right Eye (OD) Visual Acuity maintained at ${vaRightChange.current}.`);
  }

  if (vaLeftChange.status === 'Improved') {
    improved.push(`Visual Acuity improvement in Left Eye (OS): improved from ${vaLeftChange.previous} to ${vaLeftChange.current}.`);
  } else if (vaLeftChange.status === 'Worsened') {
    worsened.push(`Visual Acuity deterioration in Left Eye (OS): dropped from ${vaLeftChange.previous} to ${vaLeftChange.current}.`);
  } else if (vaLeftChange.previous && vaLeftChange.previous !== 'N/A') {
    stable.push(`Left Eye (OS) Visual Acuity maintained at ${vaLeftChange.current}.`);
  }

  // Referable status triggers
  const prevReferable = Boolean(previous.aiResults?.referable);
  const currReferable = Boolean(current.aiResults?.referable);

  if (currReferable && !prevReferable) {
    newlyDetected.push(
      `High-Risk Referable Threshold Triggered: Patient has transitioned to referable diabetic retinopathy requiring specialist review.`
    );
  } else if (!currReferable && prevReferable) {
    resolved.push(
      `Prior referable condition status resolved following clinical management; current state no longer requires immediate tertiary referral.`
    );
  } else if (currReferable && prevReferable) {
    worsened.push(
      `Persistent referable retinopathy: patient continues to meet tertiary care referral criteria.`
    );
  }

  // Lesion segmentation & Grad-CAM findings
  const prevMask = previous.aiResults?.images?.lesionMaskUrl;
  const currMask = current.aiResults?.images?.lesionMaskUrl;

  if (current.checkM3Setup && currMask && !prevMask) {
    newlyDetected.push(
      `U-Net Lesion Segmentation highlights active microaneurysm and exudative clusters not evident in prior assessment.`
    );
  } else if (!currMask && prevMask) {
    resolved.push(
      `Significant reduction or resolution of previously segmented microvascular lesion clusters.`
    );
  } else if (currMask && prevMask) {
    if (gradeChangeStatus === 'Worsened') {
      worsened.push(`Increase in spatial distribution and density of segmented retinal microlesions.`);
    } else if (gradeChangeStatus === 'Improved') {
      improved.push(`Contraction of segmented lesion clusters and reduced exudative surface area.`);
    } else {
      stable.push(`Microlesion spatial distribution and neural heatmap activation patterns remain stable.`);
    }
  }

  // Intraocular pressure findings
  const prevIopR = parseInt(previous.visualExam?.iopRight || '0', 10);
  const currIopR = parseInt(current.visualExam?.iopRight || '0', 10);
  if (currIopR > 21 && prevIopR <= 21) {
    newlyDetected.push(`Elevated Intraocular Pressure in Right Eye: measured at ${current.visualExam?.iopRight} (exceeds 21 mmHg threshold).`);
  }

  const prevIopL = parseInt(previous.visualExam?.iopLeft || '0', 10);
  const currIopL = parseInt(current.visualExam?.iopLeft || '0', 10);
  if (currIopL > 21 && prevIopL <= 21) {
    newlyDetected.push(`Elevated Intraocular Pressure in Left Eye: measured at ${current.visualExam?.iopLeft} (exceeds 21 mmHg threshold).`);
  }

  // Synthesize clinical progression summary
  const intervalText = intervalDays > 0 
    ? `${Math.round(intervalDays / 30)} month interval (${intervalDays} days)` 
    : 'Follow-up visit';

  let progressionSummary = '';
  if (gradeChangeStatus === 'Improved') {
    progressionSummary = `Longitudinal evaluation across ${intervalText} demonstrates positive clinical progression. The patient's retinal findings have improved from ${prevLabel} (${prevDate}) to ${currLabel} (${currDate}), reflecting favorable response to metabolic control or ophthalmic therapy.`;
  } else if (gradeChangeStatus === 'Worsened') {
    progressionSummary = `Longitudinal evaluation across ${intervalText} indicates microvascular disease advancement. Progression from ${prevLabel} (${prevDate}) to ${currLabel} (${currDate}) warrants prompt re-evaluation of systemic glycemic targets and urgent vitreoretinal consultation.`;
  } else {
    progressionSummary = `Longitudinal comparison indicates stable diabetic retinopathy status across ${intervalText}. Key diagnostic indicators, retinal grading (${currLabel}), and visual exam parameters remain consistent between ${prevDate} and ${currDate}.`;
  }

  return {
    previousScreeningId: previous.id,
    previousScreeningDate: prevDate,
    currentScreeningId: current.id,
    currentScreeningDate: currDate,
    screeningIntervalDays: intervalDays,
    previousGrade: prevGrade,
    currentGrade: currGrade,
    previousGradeLabel: prevLabel,
    currentGradeLabel: currLabel,
    gradeChangeStatus: gradeChangeStatus,
    previousConfidence: prevConf,
    currentConfidence: currConf,
    confidenceDelta: confidenceDelta,
    visualAcuity: {
      rightEye: vaRightChange,
      leftEye: vaLeftChange
    },
    iop: {
      rightEye: { previous: previous.visualExam?.iopRight || 'N/A', current: current.visualExam?.iopRight || 'N/A' },
      leftEye: { previous: previous.visualExam?.iopLeft || 'N/A', current: current.visualExam?.iopLeft || 'N/A' }
    },
    categorizedFindings: {
      improved,
      worsened,
      stable,
      newlyDetected,
      resolved
    },
    clinicalProgressionSummary: progressionSummary
  };
}

// Initial Seed Data for Demo Multi-Tenant Doctors
export const INITIAL_SEED_PATIENTS: Patient[] = [
  {
    id: 'PAT-2026-081',
    doctorId: 'doc_sarah_rao_vitreo_01',
    name: 'Ramesh Patel',
    age: 58,
    sex: 'Male',
    phone: '+91 98234 11209',
    address: '42 Lotus Colony, Sector 14, Mumbai',
    occupation: 'Senior Accountant',
    dateOfRegistration: '2026-08-10',
    clinicalVitals: {
      diabetesType: 'Type 2',
      yearOfDiagnosis: 2015,
      diabetesManagement: 'Combination (Oral + Insulin)',
      medicationDetails: 'Metformin 1000mg BD, Glimepiride 2mg OD, Lantus 14 IU at bedtime',
      bloodGlucose: {
        fastingMgDl: 168,
        postPrandialMgDl: 245,
        hba1cPercent: 8.9
      }
    },
    history: {
      otherSymptoms: ['Blurriness in right eye', 'Occasional floaters when reading'],
      medicalHistory: ['Hypertension (10 yrs)', 'Dyslipidemia'],
      lifestyle: 'Sedentary, Non-smoker, Low physical activity',
      familyHistory: 'Maternal grandfather had type 2 diabetes with visual impairment'
    },
    screenings: [
      {
        id: 'SCR-2026-901',
        visitNumber: 1,
        date: '2026-08-10',
        doctorId: 'doc_sarah_rao_vitreo_01',
        doctorName: 'Dr. Sarah Rao, MD',
        visualExam: {
          vaRight: '6/18',
          vaLeft: '6/9',
          iopRight: '16 mmHg',
          iopLeft: '15 mmHg',
          notes: 'Right fundus shows multiple blot hemorrhages and cotton wool spots near temporal arcade.'
        },
        checkM3Setup: true,
        aiResults: {
          grade: 2,
          gradeLabel: 'Moderate Non-Proliferative Diabetic Retinopathy',
          confidence: 92.4,
          referable: true,
          m3Executed: true,
          executionTimeSec: 0.12,
          engine: 'python_cv_engine',
          images: {
            originalUrl: '/samples/sample_2_severe_dr.png',
            enhancedUrl: '/scans/test_sess_01_m1_enhanced.png',
            heatmapUrl: '/scans/test_sess_01_m4_heatmap.png',
            lesionMaskUrl: '/scans/test_sess_01_m3_lesion_mask.png'
          }
        },
        clinicalNotes: 'Screening confirmed Moderate NPDR in right eye with significant macular threat. Advised strict glycemic control and repeat optical coherence tomography (OCT).',
        recommendation: 'Refer to Vitreoretinal Clinic for macular OCT & possible focal laser / anti-VEGF therapy.',
        followUpInterval: '3 Months',
        healthMeasures: getHealthMeasuresForGrade(2),
        treatmentReview: getClinicianTreatmentReview(2, true),
        finalized: true,
        createdAt: '2026-08-10T11:30:00Z'
      }
    ],
    createdAt: '2026-08-10T11:00:00Z',
    updatedAt: '2026-08-10T12:00:00Z'
  },
  {
    id: 'PAT-2026-104',
    doctorId: 'doc_sarah_rao_vitreo_01',
    name: 'Ananya Deshmukh',
    age: 44,
    sex: 'Female',
    phone: '+91 97410 88321',
    address: 'Flat 302, Green Meadows, Pune',
    occupation: 'High School Teacher',
    dateOfRegistration: '2026-09-02',
    clinicalVitals: {
      diabetesType: 'Type 2',
      yearOfDiagnosis: 2021,
      diabetesManagement: 'Oral Medication',
      medicationDetails: 'Metformin 500mg BD',
      bloodGlucose: {
        fastingMgDl: 118,
        postPrandialMgDl: 154,
        hba1cPercent: 6.7
      }
    },
    history: {
      otherSymptoms: ['None reported, asymptomatic screening'],
      medicalHistory: ['No known chronic illnesses'],
      lifestyle: 'Active daily walks (45 mins), Vegetarian diet',
      familyHistory: 'Father diagnosed with Type 2 Diabetes at age 52'
    },
    screenings: [
      {
        id: 'SCR-2026-942',
        visitNumber: 1,
        date: '2026-09-02',
        doctorId: 'doc_sarah_rao_vitreo_01',
        doctorName: 'Dr. Sarah Rao, MD',
        visualExam: {
          vaRight: '6/6',
          vaLeft: '6/6',
          iopRight: '14 mmHg',
          iopLeft: '14 mmHg',
          notes: 'Clear media, normal optic disc cupping 0.3, sharp foveal reflex.'
        },
        checkM3Setup: true,
        aiResults: {
          grade: 0,
          gradeLabel: 'No Apparent Diabetic Retinopathy',
          confidence: 96.8,
          referable: false,
          m3Executed: true,
          executionTimeSec: 0.09,
          engine: 'python_cv_engine',
          images: {
            originalUrl: '/samples/sample_0_normal_fundus.png',
            enhancedUrl: '/scans/test_sess_02_m1_enhanced.png',
            heatmapUrl: '/scans/test_sess_02_m4_heatmap.png',
            lesionMaskUrl: null
          }
        },
        clinicalNotes: 'Fundus examination revealed healthy retina bilaterally. No microaneurysms, hemorrhages or macular edema noted. Maintain current diet and physical exercise regimen.',
        recommendation: 'Routine annual diabetic retinopathy screening.',
        followUpInterval: '12 Months',
        healthMeasures: getHealthMeasuresForGrade(0),
        treatmentReview: getClinicianTreatmentReview(0, false),
        finalized: true,
        createdAt: '2026-09-02T14:15:00Z'
      }
    ],
    createdAt: '2026-09-02T14:00:00Z',
    updatedAt: '2026-09-02T14:30:00Z'
  },
  {
    id: 'PAT-2026-219',
    doctorId: 'doc_marcus_vance_rural_02',
    name: 'Balwant Singh',
    age: 63,
    sex: 'Male',
    phone: '+91 94192 44321',
    address: 'Village Kalan, Tehsil Chheharta, Amritsar Rural',
    occupation: 'Agricultural Supervisor',
    dateOfRegistration: '2026-09-05',
    clinicalVitals: {
      diabetesType: 'Type 2',
      yearOfDiagnosis: 2011,
      diabetesManagement: 'Oral Medication',
      medicationDetails: 'Glibenclamide 5mg OD, Metformin 500mg BD',
      bloodGlucose: {
        fastingMgDl: 195,
        postPrandialMgDl: 280,
        hba1cPercent: 9.4
      }
    },
    history: {
      otherSymptoms: ['Severe dimness of vision in left eye', 'Sudden floaters shower 2 weeks ago'],
      medicalHistory: ['Hypertension', 'Peripheral Neuropathy'],
      lifestyle: 'Occasional hookah smoking, heavy manual work',
      familyHistory: 'Strong familial diabetes'
    },
    screenings: [
      {
        id: 'SCR-2026-955',
        visitNumber: 1,
        date: '2026-09-05',
        doctorId: 'doc_marcus_vance_rural_02',
        doctorName: 'Dr. Marcus Vance, DO',
        visualExam: {
          vaRight: '6/12',
          vaLeft: '3/60',
          iopRight: '18 mmHg',
          iopLeft: '21 mmHg',
          notes: 'Preretinal hemorrhage and neovascularization visible near disc.'
        },
        checkM3Setup: true,
        aiResults: {
          grade: 3,
          gradeLabel: 'Severe Non-Proliferative Diabetic Retinopathy',
          confidence: 93.5,
          referable: true,
          m3Executed: true,
          executionTimeSec: 0.14,
          engine: 'python_cv_engine',
          images: {
            originalUrl: '/samples/sample_2_severe_dr.png',
            enhancedUrl: '/scans/test_sess_01_m1_enhanced.png',
            heatmapUrl: '/scans/test_sess_01_m4_heatmap.png',
            lesionMaskUrl: '/scans/test_sess_01_m3_lesion_mask.png'
          }
        },
        clinicalNotes: 'High risk PDR warning. Immediate referral to tertiary eye center for Pan-Retinal Photocoagulation (PRP) and intravitreal anti-VEGF.',
        recommendation: 'URGENT: Tertiary ophthalmic center referral for PRP laser within 48-72 hours.',
        followUpInterval: 'Immediate / 1 Week',
        healthMeasures: getHealthMeasuresForGrade(3),
        treatmentReview: getClinicianTreatmentReview(3, true),
        finalized: true,
        createdAt: '2026-09-05T09:45:00Z'
      }
    ],
    createdAt: '2026-09-05T09:00:00Z',
    updatedAt: '2026-09-05T10:15:00Z'
  }
];

let memoryStore: Patient[] = [];

function getLocalStore(): Patient[] {
  if (typeof window === 'undefined') {
    if (memoryStore.length === 0) {
      memoryStore = JSON.parse(JSON.stringify(INITIAL_SEED_PATIENTS));
    }
    return memoryStore;
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_PATIENTS));
    return INITIAL_SEED_PATIENTS;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_SEED_PATIENTS;
  }
}

function saveLocalStore(patients: Patient[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  } else {
    memoryStore = patients;
  }
}

export const PatientService = {
  // Get all patients strictly filtered by doctorId (MULTI-TENANT ISOLATION)
  async getPatientsByDoctor(doctorId: string): Promise<Patient[]> {
    try {
      if (typeof window !== 'undefined' && navigator.onLine) {
        const patientsRef = collection(db, 'patients');
        const q = query(patientsRef, where('doctorId', '==', doctorId));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const list: Patient[] = [];
          snapshot.forEach(docSnap => list.push(docSnap.data() as Patient));
          return list;
        }
      }
    } catch (e) {
      console.warn("Firestore online fetch bypassed, using local offline cache:", e);
    }
    
    // Fallback to local persistent cache
    const all = getLocalStore();
    return all.filter(p => p.doctorId === doctorId);
  },

  async getPatientById(id: string, doctorId: string): Promise<Patient | null> {
    const patients = await this.getPatientsByDoctor(doctorId);
    return patients.find(p => p.id === id) || null;
  },

  async savePatient(patient: Patient): Promise<Patient> {
    const all = getLocalStore();
    const index = all.findIndex(p => p.id === patient.id);
    
    if (index >= 0) {
      all[index] = { ...patient, updatedAt: new Date().toISOString() };
    } else {
      all.unshift({ ...patient, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    saveLocalStore(all);

    try {
      if (typeof window !== 'undefined') {
        const docRef = doc(db, 'patients', patient.id);
        await setDoc(docRef, patient, { merge: true });
      }
    } catch (e) {
      console.warn("Firestore sync queued in offline cache:", e);
    }

    return patient;
  },

  /**
   * Add a new screening session to a patient record.
   * Preserves historical screenings immutably.
   * Automatically computes visit number and runs comparison engine if previous screening exists.
   */
  async addScreeningSession(patientId: string, doctorId: string, session: ScreeningSession): Promise<Patient | null> {
    const all = getLocalStore();
    const patientIndex = all.findIndex(p => p.id === patientId && p.doctorId === doctorId);
    if (patientIndex === -1) return null;

    const patient = all[patientIndex];
    if (!patient.screenings) patient.screenings = [];

    // Assign visit number
    const existingCount = patient.screenings.length;
    session.visitNumber = existingCount + 1;

    // Attach health supportive measures and treatment review if not already set
    if (!session.healthMeasures) {
      session.healthMeasures = getHealthMeasuresForGrade(session.aiResults?.grade ?? 0);
    }
    if (!session.treatmentReview) {
      session.treatmentReview = getClinicianTreatmentReview(
        session.aiResults?.grade ?? 0,
        Boolean(session.aiResults?.referable)
      );
    }
    if (!session.relevantMedications) {
      session.relevantMedications = getOfficialMedicationsGuidance(
        session.aiResults?.grade ?? 0,
        Boolean(session.aiResults?.referable),
        patient.clinicalVitals
      );
    }

    // If there is an immediately previous screening, run the Comparison Engine
    if (existingCount > 0) {
      const immediatePrevious = patient.screenings[0]; // Most recent previous screening
      session.comparisonReport = compareScreenings(immediatePrevious, session);
    } else {
      session.comparisonReport = null; // First visit: no comparison report
    }

    // Unshift to preserve newest first, but all history is preserved!
    patient.screenings.unshift(session);
    patient.updatedAt = new Date().toISOString();

    all[patientIndex] = patient;
    saveLocalStore(all);

    try {
      if (typeof window !== 'undefined') {
        const docRef = doc(db, 'patients', patient.id);
        await updateDoc(docRef, {
          screenings: patient.screenings,
          updatedAt: patient.updatedAt
        });
      }
    } catch (e) {
      console.warn("Firestore screening update cached locally:", e);
    }

    return patient;
  },

  async updateScreeningNotes(
    patientId: string, 
    screeningId: string, 
    doctorId: string, 
    newNotes: string, 
    recommendation: string, 
    followUp: string
  ): Promise<Patient | null> {
    const all = getLocalStore();
    const patientIndex = all.findIndex(p => p.id === patientId && p.doctorId === doctorId);
    if (patientIndex === -1) return null;

    const patient = all[patientIndex];
    const scrIndex = patient.screenings.findIndex(s => s.id === screeningId);
    if (scrIndex === -1) return null;

    patient.screenings[scrIndex].clinicalNotes = newNotes;
    patient.screenings[scrIndex].recommendation = recommendation;
    patient.screenings[scrIndex].followUpInterval = followUp;
    patient.screenings[scrIndex].finalized = true;
    patient.updatedAt = new Date().toISOString();

    all[patientIndex] = patient;
    saveLocalStore(all);

    try {
      if (typeof window !== 'undefined') {
        const docRef = doc(db, 'patients', patient.id);
        await updateDoc(docRef, {
          screenings: patient.screenings,
          updatedAt: patient.updatedAt
        });
      }
    } catch (e) {
      console.warn("Firestore notes update cached locally:", e);
    }

    return patient;
  },

  // Export comparison engine directly for UI preview or re-calculation
  compareScreenings
};
