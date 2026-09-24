'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Users, Activity, AlertTriangle, Search, Plus, RefreshCw, 
  FileText, Eye, Stethoscope, ChevronRight, ChevronDown, ChevronUp,
  User, Calendar, Clock, MapPin, Briefcase, Phone, ClipboardList,
  CheckCircle2, TrendingDown, TrendingUp, Minus, Heart, Flame
} from 'lucide-react';
import { useAuth } from '../lib/authContext';
import { PatientService, Patient } from '../lib/patientService';
import { computeQueueSystem, QueueSystemState } from '../lib/queueService';
import ClinicalQueueMonitor from '../components/ClinicalQueueMonitor';

export default function PatientDirectory() {
  const router = useRouter();
  const { doctor, loading } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);
  const [showTriageQueues, setShowTriageQueues] = useState(true);

  // Automatically redirect to login if no active doctor session exists
  useEffect(() => {
    if (!loading && !doctor) {
      router.replace('/login');
    }
  }, [doctor, loading, router]);

  useEffect(() => { 
    if (doctor) loadPatients(); 
  }, [doctor]);

  const loadPatients = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await PatientService.getPatientsByDoctor(doctor!.uid);
      const validData = data || [];
      validData.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
      setPatients(validData);
    } catch (error: any) {
      setFetchError(error.message || "Failed to fetch from Firebase.");
      setPatients([]); 
    } finally {
      setIsLoading(false);
    }
  };

  const queueState = computeQueueSystem(patients);

  const filteredPatients = patients.filter(p => {
    if (!p) return false;
    const query = searchQuery.toLowerCase();
    return String(p.name || '').toLowerCase().includes(query) || 
           String(p.id || '').toLowerCase().includes(query) || 
           String(p.phone || '').includes(searchQuery);
  });

  const totalScreenings = patients.reduce((acc, p) => acc + (p?.screenings?.length || 0), 0);
  const referableCases = patients.filter(p => p?.screenings?.[0]?.aiResults?.referable).length;

  const getGradeBadge = (grade?: number) => {
    if (grade === undefined) return <span className="text-slate-500 text-xs font-bold">No AI Data</span>;
    if (grade === 0) return <span className="px-2 py-0.5 border border-emerald-300/50 bg-emerald-50/50 backdrop-blur-sm text-emerald-800 text-[10px] font-bold uppercase tracking-wider rounded shadow-sm">Grade 0: Normal</span>;
    if (grade === 1) return <span className="px-2 py-0.5 border border-amber-300/50 bg-amber-50/50 backdrop-blur-sm text-amber-800 text-[10px] font-bold uppercase tracking-wider rounded shadow-sm">Grade 1: Mild</span>;
    if (grade === 2) return <span className="px-2 py-0.5 border border-orange-300/50 bg-orange-50/50 backdrop-blur-sm text-orange-800 text-[10px] font-bold uppercase tracking-wider rounded shadow-sm">Grade 2: Moderate</span>;
    if (grade === 3) return <span className="px-2 py-0.5 border border-rose-300/50 bg-rose-50/50 backdrop-blur-sm text-rose-800 text-[10px] font-bold uppercase tracking-wider rounded shadow-sm">Grade 3: Severe</span>;
    return <span className="px-2 py-0.5 border border-red-400/50 bg-red-100/50 backdrop-blur-sm text-red-900 text-[10px] font-bold uppercase tracking-wider rounded shadow-sm">Grade 4: Proliferative</span>;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mb-4 text-teal-600" />
        <p className="text-xs font-bold tracking-widest uppercase">Verifying Session...</p>
      </div>
    );
  }

  if (!doctor) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up p-4">
      
      {/* Header Panel */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/60 p-5 shadow-xl rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2 drop-shadow-sm">
              <Stethoscope className="w-5 h-5 text-teal-700" /> Patient Directory & Master Records
            </h1>
            <p className="text-[11px] text-slate-600 mt-1 uppercase tracking-widest font-semibold">
              Facility: {doctor.clinic || 'Metabolic & Retinal Health'} | ID: {doctor.uid}
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setShowTriageQueues(!showTriageQueues)} 
              className="px-3 py-1.5 border border-white/60 bg-white/40 hover:bg-white/60 backdrop-blur-sm text-slate-700 shadow-sm rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all"
            >
              {showTriageQueues ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-teal-600" /> Hide Triage Queues
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-teal-600" /> Live Triage Queues
                </>
              )}
            </button>
            <button onClick={loadPatients} className="px-3 py-1.5 border border-white/60 bg-white/40 hover:bg-white/60 backdrop-blur-sm text-slate-700 shadow-sm rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all">
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Sync
            </button>
            <Link href="/intake" className="flex-1 sm:flex-none px-4 py-1.5 bg-slate-800/90 hover:bg-slate-900 backdrop-blur-md border border-slate-700/50 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-md transition-all">
              <Plus className="w-3.5 h-3.5" /> Register Patient
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Row - 4 Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Users, val: patients.length, label: 'Total Enrolled', color: 'slate' },
          { icon: Flame, val: queueState.riskQueue.length, label: 'Risk Priority Queue', color: 'rose' },
          { icon: Clock, val: queueState.normalQueue.length, label: 'Normal FIFO Queue', color: 'teal' },
          { icon: AlertTriangle, val: queueState.activeReferrals, label: 'Active Referrals', color: 'amber' }
        ].map((stat, i) => (
          <div key={i} className="bg-white/50 backdrop-blur-lg border border-white/60 p-4 rounded-2xl shadow-lg flex items-center gap-3.5 relative overflow-hidden">
            <div className={`w-10 h-10 rounded-xl bg-white/60 border border-white/80 shadow-inner flex items-center justify-center text-${stat.color}-600 backdrop-blur-sm shrink-0`}>
              <stat.icon className={`w-5 h-5 ${stat.color === 'rose' ? 'fill-rose-500 text-rose-600' : ''}`} />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 leading-none drop-shadow-sm">{stat.val}</div>
              <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Clinical Triage & Specialist Queue Monitor */}
      {showTriageQueues && (
        <ClinicalQueueMonitor 
          riskQueue={queueState.riskQueue} 
          normalQueue={queueState.normalQueue} 
        />
      )}

      {fetchError && (
        <div className="bg-rose-100/80 backdrop-blur-md border border-rose-200/60 p-4 text-rose-800 text-xs font-bold rounded-2xl shadow-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> System Error: {fetchError}
        </div>
      )}

      {/* Directory List */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl rounded-2xl overflow-hidden relative">
        <div className="p-3 border-b border-white/40 bg-white/40 backdrop-blur-md flex items-center gap-2 relative">
          <Search className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
          <input 
            type="text" 
            placeholder="Search by patient name, MRN, or phone number..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-xs text-slate-800 font-medium focus:outline-none focus:ring-0 placeholder-slate-500"
          />
        </div>

        <div className="divide-y divide-white/40 relative">
          {isLoading ? (
            <div className="p-10 text-center text-slate-600 text-xs font-bold"><RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" /> Retrieving Records...</div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-10 text-center text-slate-600 text-xs font-bold">No matching patient records found.</div>
          ) : (
            filteredPatients.map((patient) => {
              const latestScreening = patient.screenings?.[0];
              const aiData = latestScreening?.aiResults;
              const isExpanded = expandedPatientId === patient.id;
              const screeningsList = patient.screenings || [];
              const qItem = queueState.allQueuedPatients.get(patient.id);

              return (
                <div key={patient.id} className="transition-colors">
                  <div className="p-4 hover:bg-white/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold text-slate-600 bg-white/60 border border-white/80 shadow-inner px-1.5 py-0.5 rounded-md">{patient.id}</span>
                        <h3 className="text-sm font-bold text-slate-900 truncate">{patient.name || 'Unnamed Record'}</h3>
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {screeningsList.length} {screeningsList.length === 1 ? 'Visit' : 'Visits'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-semibold">{patient.age || '--'}y / {String(patient.sex || 'U').charAt(0)}</span>
                        <span>•</span><span>{patient.phone || 'No Phone'}</span>
                        <span>•</span><span className="text-slate-800">Dx: {patient.clinicalVitals?.diabetesType || 'Unknown'}</span>
                        <span>•</span><span>HbA1c: {patient.clinicalVitals?.bloodGlucose?.hba1cPercent || '--'}%</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0 w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                      {latestScreening ? (
                        <>
                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            {getGradeBadge(aiData?.grade)}
                            {aiData?.referable && (
                              <span className="px-2 py-0.5 border border-rose-400/50 bg-rose-600/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded shadow-sm flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Refer
                              </span>
                            )}
                            {qItem && (
                              qItem.queueType === 'RISK_PRIORITY' ? (
                                <span className="px-2 py-0.5 border border-rose-300 bg-rose-50/90 text-rose-700 text-[10px] font-bold rounded shadow-2xs flex items-center gap-1 whitespace-nowrap">
                                  <Flame className="w-3 h-3 text-rose-600 fill-rose-100" />
                                  <span>Risk #{qItem.rank} ({qItem.waitDisplay.startsWith('~') ? qItem.waitDisplay : `~${qItem.waitDisplay}`})</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 border border-teal-300 bg-teal-50/90 text-teal-700 text-[10px] font-bold rounded shadow-2xs flex items-center gap-1 whitespace-nowrap">
                                  <Clock className="w-3 h-3 text-teal-600" />
                                  <span>Normal #{qItem.rank} ({qItem.waitDisplay.startsWith('~') ? qItem.waitDisplay : `~${qItem.waitDisplay}`})</span>
                                </span>
                              )
                            )}
                          </div>
                          <div className="text-[9px] text-slate-500 font-mono font-bold">Last Examination: {latestScreening.date}</div>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-white/50 border border-white/60 shadow-inner rounded px-2 py-1">No Scans</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 opacity-100 transition-opacity">
                      {/* Expand Demographics, History & Timeline */}
                      <button
                        type="button"
                        onClick={() => setExpandedPatientId(isExpanded ? null : patient.id)}
                        className={`px-3 py-1.5 border rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                          isExpanded 
                            ? 'bg-teal-50 border-teal-300 text-teal-800' 
                            : 'bg-white/60 border-white/80 hover:bg-white/90 text-slate-700'
                        }`}
                        title="View Demographics, Family History & Screening Timeline"
                      >
                        <User className="w-3.5 h-3.5 text-teal-600" />
                        <span>History & Timeline</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3 text-teal-700" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
                      </button>

                      <Link href={`/intake?patientId=${patient.id}`} className="flex-1 sm:flex-none px-3 py-1.5 bg-white/60 border border-white/80 hover:bg-white/90 shadow-sm text-slate-800 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all">
                        <Eye className="w-3.5 h-3.5" /> Examine
                      </Link>

                      {latestScreening && (
                        <Link href={`/report/${patient.id}?screeningId=${latestScreening.id}`} className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-800/90 border border-slate-700/50 hover:bg-slate-900 shadow-md text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all">
                          <FileText className="w-3.5 h-3.5" /> Latest Report <ChevronRight className="w-3 h-3 opacity-50" />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* ================================================================ */}
                  {/* EXPANDED PATIENT RECORD: DEMOGRAPHICS, FAMILY HISTORY & TIMELINE  */}
                  {/* ================================================================ */}
                  {isExpanded && (
                    <div className="bg-slate-50/80 border-t border-b border-slate-200/80 p-5 space-y-5 animate-fade-in-up">
                      
                      {/* Grid: Demographics + Medical/Family History */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Demographics Card */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                              <User className="w-4 h-4 text-teal-600" /> Full Patient Demographics
                            </h4>
                            <span className="text-[10px] font-mono text-slate-500 font-semibold">{patient.id}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-700">
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Full Legal Name</span>
                              <span className="font-semibold text-slate-900">{patient.name}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Age / Sex</span>
                              <span className="font-semibold text-slate-900">{patient.age} years / {patient.sex}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Contact Phone</span>
                              <span className="font-semibold text-slate-900 flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" /> {patient.phone || 'Not Provided'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Occupation</span>
                              <span className="font-semibold text-slate-900 flex items-center gap-1">
                                <Briefcase className="w-3 h-3 text-slate-400" /> {patient.occupation || 'General'}
                              </span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Residential Address</span>
                              <span className="font-semibold text-slate-900 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" /> {patient.address || 'Not Provided'}
                              </span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Registration Date</span>
                              <span className="font-semibold text-slate-900 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" /> {patient.dateOfRegistration || patient.createdAt?.split('T')[0] || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Clinical & Family Medical History Card */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                              <ClipboardList className="w-4 h-4 text-teal-600" /> Clinical & Family Medical History
                            </h4>
                            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                              {patient.clinicalVitals?.diabetesType}
                            </span>
                          </div>

                          <div className="space-y-2 text-xs text-slate-700">
                            {/* Family Medical History (prominently displayed) */}
                            <div className="bg-amber-50/70 border border-amber-200/80 p-2.5 rounded-lg">
                              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1 mb-0.5">
                                <Heart className="w-3 h-3 text-amber-700" /> Family Medical History
                              </span>
                              <p className="text-slate-800 font-medium text-[11px]">
                                {patient.history?.familyHistory || 'No significant familial ocular or metabolic history recorded.'}
                              </p>
                            </div>

                            {/* Vitals & Regimen */}
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Diagnosis Year</span>
                                <span className="font-semibold text-slate-900">{patient.clinicalVitals?.yearOfDiagnosis || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Diabetes Management</span>
                                <span className="font-semibold text-slate-900">{patient.clinicalVitals?.diabetesManagement || 'Diet'}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Active Medications</span>
                                <span className="font-semibold text-slate-800 text-[11px]">{patient.clinicalVitals?.medicationDetails || 'None listed'}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Fasting / PP Glucose</span>
                                <span className="font-semibold text-slate-900">
                                  {patient.clinicalVitals?.bloodGlucose?.fastingMgDl || '--'} / {patient.clinicalVitals?.bloodGlucose?.postPrandialMgDl || '--'} mg/dL
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">HbA1c Percent</span>
                                <span className="font-bold text-slate-900">{patient.clinicalVitals?.bloodGlucose?.hba1cPercent || '--'}%</span>
                              </div>
                            </div>

                            {/* Other Symptoms & Lifestyle */}
                            {patient.history?.otherSymptoms && patient.history.otherSymptoms.length > 0 && (
                              <div className="pt-1">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Reported Symptoms</span>
                                <div className="flex flex-wrap gap-1 mt-0.5">
                                  {patient.history.otherSymptoms.map((sym, idx) => (
                                    <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200">
                                      {sym}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Longitudinal Screening Timeline */}
                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-teal-600" /> Longitudinal Screening Timeline ({screeningsList.length} Total Visits)
                          </h4>
                          <span className="text-[10px] text-slate-500 font-medium">Chronological progression record</span>
                        </div>

                        {screeningsList.length === 0 ? (
                          <div className="text-center py-6 text-xs text-slate-500 font-medium">
                            No screening examinations recorded for this patient yet.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {screeningsList.map((scr, idx) => {
                              const visitNum = scr.visitNumber || (screeningsList.length - idx);
                              const isLatest = idx === 0;
                              const comp = scr.comparisonReport;

                              return (
                                <div 
                                  key={scr.id}
                                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                    isLatest 
                                      ? 'bg-teal-50/40 border-teal-200/80 shadow-xs' 
                                      : 'bg-slate-50/60 border-slate-200'
                                  }`}
                                >
                                  {/* Left: Visit Info */}
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                        isLatest ? 'bg-teal-700 text-white' : 'bg-slate-700 text-white'
                                      }`}>
                                        Visit #{visitNum} {isLatest ? '(Latest)' : ''}
                                      </span>
                                      <span className="text-xs font-bold text-slate-900">{scr.date}</span>
                                      <span className="text-[10px] font-mono text-slate-500 font-semibold">({scr.id})</span>
                                      
                                      {/* Comparison Status Indicator */}
                                      {comp && (
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border flex items-center gap-1 ${
                                          comp.gradeChangeStatus === 'Improved'
                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                            : comp.gradeChangeStatus === 'Worsened'
                                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                                            : 'bg-slate-200 text-slate-800 border-slate-300'
                                        }`}>
                                          {comp.gradeChangeStatus === 'Improved' ? <TrendingDown className="w-2.5 h-2.5" /> :
                                           comp.gradeChangeStatus === 'Worsened' ? <TrendingUp className="w-2.5 h-2.5" /> :
                                           <Minus className="w-2.5 h-2.5" />}
                                          {comp.gradeChangeStatus} vs Visit #{visitNum - 1}
                                        </span>
                                      )}
                                    </div>

                                    {/* Clinical Details */}
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-600">
                                      <span>Clinician: <strong>{scr.doctorName}</strong></span>
                                      <span>•</span>
                                      <span>Confidence: <strong>{scr.aiResults?.confidence}%</strong></span>
                                      <span>•</span>
                                      <span>Visual Acuity: OD <strong>{scr.visualExam?.vaRight || 'N/A'}</strong> / OS <strong>{scr.visualExam?.vaLeft || 'N/A'}</strong></span>
                                      <span>•</span>
                                      <span>IOP: OD <strong>{scr.visualExam?.iopRight || 'N/A'}</strong> / OS <strong>{scr.visualExam?.iopLeft || 'N/A'}</strong></span>
                                    </div>

                                    {/* Progression Summary Snippet if comparison exists */}
                                    {comp && (
                                      <p className="text-[10px] text-slate-600 italic line-clamp-1 mt-0.5">
                                        "{comp.clinicalProgressionSummary}"
                                      </p>
                                    )}
                                  </div>

                                  {/* Right: Badge & Action Links */}
                                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                                    {getGradeBadge(scr.aiResults?.grade)}
                                    
                                    <Link
                                      href={`/report/${patient.id}?screeningId=${scr.id}`}
                                      className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-[11px] font-bold rounded-lg shadow-xs flex items-center gap-1 transition-all"
                                    >
                                      <FileText className="w-3 h-3" /> View Report
                                    </Link>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}