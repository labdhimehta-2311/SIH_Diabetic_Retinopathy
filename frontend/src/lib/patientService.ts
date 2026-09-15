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

export interface ScreeningSession {
  id: string;
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
            originalUrl: '/api/samples/sample_2_severe_dr.png',
            enhancedUrl: '/api/files/test_sess_01_m1_enhanced.png',
            heatmapUrl: '/api/files/test_sess_01_m4_heatmap.png',
            lesionMaskUrl: '/api/files/test_sess_01_m3_lesion_mask.png'
          }
        },
        clinicalNotes: 'Screening confirmed Moderate NPDR in right eye with significant macular threat. Advised strict glycemic control and repeat optical coherence tomography (OCT).',
        recommendation: 'Refer to Vitreoretinal Clinic for macular OCT & possible focal laser / anti-VEGF therapy.',
        followUpInterval: '3 Months',
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
            originalUrl: '/api/samples/sample_0_normal_fundus.png',
            enhancedUrl: '/api/files/test_sess_02_m1_enhanced.png',
            heatmapUrl: '/api/files/test_sess_02_m4_heatmap.png',
            lesionMaskUrl: null
          }
        },
        clinicalNotes: 'Fundus examination revealed healthy retina bilaterally. No microaneurysms, hemorrhages or macular edema noted. Maintain current diet and physical exercise regimen.',
        recommendation: 'Routine annual diabetic retinopathy screening.',
        followUpInterval: '12 Months',
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
            originalUrl: '/api/samples/sample_2_severe_dr.png',
            enhancedUrl: '/api/files/test_sess_01_m1_enhanced.png',
            heatmapUrl: '/api/files/test_sess_01_m4_heatmap.png',
            lesionMaskUrl: '/api/files/test_sess_01_m3_lesion_mask.png'
          }
        },
        clinicalNotes: 'High risk PDR warning. Immediate referral to tertiary eye center for Pan-Retinal Photocoagulation (PRP) and intravitreal anti-VEGF.',
        recommendation: 'URGENT: Tertiary ophthalmic center referral for PRP laser within 48-72 hours.',
        followUpInterval: 'Immediate / 1 Week',
        finalized: true,
        createdAt: '2026-09-05T09:45:00Z'
      }
    ],
    createdAt: '2026-09-05T09:00:00Z',
    updatedAt: '2026-09-05T10:15:00Z'
  }
];

function getLocalStore(): Patient[] {
  if (typeof window === 'undefined') return INITIAL_SEED_PATIENTS;
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

  async addScreeningSession(patientId: string, doctorId: string, session: ScreeningSession): Promise<Patient | null> {
    const all = getLocalStore();
    const patientIndex = all.findIndex(p => p.id === patientId && p.doctorId === doctorId);
    if (patientIndex === -1) return null;

    const patient = all[patientIndex];
    if (!patient.screenings) patient.screenings = [];
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
  }
};
