'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Activity, AlertTriangle, Search, Plus, RefreshCw, FileText, Eye, Stethoscope, ChevronRight } from 'lucide-react';
import { useAuth } from '../lib/authContext';
import { PatientService, Patient } from '../lib/patientService';

export default function PatientDirectory() {
  const router = useRouter();
  const { doctor, loading } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);

  // THE FIX: Automatically redirect to login if no active doctor session exists
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

  // Show a loading state instead of a blank screen while verifying auth
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mb-4 text-teal-600" />
        <p className="text-xs font-bold tracking-widest uppercase">Verifying Session...</p>
      </div>
    );
  }

  // Prevent render before the redirect takes effect
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
            <button onClick={loadPatients} className="px-3 py-1.5 border border-white/60 bg-white/40 hover:bg-white/60 backdrop-blur-sm text-slate-700 shadow-sm rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all">
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Sync
            </button>
            <Link href="/intake" className="flex-1 sm:flex-none px-4 py-1.5 bg-slate-800/90 hover:bg-slate-900 backdrop-blur-md border border-slate-700/50 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-md transition-all">
              <Plus className="w-3.5 h-3.5" /> Register Patient
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Users, val: patients.length, label: 'Total Enrolled', color: 'slate' },
          { icon: Activity, val: totalScreenings, label: 'Screening Exams', color: 'teal' },
          { icon: AlertTriangle, val: referableCases, label: 'Active Referrals', color: 'rose' }
        ].map((stat, i) => (
          <div key={i} className="bg-white/50 backdrop-blur-lg border border-white/60 p-4 rounded-2xl shadow-lg flex items-center gap-4 relative overflow-hidden">
            <div className={`w-10 h-10 rounded-xl bg-white/60 border border-white/80 shadow-inner flex items-center justify-center text-${stat.color}-600 backdrop-blur-sm`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 leading-none drop-shadow-sm">{stat.val}</div>
              <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

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
              return (
                <div key={patient.id} className="p-4 hover:bg-white/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold text-slate-600 bg-white/60 border border-white/80 shadow-inner px-1.5 py-0.5 rounded-md">{patient.id}</span>
                      <h3 className="text-sm font-bold text-slate-900 truncate">{patient.name || 'Unnamed Record'}</h3>
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
                        <div className="flex items-center gap-2">
                          {getGradeBadge(aiData?.grade)}
                          {aiData?.referable && (
                            <span className="px-2 py-0.5 border border-rose-400/50 bg-rose-600/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded shadow-sm flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Refer
                            </span>
                          )}
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono font-bold">Last Examination: {latestScreening.date}</div>
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-white/50 border border-white/60 shadow-inner rounded px-2 py-1">No Scans</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 opacity-100 sm:opacity-50 group-hover:opacity-100 transition-opacity">
                    <Link href={`/intake?patientId=${patient.id}`} className="flex-1 sm:flex-none px-3 py-1.5 bg-white/60 border border-white/80 hover:bg-white/90 shadow-sm text-slate-800 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all">
                      <Eye className="w-3.5 h-3.5" /> Examine
                    </Link>
                    {latestScreening && (
                      <Link href={`/report/${patient.id}?screeningId=${latestScreening.id}`} className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-800/90 border border-slate-700/50 hover:bg-slate-900 shadow-md text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all">
                        <FileText className="w-3.5 h-3.5" /> Report <ChevronRight className="w-3 h-3 opacity-50" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}