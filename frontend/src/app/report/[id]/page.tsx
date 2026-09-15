'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Printer, ArrowLeft, Save, CheckCircle2, ShieldCheck, 
  Stethoscope, AlertTriangle, Eye, RefreshCw, Edit3
} from 'lucide-react';
import { useAuth } from '../../../lib/authContext';
import { PatientService, Patient, ScreeningSession } from '../../../lib/patientService';
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

function ReportContentInner() {
  const params = useParams();
  const searchParams = useSearchParams();
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

  return (
    <div className="max-w-5xl mx-auto space-y-4 print:p-4">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 0.5cm; size: A4 portrait; }
          body { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            background: white !important;
          }
        }
      `}} />

      {/* Top Action Bar */}
      <div className="no-print flex justify-between items-center bg-slate-50 p-2.5 border border-slate-200 rounded">
        <Link href="/" className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-black">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
        </Link>
        <div className="flex gap-2">
          <button onClick={() => setShowAuditModal(true)} className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold bg-white border border-slate-300 hover:bg-slate-100">
            <ShieldCheck className="w-3.5 h-3.5" /> Audit Trail
          </button>
          <button onClick={handlePrintPDF} className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold bg-slate-900 text-white hover:bg-black transition-all">
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Clinical Document */}
      <div className="bg-white border border-slate-300 p-6 sm:p-8 space-y-6 print:border-none print:p-0 print:space-y-1.5">
        
        {/* Letterhead */}
        <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-end print:pb-1.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                {doctor?.clinic || 'Clinical Retinal Tele-Screening'}
              </h1>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
                Diagnostic Deep Learning Assessment Report
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
        <div className="border border-slate-900 text-xs print:text-[9px]">
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
            <div className="p-1.5 font-mono text-[10px] print:text-[8px]">{screening.id}</div>
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

        {/* Clinical Assessment Alert Block - FIXED */}
        <div className="border-2 border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 print:p-2 print:gap-1">
          <div className="flex-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 print:text-[7px]">Primary Inference Grading</div>
            <div className="text-xl font-black text-slate-900 uppercase print:text-xs leading-tight">{screening.aiResults.gradeLabel}</div>
            <div className="text-[10px] text-slate-600 font-mono mt-1 print:text-[7px] print:mt-0.5">
              CONFIDENCE: <strong className="text-slate-900">{screening.aiResults.confidence}%</strong> | 
              ENGINE: {screening.aiResults.engine} ({screening.aiResults.executionTimeSec}s)
            </div>
          </div>
          <div className="shrink-0 mt-2 sm:mt-0">
            <PrintGradeBadge grade={screening.aiResults.grade} />
          </div>
        </div>

        {/* Visual Diagnostics */}
        <div className="print:block">
          <ComparativeViewer images={screening.aiResults.images} m3Executed={screening.checkM3Setup} />
        </div>

        {/* Editable Physician Notes */}
        <div className="border-t-2 border-slate-900 pt-3 print:pt-1.5 space-y-2 print:space-y-1">
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
        <div className="pt-4 border-t border-slate-300 flex justify-between items-end print:pt-1.5 print:mt-1">
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