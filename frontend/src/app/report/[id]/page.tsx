'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Printer, ArrowLeft, Save, CheckCircle2, ShieldCheck, 
  Stethoscope, AlertTriangle, Eye, RefreshCw, Edit3,
  TrendingDown, TrendingUp, Minus, Activity, Heart, 
  Pill, BookOpen, Clock, Calendar, CheckCircle
} from 'lucide-react';
import { useAuth } from '../../../lib/authContext';
import { 
  PatientService, 
  Patient, 
  ScreeningSession, 
  getHealthMeasuresForGrade, 
  getClinicianTreatmentReview,
  getOfficialMedicationsGuidance,
  OfficialMedicationsGuidance
} from '../../../lib/patientService';
import { AuditService } from '../../../lib/auditService';
import ComparativeViewer from '../../../components/ComparativeViewer';
import AuditTrailModal from '../../../components/AuditTrailModal';

// Custom Print Badge to force smaller text and hide the Referable/Non-Referable box
const PrintGradeBadge = ({ grade }: { grade: number | string }) => {
  const g = Number(grade);
  let text = `Grade ${g}`;
  let color = 'text-slate-700 bg-slate-50 border-slate-200';
  let Icon = AlertTriangle;

  if (g === 0) { 
    text = 'Grade 0: Normal / No DR'; 
    color = 'text-emerald-700 bg-emerald-50 border-emerald-200 print:text-slate-900'; 
    Icon = CheckCircle2; 
  } else if (g === 1) { 
    text = 'Grade 1: Mild NPDR'; 
    color = 'text-amber-700 bg-amber-50 border-amber-200 print:text-slate-900'; 
  } else if (g === 2) { 
    text = 'Grade 2: Moderate NPDR'; 
    color = 'text-orange-700 bg-orange-50 border-orange-200 print:text-slate-900'; 
  } else if (g === 3) { 
    text = 'Grade 3: Severe NPDR'; 
    color = 'text-rose-700 bg-rose-50 border-rose-200 print:text-slate-900'; 
  } else if (g === 4) { 
    text = 'Grade 4: Proliferative DR'; 
    color = 'text-red-800 bg-red-100 border-red-300 print:text-slate-900'; 
  }

  return (
    <div className={`px-3 py-1 rounded-full border text-sm font-bold flex items-center gap-1.5 print:px-2 print:py-0.5 print:text-[8px] print:border-slate-400 print:bg-transparent ${color}`}>
      <Icon className="w-4 h-4 print:w-2.5 print:h-2.5" />
      {text}
    </div>
  );
};

// Safe and bulletproof route badge formatter (prevents overflowing or text slicing)
const getRouteBadgeLabel = (routeAndDosing: string) => {
  if (!routeAndDosing) return 'Clinical Rx';
  const lower = routeAndDosing.toLowerCase();
  if (lower.includes('implant')) return 'Intravitreal Implant';
  if (lower.includes('injection')) return 'Intravitreal Injection';
  if (lower.includes('topical')) return 'Topical Ophthalmic';
  if (lower.includes('oral')) return 'Oral Administration';
  const firstPart = routeAndDosing.split(':')[0].trim();
  return firstPart.length > 22 ? 'Prescription Rx' : firstPart;
};

function ReportContentInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { doctor } = useAuth();

  const patientId = params.id as string;
  const screeningIdParam = searchParams.get('screeningId');

  const [patient, setPatient] = useState<Patient | null>(null);
  const [screening, setScreening] = useState<ScreeningSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [notes, setNotes] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [followUpInterval, setFollowUpInterval] = useState('3 Months');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [showAuditModal, setShowAuditModal] = useState(false);

  useEffect(() => {
    if (patientId && doctor) loadReport();
  }, [patientId, doctor, screeningIdParam]);

  const loadReport = async () => {
    if (!doctor) return;
    setIsLoading(true);
    try {
      const p = await PatientService.getPatientById(patientId, doctor.uid);
      if (p) {
        setPatient(p);
        const scr = screeningIdParam 
          ? p.screenings?.find(s => s.id === screeningIdParam) || p.screenings?.[0]
          : p.screenings?.[0];
          
        if (scr) {
          // Ensure health measures and treatment review are populated
          if (!scr.healthMeasures) {
            scr.healthMeasures = getHealthMeasuresForGrade(scr.aiResults?.grade ?? 0);
          }
          if (!scr.treatmentReview) {
            scr.treatmentReview = getClinicianTreatmentReview(
              scr.aiResults?.grade ?? 0,
              Boolean(scr.aiResults?.referable)
            );
          }
          if (!scr.relevantMedications) {
            scr.relevantMedications = getOfficialMedicationsGuidance(
              scr.aiResults?.grade ?? 0,
              Boolean(scr.aiResults?.referable),
              p.clinicalVitals
            );
          }

          setScreening(scr);
          setNotes(scr.clinicalNotes || '');
          setRecommendation(scr.recommendation || '');
          setFollowUpInterval(scr.followUpInterval || '3 Months');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectScreening = (scrId: string) => {
    router.push(`/report/${patientId}?screeningId=${scrId}`);
  };

  const handleSaveChanges = async () => {
    if (!patient || !screening || !doctor) return;
    setIsSaving(true);
    setSaveSuccessMsg('');
    try {
      await PatientService.updateScreeningNotes(patient.id, screening.id, doctor.uid, notes, recommendation, followUpInterval);
      await AuditService.logAction({
        doctorId: doctor.uid,
        doctorName: doctor.displayName,
        patientId: patient.id,
        screeningId: screening.id,
        action: 'CLINICAL_NOTES_EDIT',
        summary: `Doctor ${doctor.displayName} amended clinical notes & recommendation.`,
        details: { previousNotes: screening.clinicalNotes, updatedNotes: notes, recommendation, followUpInterval }
      });
      setSaveSuccessMsg('Signed & Logged');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (e: any) {
      alert('Failed to save notes: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrintPDF = () => {
    if (doctor && patient && screening) {
      AuditService.logAction({
        doctorId: doctor.uid,
        doctorName: doctor.displayName,
        patientId: patient.id,
        screeningId: screening.id,
        action: 'REPORT_EXPORTED_PDF',
        summary: `Official A4 Diagnostic Report PDF exported/printed.`,
        details: { grade: screening.aiResults.grade }
      }).catch(console.error);
    }
    
    // Synchronous call to bypass Safari's print blocks
    window.print();
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 bg-slate-50 border border-slate-200">
        <RefreshCw className="w-6 h-6 text-slate-800 animate-spin mx-auto mb-2" />
        <p className="text-xs font-bold text-slate-600">Loading Clinical Record...</p>
      </div>
    );
  }

  if (!patient || !screening) {
    return (
      <div className="text-center py-20 bg-slate-50 border border-slate-200 space-y-3">
        <AlertTriangle className="w-8 h-8 text-slate-800 mx-auto" />
        <h2 className="text-sm font-bold text-slate-800">Record Not Found</h2>
        <Link href="/" className="inline-flex px-3 py-1.5 bg-slate-800 text-white text-[11px] font-bold">
          Return to Directory
        </Link>
      </div>
    );
  }

  const comparison = screening.comparisonReport;
  const healthMeasures = screening.healthMeasures || getHealthMeasuresForGrade(screening.aiResults?.grade ?? 0);
  const medicationsGuidance = screening.relevantMedications || getOfficialMedicationsGuidance(screening.aiResults?.grade ?? 0, Boolean(screening.aiResults?.referable), patient.clinicalVitals);
  const allScreenings = patient.screenings || [];

  return (
    <div className="max-w-5xl mx-auto space-y-4 print:p-0">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 8mm 8mm !important; size: A4 portrait; }
          html, body { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            background: white !important;
            font-size: 8.5pt !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
          }
          body,
          body > div,
          main,
          #__next {
            display: block !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
          }
          .no-print, nav, [role="navigation"] {
            display: none !important;
          }
          h1, h2, h3, h4, .print-break-after-avoid {
            break-after: avoid !important;
            page-break-after: avoid !important;
          }
          .print-break-before-page,
          .print\:break-before-page {
            break-before: page !important;
            page-break-before: always !important;
          }
          .print-break-inside-avoid,
          .print-avoid-break,
          .print-card,
          table,
          tr,
          td,
          th,
          img,
          figure {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}} />

      {/* Top Action Bar */}
      <div className="no-print flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-2.5 border border-slate-200 rounded">
        <Link href="/" className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-black">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
        </Link>

        {/* Screening / Visit Selector if multiple visits exist */}
        {allScreenings.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap flex items-center gap-1">
              <Calendar className="w-3 h-3 text-teal-600" /> Patient Visits:
            </span>
            <div className="flex gap-1">
              {allScreenings.map((s, idx) => {
                const isSelected = s.id === screening.id;
                const vNum = s.visitNumber || (allScreenings.length - idx);
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSelectScreening(s.id)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all whitespace-nowrap border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Visit #{vNum} ({s.date})
                    {s.comparisonReport && <span className="ml-1 text-[9px] opacity-75">• Comparison</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-2 self-end sm:self-auto items-center">
          <Link
            href={`/intake?patientId=${patient.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-all rounded shadow-xs"
            title="Retake retinal scan if image was low quality or non-retinal"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
            <span>Retake Retinal Scan</span>
          </Link>
          <button onClick={() => setShowAuditModal(true)} className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold bg-white border border-slate-300 hover:bg-slate-100 rounded">
            <ShieldCheck className="w-3.5 h-3.5" /> Audit Trail
          </button>
          <button onClick={handlePrintPDF} className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold bg-slate-900 text-white hover:bg-black transition-all rounded">
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Clinical Document */}
      <div className="bg-white border border-slate-300 p-6 sm:p-8 space-y-6 print:border-none print:p-0 print:space-y-3">
        
        {/* Letterhead */}
        <div className="print-break-inside-avoid border-b-2 border-slate-900 pb-3 flex justify-between items-end print:pb-2 print:mb-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                {doctor?.clinic || 'Clinical Retinal Tele-Screening'}
              </h1>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
                Diagnostic Deep Learning Assessment Report {screening.visitNumber ? `— Visit #${screening.visitNumber}` : ''}
              </p>
            </div>
          </div>
          <div className="text-right text-[10px] text-slate-600">
            <div className="font-bold text-slate-900 text-xs uppercase flex items-center justify-end gap-1">
              <Stethoscope className="w-3 h-3" /> {doctor?.displayName}
            </div>
            <div>{doctor?.role} | Lic: {doctor?.medicalLicense}</div>
            <div>Report Date: {screening.date}</div>
          </div>
        </div>

        {/* Tabular Patient Demographics */}
        <div className="print-break-inside-avoid border border-slate-900 text-xs print:text-[8.5px]">
          <div className="grid grid-cols-4 bg-slate-100 text-[9px] font-bold uppercase tracking-widest text-slate-600 border-b border-slate-900 print:text-[7px]">
            <div className="p-1.5 border-r border-slate-900">Patient Name</div>
            <div className="p-1.5 border-r border-slate-900">ID / Age / Sex</div>
            <div className="p-1.5 border-r border-slate-900">Contact</div>
            <div className="p-1.5">Screening Ref</div>
          </div>
          <div className="grid grid-cols-4 font-bold text-slate-900 border-b border-slate-900">
            <div className="p-1.5 border-r border-slate-900">{patient.name || 'N/A'}</div>
            <div className="p-1.5 border-r border-slate-900">{patient.id} ({patient.age}y / {patient.sex?.charAt(0) || 'U'})</div>
            <div className="p-1.5 border-r border-slate-900">{patient.phone || 'N/A'}</div>
            <div className="p-1.5 font-mono text-[10px] print:text-[8px]">
              {screening.id} {screening.visitNumber ? `(Visit #${screening.visitNumber})` : ''}
            </div>
          </div>
          <div className="grid grid-cols-4 bg-slate-100 text-[9px] font-bold uppercase tracking-widest text-slate-600 border-b border-slate-900 print:text-[7px]">
            <div className="p-1.5 border-r border-slate-900">Diabetes Profile</div>
            <div className="p-1.5 border-r border-slate-900">Current Regimen</div>
            <div className="p-1.5 border-r border-slate-900">Glycemic Status</div>
            <div className="p-1.5">Visual Acuity</div>
          </div>
          <div className="grid grid-cols-4 font-semibold text-slate-800">
            <div className="p-1.5 border-r border-slate-900">{patient.clinicalVitals.diabetesType} (Dx: {patient.clinicalVitals.yearOfDiagnosis})</div>
            <div className="p-1.5 border-r border-slate-900">{patient.clinicalVitals.diabetesManagement}</div>
            <div className="p-1.5 border-r border-slate-900">HbA1c: {patient.clinicalVitals.bloodGlucose.hba1cPercent || 'N/A'}% | F: {patient.clinicalVitals.bloodGlucose.fastingMgDl || 'N/A'}</div>
            <div className="p-1.5">OD: {screening.visualExam.vaRight} | OS: {screening.visualExam.vaLeft}</div>
          </div>
        </div>

        {/* Primary Inference Grading Alert Block */}
        <div className="print-break-inside-avoid border-2 border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 print:p-2.5 print:gap-1.5">
          <div className="flex-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 print:text-[7.5px]">Current Screening Diagnostic Grading</div>
            <div className="text-xl font-black text-slate-900 uppercase print:text-sm leading-tight">{screening.aiResults.gradeLabel}</div>
            <div className="text-[10px] text-slate-600 font-mono mt-1 print:text-[7.5px] print:mt-0.5">
              CONFIDENCE: <strong className="text-slate-900">{screening.aiResults.confidence}%</strong> | 
              ENGINE: {screening.aiResults.engine} ({screening.aiResults.executionTimeSec}s)
            </div>
          </div>
          <div className="shrink-0 mt-2 sm:mt-0">
            <PrintGradeBadge grade={screening.aiResults.grade} />
          </div>
        </div>

        {/* Visual Diagnostics Matrix */}
        <div className="print-break-inside-avoid print:block">
          <ComparativeViewer images={screening.aiResults.images} m3Executed={screening.checkM3Setup} />
        </div>

        {/* ================================================================ */}
        {/* FEATURE 2 & 6: LONGITUDINAL PROGRESS / COMPARISON REPORT         */}
        {/* Rendered when this visit is compared with an immediately previous completed screening */}
        {/* ================================================================ */}
        {comparison && (
          <div className="report-section print-break-inside-avoid border-2 border-slate-900 p-4 space-y-4 print:p-2 print:space-y-1 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-300 pb-2 print:pb-1">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-teal-800 bg-teal-100 px-2 py-0.5 rounded print:text-[7px]">
                  Longitudinal Progress & Comparison Report
                </span>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight mt-1 print:text-[10px]">
                  Current Screening ({comparison.currentScreeningDate}) vs Previous Screening ({comparison.previousScreeningDate})
                </h2>
                <p className="text-[10px] text-slate-500 font-medium print:text-[7px]">
                  Screening Interval: {comparison.screeningIntervalDays} days | Baseline Ref: {comparison.previousScreeningId}
                </p>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                {comparison.gradeChangeStatus === 'Improved' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-300 bg-emerald-100 text-emerald-900 text-xs font-black uppercase tracking-wider print:text-[8px] print:px-1.5 print:py-0.5">
                    <TrendingDown className="w-4 h-4 print:w-2.5 print:h-2.5" /> Improved Finding
                  </span>
                ) : comparison.gradeChangeStatus === 'Worsened' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-rose-300 bg-rose-100 text-rose-900 text-xs font-black uppercase tracking-wider print:text-[8px] print:px-1.5 print:py-0.5">
                    <TrendingUp className="w-4 h-4 print:w-2.5 print:h-2.5" /> Disease Advancement
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-300 bg-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider print:text-[8px] print:px-1.5 print:py-0.5">
                    <Minus className="w-4 h-4 print:w-2.5 print:h-2.5" /> Stable Condition
                  </span>
                )}
              </div>
            </div>

            {/* Severity & Metrics Comparison Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:grid-cols-3 print:gap-1.5 text-xs print:text-[8px]">
              
              {/* Severity Transition */}
              <div className="bg-white border border-slate-300 p-2.5 rounded print:p-1.5">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest print:text-[6px]">Severity Grading Trajectory</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-slate-700">Grade {comparison.previousGrade}</span>
                  <span className="text-slate-400">➔</span>
                  <span className={`font-black ${
                    comparison.gradeChangeStatus === 'Improved' ? 'text-emerald-700' :
                    comparison.gradeChangeStatus === 'Worsened' ? 'text-rose-700' : 'text-slate-900'
                  }`}>Grade {comparison.currentGrade}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 print:text-[6px]">
                  Confidence: {comparison.previousConfidence}% ➔ {comparison.currentConfidence}% ({comparison.confidenceDelta >= 0 ? `+${comparison.confidenceDelta}` : comparison.confidenceDelta}%)
                </div>
              </div>

              {/* Visual Acuity OD/OS */}
              <div className="bg-white border border-slate-300 p-2.5 rounded print:p-1.5">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest print:text-[6px]">Visual Acuity Shift</div>
                <div className="mt-1 space-y-0.5">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-600">OD (Right):</span>
                    <span className="font-bold text-slate-900">{comparison.visualAcuity.rightEye.previous} ➔ {comparison.visualAcuity.rightEye.current}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-600">OS (Left):</span>
                    <span className="font-bold text-slate-900">{comparison.visualAcuity.leftEye.previous} ➔ {comparison.visualAcuity.leftEye.current}</span>
                  </div>
                </div>
              </div>

              {/* IOP Shift */}
              <div className="bg-white border border-slate-300 p-2.5 rounded print:p-1.5">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest print:text-[6px]">Intraocular Pressure (IOP)</div>
                <div className="mt-1 space-y-0.5">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-600">OD:</span>
                    <span className="font-bold text-slate-900">{comparison.iop.rightEye.previous} ➔ {comparison.iop.rightEye.current}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-600">OS:</span>
                    <span className="font-bold text-slate-900">{comparison.iop.leftEye.previous} ➔ {comparison.iop.leftEye.current}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Categorized Findings Section (Improved / Worsened / Stable / Newly Detected / Resolved) */}
            <div className="space-y-2 border-t border-slate-300 pt-3 print:pt-1.5 print:space-y-1">
              <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest print:text-[7px]">
                Detailed Comparative Pathology Analysis
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:grid-cols-2 print:gap-1.5">
                
                {/* Improved */}
                {comparison.categorizedFindings.improved.length > 0 && (
                  <div className="bg-emerald-50/60 border border-emerald-200 p-2.5 rounded print:p-1">
                    <div className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1 mb-1 print:text-[7px]">
                      <CheckCircle className="w-3 h-3 text-emerald-700" /> Improved Findings
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-xs text-emerald-950 font-medium print:text-[7px]">
                      {comparison.categorizedFindings.improved.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Worsened */}
                {comparison.categorizedFindings.worsened.length > 0 && (
                  <div className="bg-rose-50/60 border border-rose-200 p-2.5 rounded print:p-1">
                    <div className="text-[10px] font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1 mb-1 print:text-[7px]">
                      <AlertTriangle className="w-3 h-3 text-rose-700" /> Worsened / Disease Advancement
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-xs text-rose-950 font-medium print:text-[7px]">
                      {comparison.categorizedFindings.worsened.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Newly Detected */}
                {comparison.categorizedFindings.newlyDetected.length > 0 && (
                  <div className="bg-amber-50/60 border border-amber-200 p-2.5 rounded print:p-1">
                    <div className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1 mb-1 print:text-[7px]">
                      <AlertTriangle className="w-3 h-3 text-amber-700" /> Newly Detected Findings
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-xs text-amber-950 font-medium print:text-[7px]">
                      {comparison.categorizedFindings.newlyDetected.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Resolved */}
                {comparison.categorizedFindings.resolved.length > 0 && (
                  <div className="bg-teal-50/60 border border-teal-200 p-2.5 rounded print:p-1">
                    <div className="text-[10px] font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1 mb-1 print:text-[7px]">
                      <CheckCircle2 className="w-3 h-3 text-teal-700" /> Resolved Findings
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-xs text-teal-950 font-medium print:text-[7px]">
                      {comparison.categorizedFindings.resolved.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Stable */}
                {comparison.categorizedFindings.stable.length > 0 && (
                  <div className="bg-slate-100/70 border border-slate-200 p-2.5 rounded print:p-1">
                    <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1 mb-1 print:text-[7px]">
                      <Minus className="w-3 h-3 text-slate-600" /> Stable Findings
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-800 font-medium print:text-[7px]">
                      {comparison.categorizedFindings.stable.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Progression Narrative */}
            <div className="bg-white border border-slate-300 p-3 rounded print:p-1.5 text-xs print:text-[7px] text-slate-800">
              <strong className="text-slate-900 font-bold block mb-1">Clinical Progression Summary:</strong>
              {comparison.clinicalProgressionSummary}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* FEATURE 10: EVIDENCE-BASED HEALTH & LIFESTYLE SUPPORTIVE MEASURES */}
        {/* ================================================================ */}
        <div className="print-break-inside-avoid border border-slate-900 p-4 space-y-3 print:p-2.5 print:space-y-1.5 bg-white">
          <div className="flex items-center justify-between border-b border-slate-300 pb-2 print:pb-1">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 print:text-[8px]">
              <Heart className="w-3.5 h-3.5 text-teal-700" /> Evidence-Based Health & Supportive Lifestyle Measures
            </h3>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider print:text-[6px]">
              Focus: {healthMeasures.conditionFocus}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:grid-cols-2 print:gap-1.5 text-xs print:text-[7px]">
            {/* Physical Activity */}
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded print:p-1">
              <div className="font-bold text-slate-900 flex items-center gap-1 text-[11px] print:text-[7px] mb-1">
                <Activity className="w-3 h-3 text-teal-600" /> Physical Activity & Exercise
              </div>
              <p className="text-slate-700 font-medium">{healthMeasures.physicalActivity.recommendation}</p>
              <p className="text-rose-800 font-semibold mt-1 text-[10px] print:text-[6px]">
                {healthMeasures.physicalActivity.precautions}
              </p>
            </div>

            {/* Nutrition & Glycemic Guidance */}
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded print:p-1">
              <div className="font-bold text-slate-900 flex items-center gap-1 text-[11px] print:text-[7px] mb-1">
                <Heart className="w-3 h-3 text-teal-600" /> Dietary & Glycemic Management
              </div>
              <p className="text-slate-700 font-medium">{healthMeasures.dietaryAndNutrition.guideline}</p>
              <p className="text-slate-600 mt-1 text-[10px] print:text-[6px]">
                <strong>Glycemic Tip:</strong> {healthMeasures.dietaryAndNutrition.glycemicControlTip}
              </p>
            </div>

            {/* Monitoring Protocol */}
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded print:p-1">
              <div className="font-bold text-slate-900 flex items-center gap-1 text-[11px] print:text-[7px] mb-1">
                <Clock className="w-3 h-3 text-teal-600" /> Monitoring & Surveillance
              </div>
              <p className="text-slate-700 font-medium">{healthMeasures.monitoringAndAdherence.selfMonitoring}</p>
              <p className="text-teal-800 font-bold mt-1 text-[10px] print:text-[6px]">
                Schedule: {healthMeasures.monitoringAndAdherence.followUpSchedule}
              </p>
            </div>

            {/* Systemic Risk Factor Targets */}
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded print:p-1">
              <div className="font-bold text-slate-900 flex items-center gap-1 text-[11px] print:text-[7px] mb-1">
                <ShieldCheck className="w-3 h-3 text-teal-600" /> Systemic Risk Factor Targets
              </div>
              <p className="text-slate-700 font-medium"><strong>Blood Pressure:</strong> {healthMeasures.riskFactorManagement.bloodPressureTarget}</p>
              <p className="text-slate-700 font-medium mt-0.5"><strong>Lipid Target:</strong> {healthMeasures.riskFactorManagement.lipidTarget}</p>
            </div>
          </div>

          <div className="bg-slate-100 p-2 rounded text-[9px] text-slate-600 leading-tight italic print:text-[6px] border border-slate-200">
            {healthMeasures.medicalDisclaimer}
          </div>
        </div>

        {/* ================================================================ */}
        {/* RELEVANT CLINICAL MEDICATIONS & PHARMACOTHERAPY                   */}
        {/* Grounded in Goodman & Gilman 14th Ed., Katzung 15th Ed., AAO PPP */}
        {/* ================================================================ */}
        <div className="border border-slate-900 p-4 space-y-3 print:p-2.5 print:space-y-2 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-300 pb-2 print:pb-1 gap-1">
            <div className="flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-teal-700 shrink-0" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest print:text-[8px]">
                Relevant Clinical Medications & Pharmacotherapy
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded uppercase tracking-wider print:text-[6px]">
                Official Medical Books Reference
              </span>
            </div>
          </div>

          <div className="text-[10px] text-slate-700 print:text-[7px] leading-tight">
            <strong>Stage Pharmacological Target:</strong> {medicationsGuidance.clinicalSummary}
          </div>

          {/* Ophthalmic Medications Subsection */}
          {medicationsGuidance.primaryOphthalmicMedications.length > 0 && (
            <div className="space-y-2 print:space-y-1">
              <div className="text-[10px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1 print:text-[7px]">
                <Eye className="w-3 h-3 text-teal-600" />
                Targeted Ophthalmic Biologics & Intravitreal Pharmacotherapy:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 print:grid-cols-2 print:gap-1.5">
                {medicationsGuidance.primaryOphthalmicMedications.map((med, idx) => (
                  <div key={idx} className="print-break-inside-avoid bg-slate-50 border border-slate-200 p-2.5 rounded text-xs print:text-[7px] print:p-1 space-y-1">
                    <div className="flex items-start justify-between gap-1">
                      <div className="font-bold text-slate-900 text-[11px] print:text-[7px] leading-tight">
                        {med.drugName}
                      </div>
                      <span className="text-[8px] font-mono bg-teal-100/80 text-teal-900 px-1.5 py-0.5 rounded print:text-[6px] max-w-[140px] truncate shrink-0 font-bold" title={getRouteBadgeLabel(med.routeAndDosing)}>
                        {getRouteBadgeLabel(med.routeAndDosing)}
                      </span>
                    </div>

                    <div className="text-slate-700 leading-tight">
                      <strong>Class:</strong> {med.pharmacologicalClass}
                    </div>

                    <div className="text-slate-800 leading-tight">
                      <strong>Dosing & Route:</strong> {med.routeAndDosing}
                    </div>

                    <div className="text-slate-700 leading-tight">
                      <strong>Biological Mechanism:</strong> {med.mechanismOfAction}
                    </div>

                    <div className="bg-white border border-slate-300 p-1.5 rounded text-[10px] print:text-[6px] space-y-0.5">
                      <div className="font-bold text-teal-900 flex items-center gap-1">
                        <BookOpen className="w-2.5 h-2.5 text-teal-700" /> Official Medical Textbook Citation:
                      </div>
                      <div className="text-slate-800 font-semibold">
                        {med.officialTextbookReference.bookTitle} — {med.officialTextbookReference.chapterAndSection}
                      </div>
                      {med.officialTextbookReference.trialEvidence && (
                        <div className="text-slate-500 italic">
                          Trial Evidence: {med.officialTextbookReference.trialEvidence}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Systemic Microvascular Medications Subsection */}
          {medicationsGuidance.systemicMicrovascularMedications.length > 0 && (
            <div className="space-y-2 print:space-y-1 pt-1 border-t border-slate-200 print-break-inside-avoid">
              <div className="text-[10px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1 print:text-[7px]">
                <Activity className="w-3 h-3 text-teal-600" />
                Systemic Microvascular & Endothelial Protective Pharmacotherapy:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 print:grid-cols-2 print:gap-1.5">
                {medicationsGuidance.systemicMicrovascularMedications.map((med, idx) => (
                  <div key={idx} className="print-break-inside-avoid bg-slate-50 border border-slate-200 p-2.5 rounded text-xs print:text-[7px] print:p-1 space-y-1">
                    <div className="flex items-start justify-between gap-1">
                      <div className="font-bold text-slate-900 text-[11px] print:text-[7px] leading-tight">
                        {med.drugName}
                      </div>
                      <span className="text-[8px] font-mono bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded print:text-[6px] max-w-[140px] truncate shrink-0 font-bold" title={getRouteBadgeLabel(med.routeAndDosing)}>
                        {getRouteBadgeLabel(med.routeAndDosing)}
                      </span>
                    </div>

                    <div className="text-slate-700 leading-tight">
                      <strong>Class:</strong> {med.pharmacologicalClass}
                    </div>

                    <div className="text-slate-800 leading-tight">
                      <strong>Dosing & Regimen:</strong> {med.routeAndDosing}
                    </div>

                    <div className="text-slate-700 leading-tight">
                      <strong>Target Mechanism:</strong> {med.mechanismOfAction}
                    </div>

                    <div className="bg-white border border-slate-300 p-1.5 rounded text-[10px] print:text-[6px] space-y-0.5">
                      <div className="font-bold text-teal-900 flex items-center gap-1">
                        <BookOpen className="w-2.5 h-2.5 text-teal-700" /> Official Medical Textbook Citation:
                      </div>
                      <div className="text-slate-800 font-semibold">
                        {med.officialTextbookReference.bookTitle} — {med.officialTextbookReference.chapterAndSection}
                      </div>
                      {med.officialTextbookReference.trialEvidence && (
                        <div className="text-slate-500 italic">
                          Validation: {med.officialTextbookReference.trialEvidence}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 p-2 rounded text-[9px] text-amber-900 leading-tight print:text-[6px]">
            <strong>OFFICIAL PHARMACOTHERAPY DISCLAIMER:</strong> {medicationsGuidance.pharmacotherapyDisclaimer}
          </div>
        </div>

        {/* Editable Physician Notes */}
        <div className="print-break-inside-avoid border-t-2 border-slate-900 pt-3 print:pt-2 space-y-2 print:space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 print:text-[9px]">
              <Edit3 className="w-3 h-3 print:hidden" /> Clinical Observations & Directives
            </h3>
          </div>

          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter clinical examination notes, pathology remarks..."
            className="w-full border border-slate-400 p-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-slate-900 bg-slate-50/50 print:border-none print:p-0 print:bg-transparent print:text-[9px]"
          />

          <div className="grid grid-cols-3 gap-4 print:gap-2">
            <div className="col-span-2">
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 print:text-[6px]">Actionable Recommendation</label>
              <input type="text" value={recommendation} onChange={(e) => setRecommendation(e.target.value)} className="w-full border border-slate-400 p-2 text-xs font-semibold focus:outline-none focus:border-slate-900 print:border-none print:p-0 print:border-b print:border-slate-300 print:rounded-none print:text-[9px]" />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 print:text-[6px]">Follow-up Interval</label>
              <select value={followUpInterval} onChange={(e) => setFollowUpInterval(e.target.value)} className="w-full border border-slate-400 p-2 text-xs font-semibold focus:outline-none focus:border-slate-900 print:border-none print:p-0 print:border-b print:border-slate-300 print:rounded-none print:appearance-none print:text-[9px]">
                <option value="Immediate / 48-72 Hours">Immediate</option>
                <option value="1 Month">1 Month</option>
                <option value="3 Months">3 Months</option>
                <option value="6 Months">6 Months</option>
                <option value="12 Months">12 Months</option>
              </select>
            </div>
          </div>

          <div className="no-print flex justify-end gap-3 pt-2">
            {saveSuccessMsg && <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> {saveSuccessMsg}</span>}
            <button onClick={handleSaveChanges} disabled={isSaving} className="px-4 py-1.5 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider hover:bg-black disabled:opacity-50">
              {isSaving ? 'Logging...' : 'Save & Sign'}
            </button>
          </div>
        </div>

        {/* Digital Signature Footer */}
        <div className="print-break-inside-avoid pt-4 border-t border-slate-300 flex justify-between items-end print:pt-2 print:mt-1.5">
          <div className="text-[9px] text-slate-500 max-w-sm uppercase leading-tight tracking-wider print:text-[6px]">
            Report generated via assistive automated pipeline. Must be correlated with full clinical exam. Not a substitute for physical consultation.
          </div>
          <div className="text-right">
            <div className="border-b border-slate-900 pb-1 w-48 ml-auto text-center font-serif italic text-slate-800 text-xs print:text-[10px]">{doctor?.displayName}</div>
            <div className="text-[9px] font-bold text-slate-900 mt-1 uppercase print:text-[7px]">Digitally Verified By</div>
            <div className="text-[9px] text-slate-600 print:text-[6px]">{doctor?.medicalLicense}</div>
            <div className="text-[8px] text-slate-400 font-mono mt-0.5 print:text-[5px]">{new Date().toISOString()}</div>
          </div>
        </div>
      </div>

      <AuditTrailModal isOpen={showAuditModal} onClose={() => setShowAuditModal(false)} logs={AuditService.getLogs(doctor?.uid, patient.id)} />
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center"><RefreshCw className="w-5 h-5 animate-spin mx-auto" /></div>}>
      <ReportContentInner />
    </Suspense>
  );
}