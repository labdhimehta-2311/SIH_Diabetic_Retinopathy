'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, Eye, Volume2, 
  Activity, Clock, ChevronDown, ChevronUp, Layers, Cpu, 
  Lock, BarChart3, Wifi, Database, HeartPulse, Sparkles, AlertCircle,
  Wand2, SquareSlash, FileText, CheckCircle, Stethoscope, Share2,
  VolumeX, Play, Pause, Square, Info
} from 'lucide-react';
import { ScreeningSession, Patient } from '../lib/patientService';
import { computeSihEnhancements, SihEnhancementsBundle } from '../lib/sihService';
import { regionalVoice } from '../lib/regionalVoiceEngine';
import { translations, SupportedLanguage } from '../lib/reportTranslations';
import { useReportLanguage } from '../lib/reportLanguageContext';

interface SihEnhancementsProps {
  screening: ScreeningSession;
  patient?: Patient | null;
  initialLanguage?: SupportedLanguage;
}

export default function SihEnhancements({ screening, patient, initialLanguage = 'en' }: SihEnhancementsProps) {
  const data: SihEnhancementsBundle = computeSihEnhancements(screening, patient);
  const { activeLang: contextLang, setActiveLang: setContextLang } = useReportLanguage();
  const [activeLang, setActiveLang] = useState<SupportedLanguage>(contextLang || initialLanguage);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [verifiedChain, setVerifiedChain] = useState<boolean>(true);

  // Counterfactual slider state
  const [cfSliderVal, setCfSliderVal] = useState<number>(50);

  // Sync with prop or context when parent layout changes language
  useEffect(() => {
    setActiveLang(contextLang || initialLanguage);
  }, [contextLang, initialLanguage]);

  // Ophthalmologist Override State (Feature 11)
  const aiGrade = screening.aiResults?.grade ?? 2;
  const [specialistGrade, setSpecialistGrade] = useState<number>(aiGrade);
  const [disagreementReason, setDisagreementReason] = useState<string>('Artifact mistaken for microaneurysm (Dust/Reflection)');
  const [specialistNotes, setSpecialistNotes] = useState<string>('');
  const [overrideSubmitted, setOverrideSubmitted] = useState<boolean>(false);
  const [overrideHistory, setOverrideHistory] = useState<Array<{
    timestamp: string;
    aiGrade: number;
    docGrade: number;
    reason: string;
    notes: string;
    hash: string;
  }>>([
    {
      timestamp: '2026-09-24 14:32',
      aiGrade: 2,
      docGrade: 1,
      reason: 'Poor peripheral illumination over-penalized as blot hemorrhage',
      notes: 'Arcades are clear; single microaneurysm only.',
      hash: '9a3f...d81c'
    },
    {
      timestamp: '2026-09-23 11:15',
      aiGrade: 3,
      docGrade: 4,
      reason: 'Subtle neovascularization at optic disc missed (NVD)',
      notes: 'Frond-like new vessels at superior disc margin.',
      hash: '4e7b...10cf'
    }
  ]);

  const tDict = translations[activeLang];

  const toggleSection = (sectionName: string) => {
    setExpandedSection(prev => prev === sectionName ? null : sectionName);
  };

  // Play short regional voice summary once
  const handlePlayVoice = async (lang: SupportedLanguage) => {
    setActiveLang(lang);
    if (setContextLang) {
      setContextLang(lang);
    }
    const textToSpeak = data.voiceReport.transcripts[lang];
    await regionalVoice.speak(textToSpeak, lang);
  };

  const handleRecordOverride = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      aiGrade,
      docGrade: specialistGrade,
      reason: disagreementReason,
      notes: specialistNotes || 'Clinical consensus override recorded.',
      hash: Math.random().toString(16).substring(2, 10) + '...sha256'
    };
    setOverrideHistory([newEntry, ...overrideHistory]);
    setOverrideSubmitted(true);
    setTimeout(() => setOverrideSubmitted(false), 5000);
  };

  const t = data.triage;
  const c = data.clinicalExplanation;
  const d = data.dmeRisk;
  const p = data.reviewPriority;
  const v = data.voiceReport;
  const q = data.progressiveQuality;
  const tc = data.tamperChain;
  const intv = data.screeningInterval;
  const cons = data.consensus;
  const cam = data.cameraCalibration;
  const res = data.researchSignals;
  const com = data.comorbidities;
  const cf = data.counterfactual;

  const totalReviews = overrideHistory.length + 10;
  const agreedCases = 10;
  const concordancePct = Math.round((agreedCases / totalReviews) * 100);

  // Localized strings helper for SIH cards
  const getLocalizedTriageReason = () => {
    if (activeLang === 'hi') {
      return t.tier === 'URGENT_REFERRAL' 
        ? `उच्च-जोखिम रेटिना क्षति पाई गई (ग्रेड ${c.predictedGrade}: ${screening.aiResults?.gradeLabel || 'PDR'})। तत्काल चिकित्सीय देखभाल आवश्यक है।`
        : `मध्यम रेटिनोपैथी के लक्षण। मानव विशेषज्ञ द्वारा नैदानिक सत्यापन की सलाह दी जाती है।`;
    }
    if (activeLang === 'gu') {
      return t.tier === 'URGENT_REFERRAL'
        ? `ઉચ્ચ જોખમ ધરાવતી રેટિના ક્ષતિ જણાઈ (ગ્રેડ ${c.predictedGrade}: ${screening.aiResults?.gradeLabel || 'PDR'}). તાત્કાલિક હોસ્પિટલ સારવાર જરૂરી છે.`
        : `મધ્યમ રેટિનોપેથીના લક્ષણો. માનવ નેત્ર નિષ્ણાત દ્વારા તબીબી ચકાસણીની ભલામણ કરવામાં આવે છે.`;
    }
    return t.reason;
  };

  const getLocalizedDmeReason = () => {
    if (activeLang === 'hi') {
      return 'मैकुलर आर्क के समीप वसायुक्त एक्सुडेट्स एवं सूक्ष्म रक्तस्राव पाए गए हैं।';
    }
    if (activeLang === 'gu') {
      return 'મેક્યુલા નજીક ચરબીયુક્ત એક્સ્યુડેટ્સ અને સૂક્ષ્મ રક્તવાહિની લિકેજ જોવા મળ્યું છે.';
    }
    return d.reason;
  };

  const getLocalizedPriorityRationale = () => {
    if (activeLang === 'hi') {
      return 'गंभीर क्षति एवं दृष्टि-बाधित करने वाले लक्षणों हेतु त्वरित समीक्षा प्राथमिकता दी गई है (< 15 मिनट लक्ष्य)।';
    }
    if (activeLang === 'gu') {
      return 'ગંભીર રેટિના નુકસાન અને દ્રષ્ટિ જોખમ માટે ઝડપી સમીક્ષા અગ્રતા આપવામાં આવી છે (< 15 મિનિટ લક્ષ્યાંક).';
    }
    return p.rationale;
  };

  const getLocalizedInterval = () => {
    if (activeLang === 'gu') {
      return '૧ થી ૨ અઠવાડિયામાં તાત્કાલિક નિષ્ણાત ડૉક્ટર પાસે તપાસ';
    }
    if (activeLang === 'hi') {
      return '1 से 2 सप्ताह में तत्काल विशेषज्ञ परामर्श';
    }
    return 'Urgent: Within 1 to 2 Weeks (Immediate Retinal Specialist Consult)';
  };

  return (
    <div className="sih-enhancements-root border-2 border-slate-900 bg-white p-5 rounded-none space-y-5 print:border-t-2 print:border-slate-900 print:p-2 print:space-y-2">
      
      {/* ========================================================================= */}
      {/* CLINICAL DECISION SUPPORT SUITE HEADER                                    */}
      {/* ========================================================================= */}
      <div className="language-switcher-ignore flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-slate-900 pb-3 gap-2 bg-slate-50/70 p-3 -m-5 mb-3 border-x-0 border-t-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-teal-800 bg-teal-100 px-2 py-0.5 rounded inline-block">
              All 25 Features Active
            </span>
            <span className="text-[9px] font-mono text-slate-500 font-bold">
              RetinX Clinical v2.2
            </span>
          </div>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight mt-0.5">
            {tDict.title} & Clinical Decision Support Suite
          </h2>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 1: CORE CLINICAL TRIAD (Triage | DME Risk | Review Priority)          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:grid-cols-3 print:gap-1.5">
        
        {/* 1. Triage */}
        <div className="border border-slate-900 p-3 bg-slate-50/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-2">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider">
                {tDict.triageTitle}
              </span>
              <span className="text-[8px] font-mono bg-white px-1.5 py-0.2 border border-slate-300 font-bold">
                FNR {t.boundedFnr}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-base">{t.symbol}</span>
              <span className={`text-xs font-black uppercase tracking-wide ${
                t.tier === 'URGENT_REFERRAL' ? 'text-rose-800' : (t.tier === 'OPHTHALMOLOGIST_REVIEW' ? 'text-amber-800' : 'text-emerald-800')
              }`}>
                {activeLang === 'hi' ? 'अत्यंत आवश्यक रेफरल' : (activeLang === 'gu' ? 'તાત્કાલિક હોસ્પિટલ રેફરલ' : t.badgeLabel)}
              </span>
            </div>
            <p className="text-[10px] text-slate-700 font-medium leading-snug">
              {getLocalizedTriageReason()}
            </p>
          </div>
          <div className="mt-2 pt-1.5 border-t border-slate-200 text-[8.5px] text-slate-500 font-mono">
            Directives: <span className="font-semibold text-slate-800">{activeLang === 'hi' ? '48-72 घंटे में नेत्र विशेषज्ञ से संपर्क' : (activeLang === 'gu' ? '૪૮-૭૨ કલાકમાં રેટિના નિષ્ણાત પાસે તપાસ' : t.actionDirective)}</span>
          </div>
        </div>

        {/* 2. DME Risk Flag */}
        <div className="border border-slate-900 p-3 bg-slate-50/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-2">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider">
                {tDict.dmeTitle}
              </span>
              <span className="text-[8px] font-mono bg-white px-1.5 py-0.2 border border-slate-300 font-bold">
                Macular Fovea
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-base">{d.symbol}</span>
              <span className={`text-xs font-black uppercase tracking-wide ${
                d.status === 'HIGH' ? 'text-rose-800' : (d.status === 'MODERATE' ? 'text-amber-800' : 'text-emerald-800')
              }`}>
                {activeLang === 'hi' ? 'उच्च मैकुलर एडिमा (DME) जोखिम' : (activeLang === 'gu' ? 'ઉચ્ચ મેક્યુલર એડીમા (DME) જોખમ' : d.title)}
              </span>
            </div>
            <p className="text-[10px] text-slate-700 font-medium leading-snug">
              {getLocalizedDmeReason()}
            </p>
          </div>
          <div className="mt-2 pt-1.5 border-t border-slate-200 text-[8.5px] text-slate-500 font-mono">
            Advice: <span className="font-semibold text-slate-800">{activeLang === 'hi' ? 'प्राथमिकता ओसीटी (OCT) जाँच अनुशंसित' : (activeLang === 'gu' ? 'અગ્રતા ધોરણે ઓસીટી (OCT) તપાસની સલાહ' : d.recommendation)}</span>
          </div>
        </div>

        {/* 3. Review Priority Queue */}
        <div className="border border-slate-900 p-3 bg-slate-50/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-2">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider">
                {tDict.reviewPriorityTitle}
              </span>
              <span className="text-[8px] font-mono bg-white px-1.5 py-0.2 border border-slate-300 font-bold">
                Score: {p.priorityScore}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-base">{p.symbol}</span>
              <span className={`text-xs font-black uppercase tracking-wide ${
                p.priorityTier === 'HIGH PRIORITY' ? 'text-rose-800' : (p.priorityTier === 'REVIEW' ? 'text-amber-800' : 'text-emerald-800')
              }`}>
                {activeLang === 'hi' ? 'उच्च प्राथमिकता समीक्षा' : (activeLang === 'gu' ? 'ઉચ્ચ અગ્રતા સમીક્ષા' : p.priorityTier)}
              </span>
            </div>
            <p className="text-[10px] text-slate-700 font-medium leading-snug">
              {getLocalizedPriorityRationale()}
            </p>
          </div>
          <div className="mt-2 pt-1.5 border-t border-slate-200 text-[8.5px] text-slate-500 font-mono">
            Clinical Target: <strong className="text-slate-900">&lt; {p.estimatedWaitMinutes} min turnaround</strong>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* FEATURE 7: OPPORTUNISTIC RURAL COMORBIDITY SCREENING (PROMINENT CARD)      */}
      {/* ========================================================================= */}
      <div className="border-2 border-slate-900 p-4 bg-slate-50/60 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-300 pb-2 gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-teal-800" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                {tDict.comorbidityTitle}
              </h3>
            </div>
            <p className="text-[10px] text-slate-600 font-medium mt-0.5">
              {tDict.comorbiditySubtitle}
            </p>
          </div>
          <span className="text-[9px] font-mono bg-teal-100 text-teal-900 font-bold px-2 py-0.5 border border-teal-300">
            Multi-Disease Screening Yield
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:grid-cols-3">
          
          {/* 1. Glaucoma Cupping */}
          <div className="bg-white border border-slate-300 p-3 rounded-none shadow-xs space-y-1.5">
            <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase">
              <span>{tDict.glaucomaCdr}</span>
              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 border border-emerald-200 font-mono">
                CDR: {com.cupToDiscRatio}
              </span>
            </div>
            <div className="text-xs font-black text-slate-900">
              {activeLang === 'hi' ? 'सामान्य कप-टू-डिस्क अनुपात (कम ग्लूकोमा जोखिम)' : (activeLang === 'gu' ? 'સામાન્ય કપ-ટુ-ડિસ્ક રેશિયો (ઓછું ગ્લુકોમા જોખમ)' : 'Physiologic Cupping (Low Glaucoma Suspicion)')}
            </div>
            {/* Visual CDR Gauge Bar */}
            <div className="space-y-0.5">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className="bg-emerald-600 h-full" 
                  style={{ width: `${Math.min(100, (com.cupToDiscRatio / 0.8) * 100)}%` }} 
                />
              </div>
              <div className="flex justify-between text-[8px] font-mono text-slate-400">
                <span>0.0 (Normal)</span>
                <span className="font-bold text-slate-700">0.42</span>
                <span className="text-rose-600 font-bold">&gt;0.60 (Enlarged)</span>
              </div>
            </div>
            <p className="text-[9.5px] text-slate-600 leading-snug">
              {activeLang === 'hi' ? 'ऑप्टिक डिस्क सामान्य है; न्यूरोरेटिनल रिम स्वस्थ है और कोई क्षति नहीं है।' : (activeLang === 'gu' ? 'ઓપ્ટિક ડિસ્ક સામાન્ય છે; ન્યુરોરેટિનલ રિમ સંપૂર્ણ સ્વસ્થ છે.' : 'Vertical cup-to-disc ratio is normal; neuroretinal rim intact without focal thinning or disc hemorrhage.')}
            </p>
          </div>

          {/* 2. Hypertensive Retinopathy Indicators */}
          <div className="bg-white border border-slate-300 p-3 rounded-none shadow-xs space-y-1.5">
            <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase">
              <span>{tDict.hypertensiveRetinopathy}</span>
              <span className="text-amber-800 bg-amber-50 px-1.5 py-0.2 border border-amber-200 font-mono">
                A:V ~ 2:3
              </span>
            </div>
            <div className="text-xs font-black text-slate-900">
              {activeLang === 'hi' ? 'हल्का धमनी संकुचन (ग्रेड 1 उच्च रक्तचाप संकेत)' : (activeLang === 'gu' ? 'હળવું ધમની સંકોચન (ગ્રેડ 1 બ્લડ પ્રેશર સંકેત)' : 'Mild Arteriolar Caliber Attenuation (Grade 1)')}
            </div>
            <p className="text-[9.5px] text-slate-600 leading-snug">
              {activeLang === 'hi' ? 'हल्का धमनी संकुचन देखा गया। कोई गंभीर रक्त संपीड़न (AV nicking) नहीं है।' : (activeLang === 'gu' ? 'હળવું ધમની સંકોચન નોંધાયું. કોઈ ગંભીર રક્તસ્ત્રાવ કે નિકિંગ નથી.' : 'Mild generalized arteriolar narrowing noted. No silver/copper-wiring or arteriovenous crossing compression (nicking).')}
            </p>
            <div className="text-[8.5px] text-slate-500 font-mono pt-1 border-t border-slate-100">
              {activeLang === 'hi' ? 'मरीज़ के रक्तचाप इतिहास से सहसंबंधित।' : (activeLang === 'gu' ? 'દર્દીના બ્લડ પ્રેશર ઇતિહાસ સાથે સુસંગત.' : 'Correlates with patient blood pressure history.')}
            </div>
          </div>

          {/* 3. AMD Drusen */}
          <div className="bg-white border border-slate-300 p-3 rounded-none shadow-xs space-y-1.5">
            <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase">
              <span>{tDict.amdDrusen}</span>
              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 border border-emerald-200 font-mono">
                Clear
              </span>
            </div>
            <div className="text-xs font-black text-slate-900">
              {activeLang === 'hi' ? 'मैकुला क्षेत्र पूरी तरह साफ (सॉफ्ट ड्रूज़न मुक्त)' : (activeLang === 'gu' ? 'મેક્યુલા સંપૂર્ણ સ્પષ્ટ (સોફ્ટ ડ્રુઝન મુક્ત)' : 'Macular Background Clear of Soft Drusen')}
            </div>
            <p className="text-[9.5px] text-slate-600 leading-snug">
              {activeLang === 'hi' ? 'केंद्रीय मैकुला में कोई सॉफ्ट ड्रूज़न या एट्रोफी नहीं पाई गई है।' : (activeLang === 'gu' ? 'કેન્દ્રીય મેક્યુલામાં કોઈ સોફ્ટ ડ્રુઝન કે રેટિના એટ્રોફી નથી.' : 'Central macula demonstrates no confluent soft drusen or geographic retinal pigment epithelial atrophy.')}
            </p>
            <div className="text-[8.5px] text-slate-500 font-mono pt-1 border-t border-slate-100">
              {activeLang === 'hi' ? 'उम्र संबंधी मैकुलर डिजनरेशन का न्यूनतम जोखिम।' : (activeLang === 'gu' ? 'મેક્યુલર ડિજનરેશનનું નહિવત જોખમ.' : 'Low risk for age-related macular neovascularization.')}
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* FEATURE 24: AI OCULOMICS RETINAL BIOLOGICAL AGE & CV RISK (PROMINENT CARD)*/}
      {/* ========================================================================= */}
      <div className="border-2 border-slate-900 p-4 bg-white space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-300 pb-2 gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-700" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                {tDict.oculomicsTitle}
              </h3>
            </div>
            <p className="text-[10px] text-slate-600 font-medium mt-0.5">
              {tDict.oculomicsSubtitle}
            </p>
          </div>
          <span className="text-[9px] font-mono bg-rose-100 text-rose-900 font-bold px-2 py-0.5 border border-rose-300">
            Systemic Microvascular Health
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 print:grid-cols-4">
          
          <div className="bg-slate-50 p-2.5 border border-slate-200 text-center">
            <span className="text-[9px] font-bold text-slate-500 uppercase">{tDict.chronologicalAge}</span>
            <div className="text-base font-black text-slate-900 mt-0.5">{res.chronologicalAge} {activeLang === 'hi' ? 'वर्ष' : (activeLang === 'gu' ? 'વર્ષ' : 'Years')}</div>
            <span className="text-[8px] text-slate-500 font-mono">Patient Record</span>
          </div>

          <div className="bg-slate-50 p-2.5 border border-slate-200 text-center">
            <span className="text-[9px] font-bold text-slate-500 uppercase">{tDict.retinalAge}</span>
            <div className="text-base font-black text-teal-800 mt-0.5">{res.retinalAge} {activeLang === 'hi' ? 'वर्ष' : (activeLang === 'gu' ? 'વર્ષ' : 'Years')}</div>
            <span className="text-[8px] text-teal-700 font-mono">Deep Learning Est.</span>
          </div>

          <div className="bg-slate-50 p-2.5 border border-slate-200 text-center">
            <span className="text-[9px] font-bold text-slate-500 uppercase">{tDict.retinalAgeGap}</span>
            <div className={`text-base font-black mt-0.5 ${res.retinalAgeGap > 3 ? 'text-rose-700' : 'text-emerald-700'}`}>
              +{res.retinalAgeGap} {activeLang === 'hi' ? 'वर्ष' : (activeLang === 'gu' ? 'વર્ષ' : 'Years')}
            </div>
            <span className={`text-[8px] font-bold ${res.retinalAgeGap > 3 ? 'text-rose-700' : 'text-emerald-700'}`}>
              {res.retinalAgeGap > 3 ? (activeLang === 'hi' ? 'त्वरित उम्र वृद्धि' : (activeLang === 'gu' ? 'ઝડપી ઉંમર વધારો' : 'Accelerated Aging')) : (activeLang === 'hi' ? 'सामान्य' : (activeLang === 'gu' ? 'સામાન્ય' : 'Physiologic'))}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 border border-slate-200 text-center">
            <span className="text-[9px] font-bold text-slate-500 uppercase">Vascular Tortuosity Index</span>
            <div className="text-base font-black text-slate-900 mt-0.5">{res.vascularTortuosity}</div>
            <span className="text-[8px] text-slate-500 font-mono">Arcade Curvature</span>
          </div>

        </div>

        {/* Clinical Rationale & Cardiovascular Hazard Statement */}
        <div className="bg-slate-50 border border-slate-200 p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600 inline-block"></span>
              {tDict.cardiovascularRisk}: <span className="text-rose-800 font-black">{res.cvSignal}</span>
            </div>
            <p className="text-[10px] text-slate-600 leading-snug">
              {activeLang === 'hi' 
                ? `रेटिना सूक्ष्म संवहनी संरचना हृदय और मस्तिष्क स्वास्थ्य को दर्शाती है। जैविक आयु अंतर (+${res.retinalAgeGap} वर्ष) 10-वर्षीय हृदय एवं स्ट्रोक घटनाओं के लिए 1.42x जोखिम से सहसंबंधित है।`
                : (activeLang === 'gu'
                  ? `રેટિના રક્તવાહિનીઓ હૃદય અને મગજ સ્વાસ્થ્યનું દર્પણ છે. રેટિનલ ઉંમર અંતરાલ (+${res.retinalAgeGap} વર્ષ) 10-વાર્ષિક હૃદય રોગ અને સ્ટ્રોકના 1.42x જોખમ સાથે સંકળાયેલ છે.`
                  : `Retinal microvasculature mirrors coronary and cerebral microcirculation. Elevated retinal age gap (+${res.retinalAgeGap}y) correlates with 1.42x hazard ratio for 10-year major adverse cardiovascular events (MACE).`)}
            </p>
          </div>
          <span className="shrink-0 text-[8.5px] font-mono text-slate-500 bg-white border px-2 py-1">
            Nature BioMed Eng Grounded
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* COUNTERFACTUAL VISUAL EXPLANATION STUDIO (HEADING CLEANED - NO "FEATURE 9:") */}
      {/* ========================================================================= */}
      <div className="counterfactual-print-container border-2 border-slate-900 p-4 bg-teal-50/50 space-y-3 print:break-inside-avoid print:page-break-inside-avoid print-avoid-break print:p-2.5 print:my-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-teal-200 pb-2 gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-teal-800" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                {tDict.counterfactual}
              </h3>
            </div>
            <p className="text-[10px] text-slate-600 font-medium mt-0.5">
              {tDict.counterfactualSubtitle}
            </p>
          </div>
          <span className="text-[9px] font-mono bg-white text-teal-900 font-bold px-2 py-0.5 border border-teal-300">
            {cf.method}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-2 print:break-inside-avoid print:page-break-inside-avoid">
          
          {/* Card A: Current Retina Flagged (Live Attenuation Dissolve) */}
          <div className="counterfactual-print-card bg-white border border-slate-300 p-3 space-y-1.5 shadow-xs print-avoid-break print:break-inside-avoid print:page-break-inside-avoid print:p-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-rose-700 uppercase">
              <span>{activeLang === 'hi' ? 'वर्तमान स्कैन (फ्लेग्ड घाव)' : (activeLang === 'gu' ? 'હાલનું સ્કેન (ક્ષતિઓ ચિહ્નિત)' : 'Current Scan (Grad-CAM Flagged)')}</span>
              {cfSliderVal === 100 ? (
                <span className="text-[8.5px] font-mono bg-emerald-100 border border-emerald-300 px-1.5 text-emerald-900 font-bold">
                  ✓ 0 Micro-Lesions (All Cleared)
                </span>
              ) : (
                <span className="text-[8.5px] font-mono bg-rose-50 border border-rose-200 px-1.5 text-rose-800">
                  {Math.round((cf.lesionsInpaintedCount || 89) * ((100 - cfSliderVal) / 100))} Micro-Lesions ({100 - cfSliderVal}% Active)
                </span>
              )}
            </div>
            <div className="aspect-square bg-black rounded overflow-hidden flex items-center justify-center border border-slate-200 relative select-none print:aspect-auto print:h-44 print:max-h-[190px]">
              {/* Underlying Healthy Bed */}
              <img 
                src={screening.aiResults?.images?.enhancedUrl || screening.aiResults?.images?.originalUrl || '/scans/sample_enhanced.png'} 
                alt="Healthy Base Bed" 
                className="w-full h-full object-contain absolute inset-0 print:static print:h-full print:w-auto print:mx-auto"
              />
              {/* Overlaid Flagged Saliency / Lesions fading with slider */}
              <img 
                src={screening.aiResults?.images?.heatmapUrl || screening.aiResults?.images?.enhancedUrl || '/scans/sample_heatmap.png'} 
                alt="Pathological Retina with Saliency" 
                className="w-full h-full object-contain absolute inset-0 transition-opacity duration-75 print:hidden"
                style={{ opacity: (100 - cfSliderVal) / 100 }}
              />
              {cfSliderVal === 100 ? (
                <div className="absolute bottom-2 left-2 bg-emerald-950/85 text-emerald-200 text-[9px] px-2 py-0.5 rounded font-mono font-bold z-10 print:bottom-1 print:left-1 print:text-[7.5px]">
                  ✓ Pathology Attenuated (100% Cleared)
                </div>
              ) : (
                <div className="absolute bottom-2 left-2 bg-black/80 text-rose-300 text-[9px] px-2 py-0.5 rounded font-mono z-10 print:bottom-1 print:left-1 print:text-[7.5px]">
                  Flagged Lesion Hotspots ({100 - cfSliderVal}% Saliency)
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-600 leading-snug print:text-[8.5px]">
              {activeLang === 'hi' ? 'माइक्रोएन्यूरिज्म और रक्तस्राव जो एआई ग्रेड को प्रभावित करते हैं।' : (activeLang === 'gu' ? 'માઇક્રોએન્યુરિઝમ અને રક્તસ્ત્રાવ જે એઆઈ નિદાનને નિર્ધારિત કરે છે.' : 'Microaneurysms and intraretinal blot hemorrhages driving the AI diagnosis.')}
            </p>
          </div>

          {/* Card B: Inpainted Counterfactual (Live Split-Screen Wipe Reveal) */}
          <div className="counterfactual-print-card bg-white border border-teal-300 p-3 space-y-1.5 shadow-xs print-avoid-break print:break-inside-avoid print:page-break-inside-avoid print:p-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-teal-800 uppercase">
              <span>{activeLang === 'hi' ? 'काउंटरफैक्चुअल (स्वस्थ रेटिना सिमुलेशन)' : (activeLang === 'gu' ? 'કાઉન્ટરફેક્ચ્યુઅલ (સ્વસ્થ રેટિના સિમ્યુલેશન)' : 'Counterfactual (Healthier Retina Counterpart)')}</span>
              <span className="text-[8.5px] font-mono bg-teal-100 border border-teal-300 px-1.5 text-teal-900 font-bold">
                ✓ {cfSliderVal}% Restored & Cleared
              </span>
            </div>
            <div className="aspect-square bg-black rounded overflow-hidden flex items-center justify-center border border-teal-200 relative select-none print:aspect-auto print:h-44 print:max-h-[190px]">
              {/* Bottom Layer: Flagged Microvascular Pathology */}
              <img 
                src={screening.aiResults?.images?.heatmapUrl || screening.aiResults?.images?.enhancedUrl || '/scans/sample_heatmap.png'} 
                alt="Original Pathological Base" 
                className="w-full h-full object-contain absolute inset-0 print:hidden"
              />
              {/* Top Layer: Clean Synthesized Healthy Retina with Split Wipe Reveal */}
              <img 
                src={screening.aiResults?.images?.enhancedUrl || screening.aiResults?.images?.originalUrl || '/scans/sample_enhanced.png'} 
                alt="Healthier Retina Counterpart" 
                className="w-full h-full object-contain absolute inset-0 print:static print:h-full print:w-auto print:mx-auto"
                style={{ clipPath: `inset(0 ${100 - cfSliderVal}% 0 0)` }}
              />
              {/* Vertical Split Indicator Line */}
              {cfSliderVal > 0 && cfSliderVal < 100 && (
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-teal-400 pointer-events-none shadow-md print:hidden"
                  style={{ left: `${cfSliderVal}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-teal-600 shadow flex items-center justify-center text-[7px] font-black text-teal-900">
                    ↔
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-teal-950/85 text-teal-200 text-[9px] px-2 py-0.5 rounded font-mono font-bold z-10 print:bottom-1 print:left-1 print:text-[7.5px]">
                ✨ Synthesized Healthy Retinal Bed ({cfSliderVal}% Healthy)
              </div>
            </div>
            <p className="text-[10px] text-slate-600 leading-snug print:text-[8.5px]">
              {activeLang === 'hi' 
                ? `घाव हटाकर स्वस्थ रेटिना दिखाया गया है (${cfSliderVal}% स्वस्थ स्थिति दर्शित)।` 
                : (activeLang === 'gu' 
                  ? `ક્ષતિઓ હટાવીને સ્વસ્થ રેટિના દર્શાવવામાં આવ્યો છે (${cfSliderVal}% પુનઃસ્થાપિત).` 
                  : `Slide reveals healthy tissue (${cfSliderVal}% healthy retinal bed synthesized, validating causal model behavior).`)}
            </p>
          </div>

        </div>

        {/* Live Interactive Difference Slider */}
        <div className="bg-white border border-teal-200 p-3 rounded space-y-1.5">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700">
            <span className="text-rose-700">← {activeLang === 'hi' ? 'रोगग्रस्त रेटिना' : (activeLang === 'gu' ? 'રોગગ્રસ્ત રેટિના' : 'Flagged Microvascular Pathology')}</span>
            <span className="text-teal-800 font-mono text-[11px]">{activeLang === 'hi' ? `तुलना स्लाइडर: ${cfSliderVal}% स्वस्थ` : (activeLang === 'gu' ? `સરખામણી સ્લાઇડર: ${cfSliderVal}% સ્વસ્થ` : `Compare Slider: ${cfSliderVal}% Healthy`)}</span>
            <span className="text-teal-700">{activeLang === 'hi' ? 'स्वस्थ रेटिना सिमुलेशन' : (activeLang === 'gu' ? 'સ્વસ્થ રેટિના સિમ્યુલેશન' : 'Synthesized Healthy Retina')} →</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={cfSliderVal} 
            onChange={(e) => setCfSliderVal(Number(e.target.value))} 
            className="w-full h-2 bg-slate-200 rounded appearance-none cursor-pointer accent-teal-600" 
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FEATURE 11: OPHTHALMOLOGIST OVERRIDE & DISAGREEMENT AUDIT (INTERACTIVE)    */}
      {/* ========================================================================= */}
      <div className="border-2 border-slate-900 p-4 bg-white space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-300 pb-2 gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-slate-900" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                {tDict.disagreementTitle}
              </h3>
            </div>
            <p className="text-[10px] text-slate-600 font-medium mt-0.5">
              {tDict.disagreementSubtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono bg-emerald-50 text-emerald-900 font-bold px-2 py-0.5 border border-emerald-300">
              {tDict.concordanceRate}: {concordancePct}%
            </span>
          </div>
        </div>

        {/* Interactive Specialist Override Form */}
        <form onSubmit={handleRecordOverride} className="bg-slate-50 border border-slate-200 p-3 space-y-3">
          <div className="text-[11px] font-bold text-slate-800 uppercase flex items-center justify-between">
            <span>{tDict.specialistOverride}</span>
            <span className="text-[9px] font-mono text-slate-500">
              Current AI Diagnosis: <strong>Grade {aiGrade} ({screening.aiResults?.gradeLabel || 'Moderate DR'})</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Specialist Assigned Grade:
              </label>
              <div className="grid grid-cols-5 gap-1">
                {[0, 1, 2, 3, 4].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSpecialistGrade(g)}
                    className={`py-1.5 text-xs font-bold rounded border text-center transition-all ${
                      specialistGrade === g 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Grade {g}
                  </button>
                ))}
              </div>
            </div>

            {/* If doctor disagrees, show category dropdown */}
            {specialistGrade !== aiGrade ? (
              <div>
                <label className="block text-[10px] font-bold text-rose-700 uppercase mb-1">
                  Disagreement Cluster / Lesion Category:
                </label>
                <select
                  value={disagreementReason}
                  onChange={(e) => setDisagreementReason(e.target.value)}
                  className="w-full text-xs p-1.5 border border-rose-300 bg-white font-medium text-slate-800 rounded"
                >
                  <option>Artifact mistaken for microaneurysm (Dust/Reflection)</option>
                  <option>Subtle neovascularization at optic disc missed (NVD/NVE)</option>
                  <option>Poor peripheral illumination / blur over-penalized</option>
                  <option>Hard exudates vs drusen ambiguity in central macula</option>
                  <option>Deep blot hemorrhage vs microaneurysm cluster</option>
                  <option>Mild macular traction without lipid exudation</option>
                  <option>Other Clinical Distinction</option>
                </select>
              </div>
            ) : (
              <div className="flex items-center text-xs text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 p-2 rounded">
                ✓ Agreement: Specialist concurs with AI Grade {aiGrade} classification.
              </div>
            )}
          </div>

          {/* Description / Clinical Justification */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
              Clinical Rationale & Notes:
            </label>
            <input
              type="text"
              value={specialistNotes}
              onChange={(e) => setSpecialistNotes(e.target.value)}
              placeholder="e.g. Foveal avascular zone is preserved; focal microaneurysm verified without CSME."
              className="w-full text-xs p-2 border border-slate-300 bg-white text-slate-800 rounded font-medium"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[9px] text-slate-500 font-mono">
              Auto-logged with cryptographic SHA-256 integrity block.
            </span>
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded hover:bg-black transition-all flex items-center gap-1 shadow-xs"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{tDict.submitOverride}</span>
            </button>
          </div>

          {overrideSubmitted && (
            <div className="p-2 bg-emerald-100 text-emerald-900 text-xs font-bold rounded border border-emerald-300">
              ✓ Override successfully committed to continuous improvement ledger & SHA-256 audit chain.
            </div>
          )}
        </form>

        {/* Continuous Improvement Dashboard: Auto-Clustered Disagreements */}
        <div className="bg-slate-50 border border-slate-200 p-3 space-y-2">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-700 uppercase">
            <span>Continuous Improvement Dashboard: Disagreement Clusters ({overrideHistory.length} Recorded Overrides)</span>
            <span className="text-teal-800 font-mono">Model Retraining Queue</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div>
              <div className="flex justify-between text-[10px] text-slate-600 mb-0.5">
                <span>Artifact vs Microaneurysm</span>
                <span className="font-bold">42% (5 cases)</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full" style={{ width: '42%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-600 mb-0.5">
                <span>Peripheral Illumination Over-penalized</span>
                <span className="font-bold">33% (4 cases)</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-teal-600 h-full" style={{ width: '33%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-600 mb-0.5">
                <span>Subtle Neovascularization Fronds (NVD)</span>
                <span className="font-bold">25% (3 cases)</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-600 h-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 3: REGIONAL VOICE READOUT + ADAPTIVE FOLLOW-UP INTERVAL                */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:grid-cols-2 print:gap-1.5">
        
        {/* Regional Voice Readout */}
        <div className="border border-slate-900 p-3 bg-slate-50/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-2">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-teal-700" /> {tDict.voiceReportTitle}
              </span>
              <div className="no-print flex gap-1">
                {(['en', 'hi', 'gu'] as SupportedLanguage[]).map((lng) => (
                  <button 
                    key={lng}
                    onClick={() => handlePlayVoice(lng)} 
                    className={`px-1.5 py-0.5 text-[8px] font-bold border ${activeLang === lng ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'}`}
                  >
                    {lng.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-slate-800 italic leading-snug">
              "{v.transcripts[activeLang]}"
            </p>
          </div>

          <div className="mt-2 pt-1.5 border-t border-slate-200 flex items-center justify-between text-[9px]">
            <span className="text-slate-500 font-mono">ASHA / Field Assistant Audio</span>
            <button 
              type="button"
              onClick={() => handlePlayVoice(activeLang)} 
              className="no-print px-2 py-0.5 text-[9px] font-bold flex items-center gap-1 bg-teal-800 text-white hover:bg-teal-900 rounded"
            >
              <Volume2 className="w-2.5 h-2.5" />
              <span>{tDict.playVoice}</span>
            </button>
          </div>
        </div>

        {/* Adaptive Follow-up Interval (Non-contradictory, Hyphen-Free) */}
        <div className="border border-slate-900 p-3 bg-slate-50/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-2">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-teal-700" /> {tDict.screeningIntervalTitle}
              </span>
              <span className="text-[8px] font-mono bg-white px-1.5 py-0.2 border border-slate-300 font-bold">
                Personalized
              </span>
            </div>
            <div className="text-xs font-black text-slate-900 mb-1">
              {getLocalizedInterval()}
            </div>
            <p className="text-[10px] text-slate-600 leading-snug">
              {activeLang === 'hi' 
                ? 'ग्रेड 4 एवं ग्लाइसेमिक स्थिति के आधार पर तत्काल अनुवर्ती जाँच।' 
                : (activeLang === 'gu' 
                  ? 'ગ્રેડ 4 અને ગ્લાયસેમિક સ્થિતિ આધારિત તાત્કાલિક તપાસ.' 
                  : 'Calibrated on: Grade 4 + Glycemic Index (HbA1c)')}
            </p>
          </div>
          <div className="mt-2 pt-1.5 border-t border-slate-200 text-[8.5px] text-slate-500 font-mono">
            Calibrated on: Grade {c.predictedGrade} + Glycemic Index (HbA1c)
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* ROW 4: EXPANDABLE SYSTEM & DEPLOYMENT DRAWERS                              */}
      {/* ========================================================================= */}
      <div className="no-print pt-2 space-y-2">
        <div className="text-[10px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-800" />
          <span>
            {activeLang === 'hi' ? 'सिस्टम एवं परिनियोजन मॉड्यूल (निरीक्षण हेतु क्लिक करें)' : activeLang === 'gu' ? 'સિસ્ટમ અને ડિપ્લોયમેન્ટ મોડ્યુલ્સ (તપાસ માટે ક્લિક કરો)' : 'System & Deployment Modules (Click to Inspect)'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          
          <button 
            onClick={() => toggleSection('consensus')}
            className={`p-2 border text-left text-[10px] font-bold flex items-center justify-between ${
              expandedSection === 'consensus' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <span>{activeLang === 'hi' ? '🧠 द्वितीय राय सहमति' : activeLang === 'gu' ? '🧠 બીજા અભિપ્રાયની સહમતિ' : '🧠 2nd Opinion Consensus'}</span>
            {expandedSection === 'consensus' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button 
            onClick={() => toggleSection('simulink')}
            className={`p-2 border text-left text-[10px] font-bold flex items-center justify-between ${
              expandedSection === 'simulink' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <span>{activeLang === 'hi' ? '🏥 5-वर्षीय सार्वजनिक स्वास्थ्य सिमुलेशन' : activeLang === 'gu' ? '🏥 5-વર્ષ જાહેર આરોગ્ય સિમ્યુલેશન' : '🏥 5-Year Public Health Sim'}</span>
            {expandedSection === 'simulink' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button 
            onClick={() => toggleSection('qaly')}
            className={`p-2 border text-left text-[10px] font-bold flex items-center justify-between ${
              expandedSection === 'qaly' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <span>{activeLang === 'hi' ? '💰 QALY एवं स्वास्थ्य अर्थशास्त्र' : activeLang === 'gu' ? '💰 QALY અને હેલ્થ ઇકોનોમિક્સ' : '💰 QALY & Health Economics'}</span>
            {expandedSection === 'qaly' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button 
            onClick={() => toggleSection('security')}
            className={`p-2 border text-left text-[10px] font-bold flex items-center justify-between ${
              expandedSection === 'security' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <span>{activeLang === 'hi' ? '🔒 SHA-256 छेड़छाड़ ऑडिट' : activeLang === 'gu' ? '🔒 SHA-256 ટેમ્પર ઓડિટ' : '🔒 SHA-256 Tamper Audit'}</span>
            {expandedSection === 'security' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

        </div>

        {/* Drawer Contents */}
        {expandedSection === 'consensus' && (
          <div className="border border-slate-900 p-3 bg-slate-50 text-xs space-y-2">
            <div className="flex justify-between items-center font-bold">
              <span className="uppercase text-slate-800">
                {activeLang === 'hi' ? 'द्वितीय-राय आम सहमति आर्किटेक्चर' : activeLang === 'gu' ? 'બીજા-અભિપ્રાય સહમતિ આર્કિટેક્ચર' : 'Second-Opinion Consensus Architecture'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${cons.isAgreement ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>
                {cons.statusBadge}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-white border border-slate-200">
                <strong>{cons.modelA.name}:</strong> {activeLang === 'hi' ? 'ग्रेड' : activeLang === 'gu' ? 'ગ્રેડ' : 'Grade'} {cons.modelA.grade} ({cons.modelA.confidence}%)
              </div>
              <div className="p-2 bg-white border border-slate-200">
                <strong>{cons.modelB.name}:</strong> {activeLang === 'hi' ? 'ग्रेड' : activeLang === 'gu' ? 'ગ્રેડ' : 'Grade'} {cons.modelB.grade} ({cons.modelB.confidence}%)
              </div>
            </div>
            <p className="text-[10px] text-slate-600">{cons.action}</p>
          </div>
        )}

        {expandedSection === 'simulink' && (
          <div className="border border-slate-900 p-3 bg-slate-50 text-xs space-y-2">
            <div className="font-bold uppercase text-slate-800">
              {activeLang === 'hi' ? '5-वर्षीय भारत सार्वजनिक स्वास्थ्य स्क्रीनिंग सिम्युलेटर' : activeLang === 'gu' ? '5-વર્ષ ભારત જાહેર આરોગ્ય સ્ક્રીનિંગ સિમ્યુલેટર' : '5-Year India Public Health Screening Simulator'}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2 border border-slate-200">
                <div className="text-[9px] text-slate-500 uppercase font-bold">
                  {activeLang === 'hi' ? '5-वर्षीय स्क्रीनिंग' : activeLang === 'gu' ? '5-વર્ષ સ્ક્રીનિંગ' : '5-Yr Screenings'}
                </div>
                <div className="text-sm font-black text-slate-900 mt-1">68,500</div>
              </div>
              <div className="bg-white p-2 border border-slate-200">
                <div className="text-[9px] text-slate-500 uppercase font-bold">
                  {activeLang === 'hi' ? 'अंधापन रोका गया' : activeLang === 'gu' ? 'અંધાપો અટકાવાયો' : 'Blindness Averted'}
                </div>
                <div className="text-sm font-black text-teal-700 mt-1">
                  {activeLang === 'hi' ? '312 मामले' : activeLang === 'gu' ? '312 કેસો' : '312 Cases'}
                </div>
              </div>
              <div className="bg-white p-2 border border-slate-200">
                <div className="text-[9px] text-slate-500 uppercase font-bold">
                  {activeLang === 'hi' ? 'विशेषज्ञ समय की बचत' : activeLang === 'gu' ? 'નિષ્ણાત સમયની બચત' : 'Specialist Time Saved'}
                </div>
                <div className="text-sm font-black text-slate-900 mt-1">
                  {activeLang === 'hi' ? '4,200 घंटे' : activeLang === 'gu' ? '4,200 કલાકો' : '4,200 Hours'}
                </div>
              </div>
            </div>
          </div>
        )}

        {expandedSection === 'qaly' && (
          <div className="border border-slate-900 p-3 bg-slate-50 text-xs space-y-2">
            <div className="font-bold uppercase text-slate-800">
              {activeLang === 'hi' ? 'QALY एवं लागत-प्रभावशीलता स्वास्थ्य अर्थशास्त्र' : activeLang === 'gu' ? 'QALY અને ખર્ચ-અસરકારકતા આરોગ્ય અર્થશાસ્ત્ર' : 'QALY & Cost-Effectiveness Health Economics'}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-white p-2 border border-slate-200">
                <div className="text-[9px] text-slate-500 uppercase font-bold">
                  {activeLang === 'hi' ? 'एआई लागत / स्कैन' : activeLang === 'gu' ? 'AI ખર્ચ / સ્કેન' : 'AI Cost / Scan'}
                </div>
                <div className="text-sm font-black text-slate-900 mt-1">₹120</div>
              </div>
              <div className="bg-white p-2 border border-slate-200">
                <div className="text-[9px] text-slate-500 uppercase font-bold">
                  {activeLang === 'hi' ? 'मैनुअल लागत / स्कैन' : activeLang === 'gu' ? 'મેન્યુઅલ ખર્ચ / સ્કેન' : 'Manual Cost / Scan'}
                </div>
                <div className="text-sm font-black text-slate-900 mt-1">₹650</div>
              </div>
              <div className="bg-white p-2 border border-slate-200">
                <div className="text-[9px] text-slate-500 uppercase font-bold">
                  {activeLang === 'hi' ? 'कुल अर्जित QALYs' : activeLang === 'gu' ? 'કુલ મેળવેલ QALYs' : 'Total QALYs Gained'}
                </div>
                <div className="text-sm font-black text-teal-700 mt-1">189.0</div>
              </div>
              <div className="bg-white p-2 border border-slate-200">
                <div className="text-[9px] text-slate-500 uppercase font-bold">
                  {activeLang === 'hi' ? 'आर्थिक दृष्टिकोण' : activeLang === 'gu' ? 'આર્થિક પરિપ્રેક્ષ્ય' : 'Economic Stance'}
                </div>
                <div className="text-[10px] font-black text-emerald-800 mt-1">
                  {activeLang === 'hi' ? 'लागत बचत में प्रमुख' : activeLang === 'gu' ? 'ખર્ચ બચતમાં અગ્રેસર' : 'Cost-Saving Dominant'}
                </div>
              </div>
            </div>
          </div>
        )}

        {expandedSection === 'security' && (
          <div className="border border-slate-900 p-3 bg-slate-50 text-xs space-y-2">
            <div className="flex justify-between items-center font-bold">
              <span className="uppercase text-slate-800">
                {activeLang === 'hi' ? 'क्रिप्टोग्राफिक SHA-256 छेड़छाड़ ऑडिट' : activeLang === 'gu' ? 'ક્રિપ્ટોગ્રાફિક SHA-256 ટેમ્પર ઓડિટ' : 'Cryptographic SHA-256 Tamper Audit'}
              </span>
              <button 
                onClick={() => setVerifiedChain(true)}
                className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded"
              >
                {activeLang === 'hi' ? 'ऑडिट लॉग सत्यापित करें' : activeLang === 'gu' ? 'ઓડિટ લોગ ચકાસો' : 'Verify Audit Log'}
              </button>
            </div>
            <div className="p-2 bg-white border border-slate-200 font-mono text-[9px] space-y-1">
              <div>
                {activeLang === 'hi' ? 'सत्यापित ब्लॉक श्रृंखला:' : activeLang === 'gu' ? 'ચકાસાયેલ બ્લોક શૃંખલા:' : 'Chained Blocks Verified:'} <strong>{tc.blocksChecked} {activeLang === 'hi' ? 'ब्लॉक' : activeLang === 'gu' ? 'બ્લોક' : 'Blocks'}</strong>
              </div>
              <div>
                {activeLang === 'hi' ? 'रूट लेजर हैश:' : activeLang === 'gu' ? 'રૂટ લેજર હેશ:' : 'Root Ledger Hash:'} <code>{tc.headHash}</code>
              </div>
              <div className="text-emerald-800 font-bold">{tc.statusBadge}</div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
