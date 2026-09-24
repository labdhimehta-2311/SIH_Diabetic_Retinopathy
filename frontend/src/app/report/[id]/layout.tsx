'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Volume2, Square, Globe } from 'lucide-react';
import { useAuth } from '../../../lib/authContext';
import { PatientService, Patient, ScreeningSession } from '../../../lib/patientService';
import SihEnhancements from '../../../components/SihEnhancements';
import { computeSihEnhancements } from '../../../lib/sihService';
import { regionalVoice } from '../../../lib/regionalVoiceEngine';
import { SupportedLanguage, translations, getFullReportSpokenNarrative } from '../../../lib/reportTranslations';
import { applyLanguageToDOM } from '../../../lib/domTranslator';

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const searchParams = useSearchParams();
  const { doctor } = useAuth();
  const patientId = params?.id as string;
  const screeningIdParam = searchParams?.get('screeningId');

  const [patient, setPatient] = useState<Patient | null>(null);
  const [screening, setScreening] = useState<ScreeningSession | null>(null);
  const [activeLang, setActiveLang] = useState<SupportedLanguage>('en');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!doctor || !patientId) return;
    PatientService.getPatientById(patientId, doctor.uid).then((p) => {
      if (!p) return;
      setPatient(p);
      const screenings = p.screenings || [];
      const s = screeningIdParam 
        ? screenings.find((sc) => sc.id === screeningIdParam) || screenings[0]
        : screenings[0];
      setScreening(s || null);
    });
  }, [doctor, patientId, screeningIdParam]);

  useEffect(() => {
    regionalVoice.setOnStateChange((speaking) => {
      setIsPlayingAudio(speaking);
    });
  }, []);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setActiveLang(lang);
    regionalVoice.stop();
    if (wrapperRef.current) {
      applyLanguageToDOM(wrapperRef.current, lang);
    }
  };

  const handlePlayFullReport = async () => {
    if (isPlayingAudio) {
      regionalVoice.stop();
      return;
    }
    if (!screening) return;
    const sihData = computeSihEnhancements(screening, patient);
    const narrative = getFullReportSpokenNarrative(patient, screening, sihData, activeLang);
    await regionalVoice.speak(narrative, activeLang);
  };

  const tDict = translations[activeLang];

  return (
    <div ref={wrapperRef} className="report-layout-wrapper">
      
      {/* Top Floating / Docked Global Multilingual Bar (No-Print) */}
      <div className="no-print max-w-5xl mx-auto mb-2 bg-slate-900 text-white p-2.5 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm border border-slate-800">
        
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span>Whole Report Language / रिपोर्ट भाषा / અહેવાલ ભાષા:</span>
          </span>
          <div className="inline-flex rounded bg-slate-800 p-0.5 border border-slate-700">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${activeLang === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-300 hover:text-white'}`}
            >
              English
            </button>
            <button
              onClick={() => handleLanguageChange('hi')}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${activeLang === 'hi' ? 'bg-teal-500 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'}`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => handleLanguageChange('gu')}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${activeLang === 'gu' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'}`}
            >
              ગુજરાતી
            </button>
          </div>
        </div>

        {/* Global Readout Button */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handlePlayFullReport}
            className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 transition-all shadow-xs ${
              isPlayingAudio ? 'bg-rose-600 text-white animate-pulse' : 'bg-teal-600 text-white hover:bg-teal-500'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isPlayingAudio ? tDict.speaking : tDict.readFullReport}</span>
          </button>
          {isPlayingAudio && (
            <button
              onClick={() => regionalVoice.stop()}
              className="px-2 py-1.5 text-xs font-bold rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center gap-1"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>{tDict.stopAudio}</span>
            </button>
          )}
        </div>

      </div>

      {/* Existing Clinical Report */}
      {children}

      {/* SIH 25 Enhancement Suite */}
      {screening && (
        <div className="max-w-5xl mx-auto mt-4 print:mt-2 print:p-0">
          <SihEnhancements screening={screening} patient={patient} />
        </div>
      )}
    </div>
  );
}
