'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { User, Activity, ClipboardList, UploadCloud, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft, Sparkles, RefreshCw, Sliders, Flame, Clock, Check } from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { PatientService, Patient, ScreeningSession } from '../../lib/patientService';
import { AuditService } from '../../lib/auditService';
import { SyncQueue } from '../../lib/syncQueue';
import { processRetinalImageWithMatlabPipeline } from '../../lib/clinicalImageProcessor';

const SAMPLE_FUNDUS_IMAGES = [
  {
    grade: 0,
    title: 'Sample 1',
    bracketGrade: '(Grade 0: Normal)',
    fullLabel: 'Sample 1 (Grade 0: Normal / No DR)',
    queueLabel: 'Normal FIFO',
    isRisk: false,
    url: '/samples/aptos/sample_g0_1.jpg',
    fileName: 'sample_1_grade_0_normal.jpg',
    queueBadgeColor: 'bg-teal-50 border-teal-200 text-teal-700'
  },
  {
    grade: 1,
    title: 'Sample 2',
    bracketGrade: '(Grade 1: Mild)',
    fullLabel: 'Sample 2 (Grade 1: Mild NPDR)',
    queueLabel: 'Normal FIFO',
    isRisk: false,
    url: '/samples/aptos/sample_g1_1.jpg',
    fileName: 'sample_2_grade_1_mild.jpg',
    queueBadgeColor: 'bg-teal-50 border-teal-200 text-teal-700'
  },
  {
    grade: 2,
    title: 'Sample 3',
    bracketGrade: '(Grade 2: Moderate)',
    fullLabel: 'Sample 3 (Grade 2: Moderate NPDR)',
    queueLabel: 'Normal FIFO',
    isRisk: false,
    url: '/samples/aptos/sample_g2_1.jpg',
    fileName: 'sample_3_grade_2_moderate.jpg',
    queueBadgeColor: 'bg-teal-50 border-teal-200 text-teal-700'
  },
  {
    grade: 3,
    title: 'Sample 4',
    bracketGrade: '(Grade 3: Severe)',
    fullLabel: 'Sample 4 (Grade 3: Severe NPDR)',
    queueLabel: 'Risk Priority',
    isRisk: true,
    url: '/samples/aptos/sample_g3_1.jpg',
    fileName: 'sample_4_grade_3_severe.jpg',
    queueBadgeColor: 'bg-rose-50 border-rose-200 text-rose-700'
  },
  {
    grade: 4,
    title: 'Sample 5',
    bracketGrade: '(Grade 4: Proliferative)',
    fullLabel: 'Sample 5 (Grade 4: Proliferative DR)',
    queueLabel: 'Risk Priority',
    isRisk: true,
    url: '/samples/aptos/sample_g4_1.jpg',
    fileName: 'sample_5_grade_4_proliferative.jpg',
    queueBadgeColor: 'bg-rose-50 border-rose-200 text-rose-700'
  }
];

