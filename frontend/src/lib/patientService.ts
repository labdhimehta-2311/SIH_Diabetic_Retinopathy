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
