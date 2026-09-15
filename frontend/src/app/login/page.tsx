'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Shield, Lock, ArrowRight, Stethoscope, Building2, UserPlus, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../lib/authContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, doctor, availableProfiles, loading, loginWithGoogle, completeProfile, selectActiveDoctor } = useAuth();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Custom Profile Fields for Step 2
  const [customName, setCustomName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    if (!loading) {
      if (doctor) {
        // Session is active and profile selected, go to dashboard
        router.replace('/');
      } else if (user && !doctor) {
        // User is authenticated but doctor is null.
        if (availableProfiles[user.uid]) {
          // They already have a profile, keep them on Step 1 so they can click it
          setStep(1); 
        } else {
          // New account: Send them to intake (Step 2).
          setCustomName(user.displayName || '');
          setStep(2);
        }
      }
    }
  }, [user, doctor, loading, router, availableProfiles]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !clinicName.trim() || !role.trim()) {
      setErrorMsg("Please fill out all fields to continue.");
      return;
    }
    completeProfile(customName, clinicName, role);
    router.push('/');
  };

  const handleAccountSelect = (uid: string) => {
    selectActiveDoctor(uid);
    router.push('/');
  };

  if (loading) return null;

  const inputCss = "w-full px-3.5 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm";
  const labelCss = "block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5";
  const previouslySignedAccounts = Object.values(availableProfiles);

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-3">
          <img 
  src="/logo.png" 
  alt="RetinX Logo" 
  className="w-14 h-14 mx-auto rounded-2xl shadow-md border border-slate-700/20 object-cover" 
/>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">RetinX Clinical</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              {step === 1 ? 'Diabetic Retinopathy Portal' : 'Complete Your Clinical Profile'}
            </p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl p-8 shadow-sm space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              {step === 1 ? <Lock className="w-4 h-4 text-teal-600" /> : <UserPlus className="w-4 h-4 text-teal-600" />}
              {step === 1 ? 'Doctor Authentication' : 'Setup Clinical Workspace'}
            </h2>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 uppercase tracking-wider">
              {step === 1 ? 'Session Control' : 'Isolated Node'}
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Sign In with Google'}
                <ArrowRight className="w-4 h-4" />
              </button>

              {previouslySignedAccounts.length > 0 && (
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                    Previously Signed-In Accounts
                  </p>
                  <div className="space-y-2">
                    {previouslySignedAccounts.map((doc) => (
                      <button
                        key={doc.uid}
                        type="button"
                        onClick={() => handleAccountSelect(doc.uid)}
                        className="w-full p-3 rounded-xl border border-slate-200/80 bg-white/50 hover:bg-white hover:border-teal-300 text-left transition-all flex items-center justify-between group shadow-sm"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-800 group-hover:text-teal-700">
                            {doc.displayName}
                          </div>
                          <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {doc.clinic}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-teal-600 group-hover:bg-teal-50 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors">
                          Switch ➔
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleCompleteSetup} className="space-y-4">
              <div>
                <label className={labelCss}>Your Full Name / Title</label>
                <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} required className={inputCss} placeholder="e.g. Dr. Ramesh Patel" />
              </div>
              
              <div>
                <label className={labelCss}>Hospital / Clinic Name</label>
                <input type="text" value={clinicName} onChange={(e) => setClinicName(e.target.value)} required className={inputCss} placeholder="e.g. Apollo Spectra Eye Institute" />
              </div>

              <div>
                <label className={labelCss}>Clinical Qualification</label>
                <input type="text" value={role} onChange={(e) => setRole(e.target.value)} required className={inputCss} placeholder="e.g. Vitreoretinal Specialist" />
              </div>

              <button
                type="submit"
                className="w-full mt-6 py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-[11px] uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Finalize Setup
              </button>
            </form>
          )}
        </div>

        <div className="text-center text-xs font-medium text-slate-500 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-teal-600" />
          <span>Compliant with HIPAA & Data Isolation Standards</span>
        </div>
      </div>
    </div>
  );
}