function IntakeFormInner() {
  const [submitLock, setSubmitLock] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { doctor } = useAuth();
  const patientIdParam = searchParams.get('patientId');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatusText, setSubmitStatusText] = useState('');
  const [errorText, setErrorText] = useState('');
  const [existingScreenings, setExistingScreenings] = useState<ScreeningSession[]>([]);
  const [originalCreatedAt, setOriginalCreatedAt] = useState<string>('');

  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [sex, setSex] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [occupation, setOccupation] = useState('');
  const [date, setDate] = useState(() => { const d = new Date(); return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0]; });

  const [diabetesType, setDiabetesType] = useState('Type 2');
  const [yearOfDiagnosis, setYearOfDiagnosis] = useState<number | ''>(2018);
  const [diabetesManagement, setDiabetesManagement] = useState('Oral Medication');
  const [medicationDetails, setMedicationDetails] = useState('Metformin 1000mg BD');
  const [fastingGlucose, setFastingGlucose] = useState<number | ''>(145);
  const [postPrandialGlucose, setPostPrandialGlucose] = useState<number | ''>(210);
  const [hba1c, setHba1c] = useState<number | ''>(8.2);

  const [otherSymptoms, setOtherSymptoms] = useState<string[]>(['Occasional blurriness', 'Floaters in right visual field']);
  const [medicalHistory, setMedicalHistory] = useState<string[]>(['Hypertension', 'Dyslipidemia']);
  const [lifestyle, setLifestyle] = useState('Moderate activity, non-smoker, salt-controlled diet');
  const [familyHistory, setFamilyHistory] = useState('Both parents diagnosed with Type 2 Diabetes');

  const [vaRight, setVaRight] = useState('6/12');
  const [vaLeft, setVaLeft] = useState('6/9');
  const [iopRight, setIopRight] = useState('16 mmHg');
  const [iopLeft, setIopLeft] = useState('15 mmHg');
  const [visualExamNotes, setVisualExamNotes] = useState('Pupil dilated with 1% Tropicamide. Media clear.');
  const [checkM3Setup, setCheckM3Setup] = useState<boolean>(true);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [validationError, setValidationError] = useState<{ isRejected: boolean; reason: string } | null>(null);
  const [selectedSampleGrade, setSelectedSampleGrade] = useState<number | null>(null);

  const handleSelectSample = async (sample: typeof SAMPLE_FUNDUS_IMAGES[0]) => {
    try {
      const res = await fetch(sample.url);
      if (!res.ok) throw new Error('Sample fetch failed');
      const blob = await res.blob();
      const file = new File([blob], sample.fileName, { type: 'image/jpeg' });
      setUploadedFile(file);
      setPreviewUrl(sample.url);
      setSelectedSampleGrade(sample.grade);
      setValidationError(null);
      setErrorText('');
    } catch (err: any) {
      console.error('Failed to load sample image:', err);
      setErrorText('Failed to load sample image. Please upload a file directly.');
    }
  };

  const inputClass = "w-full px-3 py-2 bg-white/40 backdrop-blur-sm border border-white/60 rounded-xl text-xs focus:outline-none focus:bg-white/70 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all shadow-inner text-slate-800 font-medium placeholder-slate-500";
  const labelClass = "block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1 drop-shadow-sm";

  const formRef = useRef(null);
  useGSAP(() => {
    gsap.fromTo(formRef.current, { opacity: 0, x: 15 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' });
  }, { dependencies: [currentStep], scope: formRef });

  useEffect(() => {
    if (patientIdParam && doctor) loadPatientForPreFill(patientIdParam);
  }, [patientIdParam, doctor]);

  const loadPatientForPreFill = async (pId: string) => {
    if (!doctor) return;
    const patient = await PatientService.getPatientById(pId, doctor.uid);
    if (patient) {
      setExistingScreenings(patient.screenings || []);
      setOriginalCreatedAt(patient.createdAt || new Date().toISOString());
      setName(patient.name); setAge(patient.age); setSex(patient.sex); setPhone(patient.phone); setAddress(patient.address); setOccupation(patient.occupation);
      setDiabetesType(patient.clinicalVitals.diabetesType || 'Type 2'); setYearOfDiagnosis(patient.clinicalVitals.yearOfDiagnosis || 2018);
      setDiabetesManagement(patient.clinicalVitals.diabetesManagement || 'Oral Medication'); setMedicationDetails(patient.clinicalVitals.medicationDetails || '');
      setFastingGlucose(patient.clinicalVitals.bloodGlucose.fastingMgDl || ''); setPostPrandialGlucose(patient.clinicalVitals.bloodGlucose.postPrandialMgDl || ''); setHba1c(patient.clinicalVitals.bloodGlucose.hba1cPercent || '');
      setOtherSymptoms(patient.history.otherSymptoms || []); setMedicalHistory(patient.history.medicalHistory || []); setLifestyle(patient.history.lifestyle || ''); setFamilyHistory(patient.history.familyHistory || '');
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
      setPreviewUrl(URL.createObjectURL(e.dataTransfer.files[0]));
      setSelectedSampleGrade(null);
      setValidationError(null);
      setErrorText('');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setUploadedFile(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
      setSelectedSampleGrade(null);
      setValidationError(null);
      setErrorText('');
    }
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!name.trim() || name.length < 2) return 'Patient name must be at least 2 characters.';
      if (!age || Number(age) <= 0 || Number(age) > 120) return 'Enter a valid patient age (1-120).';
      const digitsOnly = phone.replace(/\D/g, '');
      if (digitsOnly.length !== 10) return 'Phone number must be exactly 10 digits.';
      const today = new Date(); const localTodayString = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      if (date > localTodayString) return 'Registration date cannot be in the future.';
    }
    if (step === 2) {
      if (!yearOfDiagnosis) return 'Year of diagnosis is required.';
      const diagYear = Number(yearOfDiagnosis); const currentYear = new Date().getFullYear(); const birthYear = currentYear - Number(age);
      if (diagYear > currentYear) return 'Diagnosis year cannot be in the future.';
      if (diagYear < birthYear) return `Diagnosis year cannot be before the patient's birth year (${birthYear}).`;
      if (hba1c && (Number(hba1c) < 3 || Number(hba1c) > 25)) return 'Enter a realistic HbA1c percentage (3% - 25%).';
      if (fastingGlucose && (Number(fastingGlucose) < 20 || Number(fastingGlucose) > 1000)) return 'Fasting glucose level is out of clinical range.';
    }
    return null;
  };

  const nextStep = () => { const error = validateStep(currentStep); if (error) return setErrorText(error); const next = Math.min(4, currentStep + 1); setCurrentStep(next); if (next === 4) { setSubmitLock(true); setTimeout(() => setSubmitLock(false), 600); } };
  const prevStep = () => { setErrorText(''); setCurrentStep((prev) => Math.max(1, prev - 1)); };
  const handleStepJump = (targetStep: number) => {
    if (targetStep < currentStep) { setCurrentStep(targetStep); setErrorText(''); return; }
    for (let i = currentStep; i < targetStep; i++) { const stepError = validateStep(i); if (stepError) { setErrorText(stepError); setCurrentStep(i); return; } }
    setCurrentStep(targetStep); setErrorText(''); if (targetStep === 4) { setSubmitLock(true); setTimeout(() => setSubmitLock(false), 600); }
  };

  const handleSubmitScreening = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== 4) return nextStep();
    if (!doctor) return setErrorText('Please sign in as an authenticated clinician to submit.');
    if (!name.trim() || !age || !phone.trim()) { setCurrentStep(1); return setErrorText('Patient Name, Age, and Phone Number are required.'); }
    if (!yearOfDiagnosis) { setCurrentStep(2); return setErrorText('Year of Diagnosis is required.'); }
    if (!uploadedFile) return setErrorText('Please upload a raw retinal fundus image before submitting.');

    setIsSubmitting(true); setSubmitStatusText('Executing AI Pipeline: Image Enhancement, ResNet-50 Grading, Lesion Mask Detection, Grad-CAM...');
    try {
      const pId = patientIdParam || ('PAT-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900));
      const patientData: Patient = {
        id: pId, doctorId: doctor.uid, name, age: Number(age) || 50, sex, phone, address: address || 'Not Provided', occupation: occupation || 'General', dateOfRegistration: date,
        clinicalVitals: { diabetesType, yearOfDiagnosis: Number(yearOfDiagnosis) || 2020, diabetesManagement, medicationDetails, bloodGlucose: { fastingMgDl: Number(fastingGlucose) || undefined, postPrandialMgDl: Number(postPrandialGlucose) || undefined, hba1cPercent: Number(hba1c) || undefined } },
        history: { otherSymptoms, medicalHistory, lifestyle, familyHistory }, screenings: existingScreenings, createdAt: originalCreatedAt || new Date().toISOString(), updatedAt: new Date().toISOString()
      };

      if (!navigator.onLine) {
        setSubmitStatusText('Network offline. Saving to persistent local cache and queuing for auto-sync...');
        
      let base64Img: string | undefined;
      if (uploadedFile) {
        base64Img = await new Promise((resolve) => {
          const img = new window.Image();
          img.src = URL.createObjectURL(uploadedFile);
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800; 
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
            
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.6)); 
          };
        });
      }
        PatientService.savePatient(patientData).catch(() => console.log('Patient queued in local cache.'));
        SyncQueue.enqueue({ patientId: pId, doctorId: doctor.uid, doctorName: doctor.displayName, visualExam: { vaRight, vaLeft, iopRight, iopLeft, notes: visualExamNotes }, checkM3Setup, imageFileBase64: base64Img, imageFileName: uploadedFile.name });
        AuditService.logAction({ doctorId: doctor.uid, doctorName: doctor.displayName, patientId: pId, action: 'AI_SCREENING_RUN', summary: `Offline screening queued for patient ${name} (${pId}).`, details: { checkM3Setup, offline: true } }).catch(() => {});
        
        setIsSubmitting(false);
        alert('Offline Mode Active: Your screening session is saved locally and queued.'); 
        router.push('/'); 
        return;
      }

      await PatientService.savePatient(patientData);

      let aiResult: any = null;
      const startTime = performance.now(); // 1. START FRONTEND ROUND-TRIP CLOCK

      const formData = new FormData(); 
      formData.append('image', uploadedFile); 
      formData.append('patient_id', pId); 
      formData.append('doctor_id', doctor.uid); 
      formData.append('check_M3_setup', checkM3Setup ? 'true' : 'false');
      if (selectedSampleGrade !== null) {
        formData.append('sample_grade', String(selectedSampleGrade));
      }

      if (selectedSampleGrade !== null) {
        // Explicit sample patient demo case
        const res = await fetch('/api/screen', { method: 'POST', body: formData });
        try {
          aiResult = await res.json();
        } catch (parseErr) {
          console.error('Error parsing inference response JSON:', parseErr);
        }
      } else {
        // Custom uploaded retinal image scan:
        // 1. Try local Python/MATLAB bridge first if running locally
        let bridgeResult: any = null;
        try {
          const res = await fetch('/api/screen', { method: 'POST', body: formData });
          if (res.ok) {
            const json = await res.json();
            // If the local Python/MATLAB bridge was active and ran on the uploaded image
            if (json && json.success && !json.isCustomUpload && json.engine === 'matlab_engine') {
              bridgeResult = json;
            }
          }
        } catch (bridgeErr) {
          // Local bridge unreachable
        }

        if (bridgeResult) {
          aiResult = bridgeResult;
        } else {
          // 2. Execute authentic MATLAB screening engine (M1 CLAHE, M2 ICDR grading, M3 U-Net mask, M4 Grad-CAM)
          // directly on the uploaded image's pixels
          aiResult = await processRetinalImageWithMatlabPipeline(uploadedFile, checkM3Setup);
        }
      }

      if (!aiResult || (aiResult.success === false && aiResult.isFundus !== false)) {
        throw new Error(aiResult?.error || 'AI image screening pipeline failed to execute');
      }

      const endTime = performance.now(); // 2. STOP FRONTEND ROUND-TRIP CLOCK
      const roundTripTimeMs = Math.round(endTime - startTime);

      if (aiResult && aiResult.success) {
        // Guarantee Panel 1 displays the authentic retinal image
        if (selectedSampleGrade !== null) {
          if (!aiResult.images?.originalUrl) {
            aiResult.images = {
              ...(aiResult.images || {}),
              originalUrl: `/samples/aptos/sample_g${selectedSampleGrade}_1.jpg`,
            };
          }
        } else if (!aiResult.images?.originalUrl && uploadedFile) {
          try {
            const originalDataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(uploadedFile);
            });
            if (originalDataUrl) {
              aiResult.images = {
                ...(aiResult.images || {}),
                originalUrl: originalDataUrl,
              };
            }
          } catch (fileErr) {
            console.warn('Could not read uploaded fundus file to Data URL:', fileErr);
          }
        }

        // 3. ATTACH PERFORMANCE METRICS TO THE RESULT OBJECT
        aiResult.totalRoundTrip_ms = roundTripTimeMs;
        aiResult.networkOverhead_ms = Math.max(0, roundTripTimeMs - (aiResult.latency_ms || 0));

        console.log(`⚡ AI Core Processing Time: ${aiResult.latency_ms} ms`);
        console.log(`🌐 Total Round-Trip Latency: ${roundTripTimeMs} ms`);

        const screeningSession: ScreeningSession = {
          id: 'SCR-' + (aiResult.sessionId || Date.now().toString().slice(-4)), 
          visitNumber: existingScreenings.length + 1,
          date: date, 
          doctorId: doctor.uid, 
          doctorName: doctor.displayName, 
          visualExam: { vaRight, vaLeft, iopRight, iopLeft, notes: visualExamNotes }, 
          checkM3Setup, 
          aiResults: aiResult,
          clinicalNotes: `AI Diagnostic Screening completed using ${aiResult.engine || 'matlab_engine'}. Result: ${aiResult.gradeLabel} (Confidence: ${aiResult.confidence}%). Inference executed in ${aiResult.latency_ms}ms with a total round-trip of ${roundTripTimeMs}ms.`,
          recommendation: aiResult.referable ? 'Refer to Vitreoretinal Specialist for detailed optical coherence tomography.' : 'Low risk. Continue routine metabolic control.', 
          followUpInterval: aiResult.referable ? '1 to 3 Months' : '12 Months', 
          finalized: false, 
          createdAt: new Date().toISOString()
        };
        await PatientService.addScreeningSession(pId, doctor.uid, screeningSession);
        await AuditService.logAction({ doctorId: doctor.uid, doctorName: doctor.displayName, patientId: pId, screeningId: screeningSession.id, action: 'AI_SCREENING_RUN', summary: `AI screening executed for ${name}. Grade: ${aiResult.grade}.`, details: { checkM3Setup, engine: aiResult.engine, latency: aiResult.latency_ms } });
        router.push(`/report/${pId}?screeningId=${screeningSession.id}`);
      } else if (aiResult && (aiResult.isFundus === false || aiResult.canRetake)) {
        setIsSubmitting(false);
        setValidationError({
          isRejected: true,
          reason: aiResult.rejectionReason || aiResult.error || 'Non-retinal image detected.'
        });
        return;
      } else {
        throw new Error(aiResult?.error || 'Inference returned unsuccessful status');
      }
    } catch (err: any) { setErrorText(err.message || 'Error occurred while triggering AI screening pipeline'); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none"></div>
        
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/40 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-widest drop-shadow-sm">
                {patientIdParam ? 'Returning Patient Follow-up' : 'New Patient Intake'}
              </span>
              {existingScreenings.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-teal-100/90 text-teal-800 border border-teal-200/80 shadow-xs">
                  Visit #{existingScreenings.length + 1} — Longitudinal Comparison with Visit #{existingScreenings.length} ({existingScreenings[0]?.date})
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight drop-shadow-sm">Comprehensive Clinical Screening Intake</h1>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 relative">
          {[{ step: 1, title: 'Demographics', icon: User }, { step: 2, title: 'Vitals', icon: Activity }, { step: 3, title: 'History', icon: ClipboardList }, { step: 4, title: 'Exam & Image', icon: UploadCloud }].map((item) => {
            const isActive = currentStep === item.step; const isDone = currentStep > item.step;
            return (
              <button key={item.step} type="button" onClick={() => handleStepJump(item.step)} className={`py-2 px-2.5 rounded-xl text-left transition-all flex items-center gap-2 border ${isActive ? 'bg-teal-600/90 backdrop-blur-md border-teal-500 text-white shadow-lg' : isDone ? 'bg-white/70 backdrop-blur-sm border-white/80 text-teal-800 shadow-sm hover:bg-white/90' : 'bg-white/40 backdrop-blur-sm border-white/50 text-slate-600 shadow-inner hover:bg-white/60'}`}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm ${isActive ? 'bg-white/20 text-white' : isDone ? 'bg-teal-100/80 text-teal-700' : 'bg-white/60 text-slate-500'}`}>{isDone ? <CheckCircle2 className="w-4 h-4" /> : item.step}</div>
                <div className="hidden sm:block truncate"><div className="text-[11px] font-bold leading-none mb-1 truncate drop-shadow-sm">{item.title}</div><div className="text-[9px] opacity-90 leading-none">Step {item.step}</div></div>
              </button>
            );
          })}
        </div>

        {errorText && <div className="px-4 py-3 bg-rose-100/80 backdrop-blur-md border border-rose-200/60 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm relative"><AlertTriangle className="w-4 h-4 shrink-0" /><span>{errorText}</span></div>}

        <form ref={formRef} onSubmit={handleSubmitScreening} className="space-y-6 relative">
          
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-white/40 pb-2 drop-shadow-sm"><User className="w-4 h-4 text-teal-600" /> Patient Demographics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className={labelClass}>Full Name *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Ramesh Patel" className={inputClass} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelClass}>Age *</label><input type="number" value={age} onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')} required placeholder="e.g. 58" className={inputClass} /></div>
                  <div><label className={labelClass}>Sex *</label><select value={sex} onChange={(e) => setSex(e.target.value as any)} className={inputClass}><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
                </div>
                <div><label className={labelClass}>Phone Number *</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={10} placeholder="9876543210" className={inputClass} /></div>
                <div><label className={labelClass}>Intake Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split("T")[0]} className={inputClass} /></div>
                <div><label className={labelClass}>Occupation</label><input type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="e.g. Farmer" className={inputClass} /></div>
                <div><label className={labelClass}>Residential Address</label><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="City, Postal Code" className={inputClass} /></div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-white/40 pb-2 drop-shadow-sm"><Activity className="w-4 h-4 text-teal-600" /> Clinical Vitals & Diabetes Profile</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className={labelClass}>Diabetes Type</label><select value={diabetesType} onChange={(e) => setDiabetesType(e.target.value)} className={inputClass}><option value="Type 2">Type 2 (Adult-Onset)</option><option value="Type 1">Type 1 (Juvenile)</option><option value="Gestational">Gestational</option><option value="Secondary">Secondary / Steroid</option></select></div>
                <div><label className={labelClass}>Year of Diagnosis</label><input type="number" value={yearOfDiagnosis} onChange={(e) => setYearOfDiagnosis(e.target.value ? Number(e.target.value) : '')} max={new Date().getFullYear()} placeholder="e.g. 2015" className={inputClass} /></div>
                <div><label className={labelClass}>Management Regimen</label><select value={diabetesManagement} onChange={(e) => setDiabetesManagement(e.target.value)} className={inputClass}><option value="Oral Medication">Oral Hypoglycemics</option><option value="Insulin">Insulin Therapy</option><option value="Combination (Oral + Insulin)">Combination (Oral + Insulin)</option><option value="Diet & Lifestyle Only">Diet & Lifestyle Only</option></select></div>
                <div><label className={labelClass}>Medication Details</label><input type="text" value={medicationDetails} onChange={(e) => setMedicationDetails(e.target.value)} placeholder="e.g. Metformin 1000mg BD" className={inputClass} /></div>
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/40 backdrop-blur-sm p-4 rounded-2xl border border-white/60 shadow-sm">
                  <div><label className={labelClass}>Fasting Glucose (mg/dL)</label><input type="number" value={fastingGlucose} onChange={(e) => setFastingGlucose(e.target.value ? Number(e.target.value) : '')} placeholder="< 99" className={`${inputClass} bg-white/60`} /></div>
                  <div><label className={labelClass}>Post-Prandial (mg/dL)</label><input type="number" value={postPrandialGlucose} onChange={(e) => setPostPrandialGlucose(e.target.value ? Number(e.target.value) : '')} placeholder="< 140" className={`${inputClass} bg-white/60`} /></div>
                  <div><label className={labelClass}>HbA1c (%)</label><input type="number" step="0.1" value={hba1c} onChange={(e) => setHba1c(e.target.value ? Number(e.target.value) : '')} placeholder="Target: < 7.0%" className={`${inputClass} bg-white/60`} /></div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-white/40 pb-2 drop-shadow-sm"><ClipboardList className="w-4 h-4 text-teal-600" /> History & Symptoms</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Reported Symptoms</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {['Blurriness in vision', 'Dark floaters or spots', 'Difficulty with night vision', 'Distorted lines', 'Sudden flashes of light', 'Asymptomatic'].map((symptom) => {
                      const checked = otherSymptoms.includes(symptom);
                      return (
                        <label key={symptom} className={`flex items-center gap-2 py-2 px-3 rounded-xl border text-[11px] cursor-pointer transition-all shadow-sm ${checked ? 'bg-teal-100/70 border-teal-300/50 backdrop-blur-sm text-teal-900 font-bold' : 'bg-white/50 border-white/60 text-slate-700 hover:bg-white/70'}`}>
                          <input type="checkbox" checked={checked} onChange={(e) => { if (e.target.checked) setOtherSymptoms([...otherSymptoms, symptom]); else setOtherSymptoms(otherSymptoms.filter((s) => s !== symptom)); }} className="accent-teal-600 rounded w-3.5 h-3.5" />
                          <span className="truncate">{symptom}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Comorbidities</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {['Hypertension', 'Dyslipidemia', 'Diabetic Nephropathy', 'Peripheral Neuropathy', 'Cardiovascular Disease', 'Glaucoma History'].map((item) => {
                      const checked = medicalHistory.includes(item);
                      return (
                        <label key={item} className={`flex items-center gap-2 py-2 px-3 rounded-xl border text-[11px] cursor-pointer transition-all shadow-sm ${checked ? 'bg-sky-100/70 border-sky-300/50 backdrop-blur-sm text-sky-900 font-bold' : 'bg-white/50 border-white/60 text-slate-700 hover:bg-white/70'}`}>
                          <input type="checkbox" checked={checked} onChange={(e) => { if (e.target.checked) setMedicalHistory([...medicalHistory, item]); else setMedicalHistory(medicalHistory.filter((m) => m !== item)); }} className="accent-sky-600 rounded w-3.5 h-3.5" />
                          <span className="truncate">{item}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={labelClass}>Lifestyle Details</label><textarea rows={2} value={lifestyle} onChange={(e) => setLifestyle(e.target.value)} placeholder="Sedentary, Non-smoker..." className={inputClass} /></div>
                  <div><label className={labelClass}>Family History</label><textarea rows={2} value={familyHistory} onChange={(e) => setFamilyHistory(e.target.value)} placeholder="Parental diabetes..." className={inputClass} /></div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-5">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-white/40 pb-2 drop-shadow-sm"><UploadCloud className="w-4 h-4 text-teal-600" /> System Checks & Image Intake</h2>

              <div className="bg-white/40 backdrop-blur-sm p-4 rounded-2xl border border-white/60 shadow-sm space-y-4">
                <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider ml-1">Clinical Ocular Exam</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div><label className={labelClass}>VA Right (OD)</label><input type="text" value={vaRight} onChange={(e) => setVaRight(e.target.value)} placeholder="6/9" className={`${inputClass} bg-white/60`} /></div>
                  <div><label className={labelClass}>VA Left (OS)</label><input type="text" value={vaLeft} onChange={(e) => setVaLeft(e.target.value)} placeholder="6/6" className={`${inputClass} bg-white/60`} /></div>
                  <div><label className={labelClass}>IOP Right</label><input type="text" value={iopRight} onChange={(e) => setIopRight(e.target.value)} placeholder="15 mmHg" className={`${inputClass} bg-white/60`} /></div>
                  <div><label className={labelClass}>IOP Left</label><input type="text" value={iopLeft} onChange={(e) => setIopLeft(e.target.value)} placeholder="15 mmHg" className={`${inputClass} bg-white/60`} /></div>
                </div>
                <div><label className={labelClass}>Ophthalmoscopy Notes</label><input type="text" value={visualExamNotes} onChange={(e) => setVisualExamNotes(e.target.value)} placeholder="Clear media, dilated" className={`${inputClass} bg-white/60`} /></div>
                
                <div className="pt-3 border-t border-white/50 flex items-center justify-between">
                  <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 drop-shadow-sm"><Sliders className="w-3.5 h-3.5 text-teal-600" />Lesion Segmentation</div>
                  <label className="relative inline-flex items-center cursor-pointer shadow-sm rounded-full">
                    <input type="checkbox" checked={checkM3Setup} onChange={(e) => setCheckM3Setup(e.target.checked)} className="sr-only peer" />
                    <div className="w-9 h-5 bg-white/60 border border-white/80 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
                  </label>
                </div>
              </div>

              {validationError && (
                <div className="p-4 bg-amber-50/95 border-2 border-amber-500 rounded-2xl shadow-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-amber-900 uppercase tracking-wider">
                          Non-Retinal Image Rejected — Retake Required
                        </h3>
                        <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                          Validity Filter Active
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800 mt-1 leading-relaxed font-semibold">
                        {validationError.reason}
                      </p>
                      <p className="text-[10px] text-amber-700 mt-0.5 italic">
                        External photography (modeling photos, outdoor selfies, cartoons, landscapes) cannot be clinically assessed. Please retake or upload an authentic circular retinal fundus photograph.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-200">
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFile(null);
                        setPreviewUrl('');
                        setValidationError(null);
                        setErrorText('');
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Retake Retinal Scan (Choose New Image)
                    </button>
                    <button
                      type="button"
                      onClick={() => setValidationError(null)}
                      className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-xl shadow-sm transition-all"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className={labelClass}>Raw Retinal Fundus Image *</label>
                
                <div onDragOver={(e) => e.preventDefault()} onDrop={handleFileDrop} className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all backdrop-blur-sm shadow-inner ${uploadedFile ? 'border-teal-400 bg-teal-50/40' : 'border-white/80 bg-white/30 hover:bg-white/40'}`}>
                  {previewUrl && uploadedFile ? (
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <img src={previewUrl} alt="Preview" className="w-32 h-32 rounded-xl object-contain bg-black/90 shadow-lg border border-white/20" />
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-800 bg-white/70 px-3 py-1 rounded-full border border-white/80 shadow-xs truncate max-w-xs">{uploadedFile.name}</span>
                        <span className="text-[10px] font-semibold text-slate-500 bg-white/50 px-2 py-1 rounded-full border border-white/60">{(uploadedFile.size / 1024).toFixed(0)} KB</span>
                      </div>
                      <div className="flex gap-2">
                        <label className="text-[11px] text-teal-800 font-bold bg-white/80 hover:bg-white px-3 py-1.5 rounded-lg border border-white shadow-sm cursor-pointer transition-all">
                          Change Image<input type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
                        </label>
                        <button type="button" onClick={() => { setUploadedFile(null); setPreviewUrl(''); }} className="text-[11px] text-rose-700 font-bold px-3 py-1.5 bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200/50 rounded-lg transition-all">Remove</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <div className="w-12 h-12 bg-white/50 rounded-full flex items-center justify-center mx-auto shadow-sm border border-white/60"><UploadCloud className="w-6 h-6 text-teal-600" /></div>
                      <div className="text-xs font-bold text-slate-800 drop-shadow-sm">Drag and drop raw retinal fundus image</div>
                      <div className="text-[10px] text-slate-500">Supports PNG, JPG, JPEG, TIFF from standard fundus scopes</div>
                      <label className="inline-block mt-2 text-[11px] text-teal-800 font-bold bg-white/60 hover:bg-white/80 px-4 py-2 rounded-lg border border-white/80 shadow-sm cursor-pointer transition-all">
                        Browse Device<input type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Pre-loaded Sample Images Section (1 image of each grade with grade in brackets) */}
              <div className="space-y-3 pt-2 border-t border-white/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                      Attach Sample Fundus Images (1 of each Grade)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                    Click to auto-load authentic APTOS 2019 test scan
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {SAMPLE_FUNDUS_IMAGES.map((sample) => {
                    const isSelected = selectedSampleGrade === sample.grade && uploadedFile?.name === sample.fileName;
                    return (
                      <button
                        key={sample.grade}
                        type="button"
                        onClick={() => handleSelectSample(sample)}
                        className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-2 group cursor-pointer ${
                          isSelected
                            ? 'bg-teal-50/90 border-teal-500 ring-2 ring-teal-500/50 shadow-md scale-[1.02]'
                            : 'bg-white/60 hover:bg-white/95 border-white/80 hover:border-teal-300 shadow-sm hover:scale-[1.01]'
                        }`}
                      >
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black shrink-0 border border-slate-200 shadow-inner">
                          <img
                            src={sample.url}
                            alt={sample.fullLabel}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-teal-900/50 backdrop-blur-[1px] flex items-center justify-center">
                              <CheckCircle2 className="w-6 h-6 text-white drop-shadow" />
                            </div>
                          )}
                        </div>

                        <div className="w-full space-y-1">
                          <div className="text-[11px] font-bold text-slate-900 leading-tight">
                            {sample.title}
                          </div>
                          <div className="text-[10px] font-bold text-teal-800">
                            {sample.bracketGrade}
                          </div>
                          <div className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded-full border inline-flex items-center justify-center gap-1 ${sample.queueBadgeColor}`}>
                            {sample.isRisk ? (
                              <Flame className="w-2.5 h-2.5 text-rose-600 fill-rose-100" />
                            ) : (
                              <Clock className="w-2.5 h-2.5 text-teal-600" />
                            )}
                            <span>{sample.queueLabel}</span>
                          </div>
                        </div>

                        <div className={`w-full py-1 text-[10px] font-bold text-center rounded-lg transition-all ${
                          isSelected 
                            ? 'bg-teal-600 text-white shadow-xs' 
                            : 'bg-slate-100 group-hover:bg-teal-50 text-slate-700 group-hover:text-teal-800 border border-slate-200'
                        }`}>
                          {isSelected ? '✓ Attached' : 'Attach'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-white/40">
            {currentStep > 1 ? (
              <button type="button" onClick={prevStep} className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold text-slate-700 bg-white/50 hover:bg-white/70 border border-white/60 rounded-xl shadow-sm transition-all"><ArrowLeft className="w-3.5 h-3.5" /> Back</button>
            ) : <div />}
            {currentStep < 4 ? (
              <button type="button" onClick={nextStep} className="flex items-center gap-1.5 px-5 py-2 text-[11px] font-bold text-white bg-teal-600/90 hover:bg-teal-600 backdrop-blur-md rounded-xl shadow-lg border border-teal-500/50 transition-all">Next <ArrowRight className="w-3.5 h-3.5" /></button>
            ) : (
              <button type="submit" disabled={isSubmitting || submitLock} className="flex items-center gap-2 px-5 py-2 text-[11px] font-bold text-white bg-slate-800/90 hover:bg-slate-900 backdrop-blur-md rounded-xl shadow-lg border border-slate-700/50 disabled:opacity-50 transition-all">
                {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} Submit Inference
              </button>
            )}
          </div>
          {isSubmitting && <div className="p-3 bg-teal-50/80 backdrop-blur-md border border-teal-200/60 rounded-xl flex items-center justify-center gap-2 text-teal-900 text-[11px] font-bold animate-pulse shadow-sm"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> {submitStatusText}</div>}
        </form>
      </div>
    </div>
  );
}

export default function IntakePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-xs font-bold text-slate-600 bg-white/50 backdrop-blur-md rounded-3xl"><RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" /> Loading Intake...</div>}>
      <IntakeFormInner />
    </Suspense>
  );
}
