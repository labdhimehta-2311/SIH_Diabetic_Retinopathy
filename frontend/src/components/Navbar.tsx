'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Users, FilePlus, ShieldCheck, ChevronDown } from 'lucide-react';
import { useAuth } from '../lib/authContext';

export default function Navbar() {
  const { doctor, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
  const [isOnline, setIsOnline] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    await logout();
    router.push('/login');
  };

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (pathname === '/login') return null;
  if (!doctor) return null;

  const navClass = (path: string) => 
    `flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
      pathname === path 
        ? 'bg-slate-800/90 text-white shadow-md backdrop-blur-md border border-slate-700/50' 
        : 'text-slate-600 hover:bg-white/60 hover:text-slate-900 hover:shadow-sm border border-transparent'
    }`;

  return (
    <nav className="bg-white/60 backdrop-blur-md border-b border-white/60 sticky top-0 z-50 animate-fade-in-up shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          
          {/* LOGO SECTION UPDATED HERE */}
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="RetinX Logo" 
              className="w-9 h-9 rounded-[10px] shadow-sm object-cover border border-slate-700/20"
            />
            <div className="flex flex-col justify-center">
              <span className="text-sm font-black text-slate-900 tracking-tight leading-tight">
                RetinX Clinical
              </span>
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest leading-tight">
                Diabetic Retinopathy Portal
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            <Link href="/" className={navClass('/')}>
              <Users className="w-3.5 h-3.5" /> Patient Directory
            </Link>
            <Link href="/intake" className={navClass('/intake')}>
              <FilePlus className="w-3.5 h-3.5" /> New Screening
            </Link>
            <Link href="/audit" className={navClass('/audit')}>
              <ShieldCheck className="w-3.5 h-3.5" /> Audit Logs
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/60 bg-white/40 shadow-inner backdrop-blur-sm text-[9px] font-bold text-slate-700 uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                {isOnline ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                )}
              </span>
              {isOnline ? 'Secure EMR Sync' : 'Offline Mode'}
            </div>

            <div className="h-6 w-px bg-slate-300/50 hidden sm:block"></div>

            <div className="relative">
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <div className="text-right hidden sm:block">
                  <div className="text-[11px] font-bold text-slate-900 leading-tight group-hover:text-slate-700 transition-colors">
                    {doctor.displayName}
                  </div>
                  <div className="text-[9px] text-slate-600 font-semibold leading-tight">
                    {doctor.clinic || 'Metabolic & Retinal Health'}
                  </div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-white/50 border border-white/60 shadow-sm backdrop-blur-sm flex items-center justify-center text-slate-800 text-xs font-bold group-hover:bg-white/80 transition-all">
                  {doctor.displayName?.charAt(0) || 'D'}
                </div>
                <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-4 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Management</p>
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    Secure Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}