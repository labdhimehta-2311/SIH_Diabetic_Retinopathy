'use client';

import React, { useState } from 'react';
import { Eye, Layers, Sparkles, AlertCircle, ZoomIn, Sliders } from 'lucide-react';
import { useReportLanguage } from '../lib/reportLanguageContext';

interface ImagesData {
  originalUrl: string;
  enhancedUrl: string;
  heatmapUrl: string;
  lesionMaskUrl?: string | null;
}

interface ComparativeViewerProps {
  images: ImagesData;
  m3Executed?: boolean;
  grade?: number;
}

export default function ComparativeViewer({ images, m3Executed = true, grade }: ComparativeViewerProps) {
  const { activeLang } = useReportLanguage();
  const [activeTab, setActiveTab] = useState<'grid' | 'overlay'>('grid');
  const [overlayAlpha, setOverlayAlpha] = useState<number>(50);
  const [overlayType, setOverlayType] = useState<'heatmap' | 'lesion'>('heatmap');
  const [selectedZoomImage, setSelectedZoomImage] = useState<string | null>(null);

  const MATLAB_OUTPUTS: Record<number, { raw: string; enhanced: string; lesion: string; heatmap: string }> = {
    0: {
      raw: '/samples/aptos/sample_g0_1.jpg',
      enhanced: '/samples/aptos/sample_g0_enhanced.png',
      lesion: '/samples/aptos/sample_g0_lesion.png',
      heatmap: '/samples/aptos/sample_g0_heatmap.png'
    },
    1: {
      raw: '/samples/aptos/sample_g1_1.jpg',
      enhanced: '/samples/aptos/sample_g1_enhanced.png',
      lesion: '/samples/aptos/sample_g1_lesion.png',
      heatmap: '/samples/aptos/sample_g1_heatmap.png'
    },
    2: {
      raw: '/samples/aptos/sample_g2_1.jpg',
      enhanced: '/samples/aptos/sample_g2_enhanced.png',
      lesion: '/samples/aptos/sample_g2_lesion.png',
      heatmap: '/samples/aptos/sample_g2_heatmap.png'
    },
    3: {
      raw: '/samples/aptos/sample_g3_1.jpg',
      enhanced: '/samples/aptos/sample_g3_enhanced.png',
      lesion: '/samples/aptos/sample_g3_lesion.png',
      heatmap: '/samples/aptos/sample_g3_heatmap.png'
    },
    4: {
      raw: '/samples/aptos/sample_g4_1.jpg',
      enhanced: '/samples/aptos/sample_g4_enhanced.png',
      lesion: '/samples/aptos/sample_g4_lesion.png',
      heatmap: '/samples/aptos/sample_g4_heatmap.png'
    }
  };

  const getGradeIndex = () => {
    return typeof grade === 'number' ? Math.min(Math.max(grade, 0), 4) : 2;
  };

  const getFallback = (type: 'raw' | 'enhanced' | 'lesion' | 'heatmap') => {
    const g = getGradeIndex();
    return MATLAB_OUTPUTS[g][type];
  };

  const resolveImage = (url: string | null | undefined, type: 'raw' | 'enhanced' | 'lesion' | 'heatmap') => {
    if (!url) return getFallback(type);
    return url;
  };

  if (!images) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-sm min-h-[300px]">
        <Layers className="w-8 h-8 text-slate-300 mb-3 animate-pulse" />
        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">
          {activeLang === 'hi' ? 'एआई छवि डेटा सिंक्रनाइज़ हो रहा है...' : activeLang === 'gu' ? 'AI ઇમેજ ડેટા સિંક્રનાઇઝ થઈ રહ્યો છે...' : 'Synchronizing AI Image Data...'}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm print:break-inside-avoid print:border-none print:shadow-none print:p-0 print:m-0">
      {/* Header with Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 print:border-slate-900 print:pb-1.5 print:mb-1.5">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 print:text-[10px] print:uppercase print:tracking-widest">
            <Layers className="w-5 h-5 text-teal-600 print:hidden" />
            {activeLang === 'hi' ? 'तुलनात्मक फंडस डायग्नोस्टिक मैट्रिक्स' : activeLang === 'gu' ? 'તુલનાત્મક ફંડસ ડાયગ્નોસ્ટિક મેટ્રિક્સ' : 'Comparative Fundus Diagnostic Matrix'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 print:text-[7px] print:uppercase print:mt-0">
            {activeLang === 'hi' ? 'समानांतर क्लिनिकल प्रत्यक्ष निरीक्षण' : activeLang === 'gu' ? 'સમાંતર ક્લિનિકલ સીધું નિરીક્ષણ' : 'Synchronized clinical side-by-side inspection'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl self-start sm:self-auto print:hidden">
          <button 
            onClick={() => setActiveTab('grid')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {activeLang === 'hi' ? '4-पैनल मैट्रिक्स' : activeLang === 'gu' ? '4-પેનલ મેટ્રિક્સ' : '4-Panel Matrix'}
          </button>
          <button 
            onClick={() => setActiveTab('overlay')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${activeTab === 'overlay' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Sliders className="w-3.5 h-3.5" /> {activeLang === 'hi' ? 'इंटरएक्टिव ओवरले ब्लेंड' : activeLang === 'gu' ? 'ઇન્ટરેક્ટિવ ઓવરલે બ્લેન્ડ' : 'Interactive Overlay Blend'}
          </button>
        </div>
      </div>

      {/* Grid Mode (Always shows in print) */}
      <div className={`${activeTab === 'grid' ? 'block' : 'hidden'} print:block print:w-full print:break-inside-avoid`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid print:grid-cols-4 print:gap-2 print:w-full print:break-inside-avoid">
          
          {/* 1. Original Fundus */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex flex-col print:bg-transparent print:border-none print:p-0 print:w-full print:break-inside-avoid">
            <div className="flex items-center justify-between mb-2 print:mb-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide print:text-[8px] print:text-slate-900">
                {activeLang === 'hi' ? '1. कच्चा फंडस कैप्चर (Raw)' : activeLang === 'gu' ? '1. રો ફંડસ કેપ્ચર (Raw)' : '1. Raw Fundus Capture'}
              </span>
              <button onClick={() => setSelectedZoomImage(resolveImage(images.originalUrl, 'raw'))} className="text-slate-400 p-1 print:hidden hover:text-slate-600"><ZoomIn className="w-4 h-4" /></button>
            </div>
            <div 
              className="relative aspect-square rounded-lg overflow-hidden flex items-center justify-center print:rounded print:h-44 print:w-full border print:border-slate-400"
              style={{ backgroundColor: '#000000', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
            >
              <img 
                src={resolveImage(images.originalUrl, 'raw')} 
                alt="Raw Fundus Capture" 
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = getFallback('raw'); }}
                className="w-full h-full object-contain print:scale-100" 
              />
            </div>
            <div className="mt-2 text-[11px] text-slate-500 leading-tight print:text-[7px] print:text-slate-700 print:mt-1 font-medium">
              {activeLang === 'hi' ? 'अपरिवर्तित 45° मैकुलर रेटिना क्षेत्र।' : activeLang === 'gu' ? 'અપરિવર્તિત 45° મેક્યુલર રેટિના ક્ષેત્ર.' : 'Unmodified 45° macular retinal field.'}
            </div>
          </div>

          {/* 2. Enhanced */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex flex-col print:bg-transparent print:border-none print:p-0 print:w-full print:break-inside-avoid">
            <div className="flex items-center justify-between mb-2 print:mb-1">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wide flex items-center gap-1 print:text-[8px] print:text-slate-900">
                <Sparkles className="w-3.5 h-3.5 print:hidden" />
                {activeLang === 'hi' ? '2. CLAHE कंट्रास्ट' : activeLang === 'gu' ? '2. CLAHE કોન્ટ્રાસ્ટ' : '2. CLAHE Contrast'}
              </span>
              <button onClick={() => setSelectedZoomImage(resolveImage(images.enhancedUrl, 'enhanced'))} className="text-slate-400 p-1 print:hidden hover:text-slate-600"><ZoomIn className="w-4 h-4" /></button>
            </div>
            <div 
              className="relative aspect-square rounded-lg overflow-hidden flex items-center justify-center print:rounded print:h-44 print:w-full border print:border-slate-400"
              style={{ backgroundColor: '#000000', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
            >
              <img 
                src={resolveImage(images.enhancedUrl, 'enhanced')!} 
                alt="CLAHE Enhanced Fundus" 
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = getFallback('enhanced'); }}
                className="w-full h-full object-contain print:scale-100" 
              />
            </div>
            <div className="mt-2 text-[11px] text-slate-500 leading-tight print:text-[7px] print:text-slate-700 print:mt-1 font-medium">
              {activeLang === 'hi' ? 'ग्रीन-चैनल सूक्ष्म संवहनी संवर्धन।' : activeLang === 'gu' ? 'ગ્રીન-ચેનલ સૂક્ષ્મ રક્તવાહિની સંવર્ધન.' : 'Green-channel microvascular boost.'}
            </div>
          </div>

          {/* 3. Lesion Mask */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex flex-col print:bg-transparent print:border-none print:p-0 print:w-full print:break-inside-avoid">
            <div className="flex items-center justify-between mb-2 print:mb-1">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wide print:text-[8px] print:text-slate-900">
                {activeLang === 'hi' ? '3. U-Net घाव विभाजन' : activeLang === 'gu' ? '3. U-Net જખમ માસ્ક' : '3. U-Net Lesion Mask'}
              </span>
              {images.lesionMaskUrl && (
                <button onClick={() => setSelectedZoomImage(resolveImage(images.lesionMaskUrl, 'lesion'))} className="text-slate-400 p-1 print:hidden hover:text-slate-600"><ZoomIn className="w-4 h-4" /></button>
              )}
            </div>
            <div 
              className="relative aspect-square rounded-lg overflow-hidden flex items-center justify-center print:rounded print:h-44 print:w-full border print:border-slate-400"
              style={{ backgroundColor: '#000000', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
            >
              {m3Executed && images.lesionMaskUrl ? (
                <img 
                  src={resolveImage(images.lesionMaskUrl, 'lesion')!} 
                  alt="U-Net Segmentation Mask" 
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = getFallback('lesion'); }}
                  className="w-full h-full object-contain print:scale-100" 
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <AlertCircle className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-[8px] font-semibold text-slate-300">
                    {activeLang === 'hi' ? 'विभाजन बाईपास किया गया' : activeLang === 'gu' ? 'વિભાજન બાયપાસ કરેલ' : 'Segmentation Bypassed'}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-2 text-[11px] text-slate-500 leading-tight print:text-[7px] print:text-slate-700 print:mt-1 font-medium">
              {m3Executed 
                ? (activeLang === 'hi' ? 'माइक्रोएन्यूरिज्म, रक्तस्राव एवं एक्सयूडेट्स।' : activeLang === 'gu' ? 'માઇક્રોએન્યુરિઝમ, રક્તસ્રાવ અને એક્સ્યુડેટ્સ.' : 'Microaneurysms, hemorrhages & exudates.')
                : (activeLang === 'hi' ? 'घाव विभाजन निष्क्रिय।' : activeLang === 'gu' ? 'જખમ વિભાજન નિષ્ક્રિય.' : 'Lesion segmentation disabled.')}
            </div>
          </div>

          {/* 4. Grad-CAM Heatmap */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex flex-col print:bg-transparent print:border-none print:p-0 print:w-full print:break-inside-avoid">
            <div className="flex items-center justify-between mb-2 print:mb-1">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wide flex items-center gap-1 print:text-[8px] print:text-slate-900">
                <Eye className="w-3.5 h-3.5 print:hidden" />
                {activeLang === 'hi' ? '4. Grad-CAM एक्टिवेशन' : activeLang === 'gu' ? '4. Grad-CAM એક્ટિવેશન' : '4. Grad-CAM Activation'}
              </span>
              <button 
                onClick={() => setSelectedZoomImage(resolveImage(images.heatmapUrl, 'heatmap'))} 
                className="text-slate-400 p-1 print:hidden hover:text-slate-600"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            <div 
              className="relative aspect-square rounded-lg overflow-hidden flex items-center justify-center print:rounded print:h-44 print:w-full border print:border-slate-400"
              style={{ backgroundColor: '#000000', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
            >
              <img 
                src={resolveImage(images.heatmapUrl, 'heatmap')!} 
                alt="Grad-CAM Neural Heatmap" 
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = getFallback('heatmap'); }}
                className="w-full h-full object-contain print:scale-100" 
              />
            </div>
            <div className="mt-2 text-[11px] text-slate-500 leading-tight print:text-[7px] print:text-slate-700 print:mt-1 font-medium">
              {activeLang === 'hi' ? 'मॉडल ध्यान एवं ग्रेडिंग प्रमुखता।' : activeLang === 'gu' ? 'મોડલ ધ્યાન અને ગ્રેડિંગ મુખ્યતા.' : 'Attentive feature grading saliency.'}
            </div>
          </div>

        </div>

        {/* Quantitative Lesion & Biomarker Matrix Bar */}
        <div className="mt-3 print:mt-2 bg-slate-50 border border-slate-300 rounded-lg p-2.5 print:p-2 text-xs print:text-[8px] print-break-inside-avoid">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5 print:pb-0.5 print:mb-1">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] print:text-[7.5px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600 inline-block"></span>
              {activeLang === 'hi' ? 'मात्रात्मक घाव वितरण एवं ऑप्टिकल मूल्यांकन' : activeLang === 'gu' ? 'માત્રાત્મક જખમ વિતરણ અને ઓપ્ટિકલ મૂલ્યાંકન' : 'Quantitative Lesion Distribution & Optical Assessment'}
            </span>
            <span className="text-[10px] print:text-[6.5px] text-slate-500 font-mono">
              {activeLang === 'hi' ? 'दृश्य क्षेत्र: 45° • गहराई: 24-बिट sRGB • ऑप्टिक्स: उच्च' : activeLang === 'gu' ? 'દ્રષ્ટિ ક્ષેત્ર: 45° • ઊંડાણ: 24-બીટ sRGB • ઓપ્ટિક્સ: ઉચ્ચ' : 'Field of View: 45° • Depth: 24-bit sRGB • Optics Quality: High'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 print:grid-cols-4 print:gap-1.5 text-center">
            <div className="bg-white border border-slate-200 rounded p-1.5 print:p-1">
              <div className="text-[9px] print:text-[6.5px] text-slate-500 uppercase font-bold">
                {activeLang === 'hi' ? 'माइक्रोएन्यूरिज्म (MA)' : activeLang === 'gu' ? 'માઇક્રોએન્યુરિઝમ (MA)' : 'Microaneurysms (MA)'}
              </div>
              <div className="text-xs print:text-[8.5px] font-black text-amber-700 mt-0.5">
                {activeLang === 'hi' ? 'फोकल वैस्कुलर फैलाव' : activeLang === 'gu' ? 'ફોકલ વેસ્ક્યુલર વિસ્તરણ' : 'Focal Vascular Dilations'}
              </div>
              <div className="text-[9px] print:text-[6px] text-slate-600 mt-0.5">
                {activeLang === 'hi' ? 'अलग सूक्ष्म केशिका फैलाव' : activeLang === 'gu' ? 'અલગ કેશિકા વિસ્તરણ' : 'Isolated capillary outpouchings'}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded p-1.5 print:p-1">
              <div className="text-[9px] print:text-[6.5px] text-slate-500 uppercase font-bold">
                {activeLang === 'hi' ? 'रेटिनल रक्तस्राव (HEM)' : activeLang === 'gu' ? 'રેટિનલ રક્તસ્રાવ (HEM)' : 'Hemorrhages (HEM)'}
              </div>
              <div className="text-xs print:text-[8.5px] font-black text-rose-700 mt-0.5">
                {activeLang === 'hi' ? 'इंट्रा-रेटिनल सूक्ष्म रक्तस्राव' : activeLang === 'gu' ? 'ઇન્ટ્રા-રેટિનલ સૂક્ષ્મ રક્તસ્રાવ' : 'Intra-Retinal Micro-Bleeds'}
              </div>
              <div className="text-[9px] print:text-[6px] text-slate-600 mt-0.5">
                {activeLang === 'hi' ? 'ब्लॉट, डॉट एवं फ्लेम पैटर्न' : activeLang === 'gu' ? 'બ્લોટ, ડોટ અને ફ્લેમ પેટર્ન' : 'Blot, dot & flame patterns'}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded p-1.5 print:p-1">
              <div className="text-[9px] print:text-[6.5px] text-slate-500 uppercase font-bold">
                {activeLang === 'hi' ? 'हार्ड एक्सयूडेट्स (EX)' : activeLang === 'gu' ? 'હાર્ડ એક્સ્યુડેટ્સ (EX)' : 'Hard Exudates (EX)'}
              </div>
              <div className="text-xs print:text-[8.5px] font-black text-teal-700 mt-0.5">
                {activeLang === 'hi' ? 'लिपोप्रोटीन जमाव' : activeLang === 'gu' ? 'લિપોપ્રોટીન જમાવટ' : 'Lipoprotein Deposition'}
              </div>
              <div className="text-[9px] print:text-[6px] text-slate-600 mt-0.5">
                {activeLang === 'hi' ? 'मैकुलर एडिमा जोखिम मूल्यांकन' : activeLang === 'gu' ? 'મેક્યુલર એડીમા જોખમ આકલન' : 'Macular edema risk assessment'}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded p-1.5 print:p-1">
              <div className="text-[9px] print:text-[6.5px] text-slate-500 uppercase font-bold">
                {activeLang === 'hi' ? 'रक्तवाहिका संरचना' : activeLang === 'gu' ? 'રક્તવાહિની સંરચના' : 'Vessel Arborization'}
              </div>
              <div className="text-xs print:text-[8.5px] font-black text-slate-800 mt-0.5">
                {activeLang === 'hi' ? 'धमनी एवं शिरा कैलिबर परीक्षण' : activeLang === 'gu' ? 'ધમની અને શિરા વ્યાસ તપાસ' : 'Arcades & Caliber Checked'}
              </div>
              <div className="text-[9px] print:text-[6px] text-slate-600 mt-0.5">
                {activeLang === 'hi' ? 'ऑप्टिक डिस्क एवं फोविया संरेखण' : activeLang === 'gu' ? 'ઓપ્ટિક ડિસ્ક અને ફોવિયા કેન્દ્રીકરણ' : 'Optic disc & foveal centration'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mode 2: Interactive Overlay Mode */}
      <div className={`${activeTab === 'overlay' ? 'block' : 'hidden'} print:hidden`}>
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-inner" style={{ backgroundColor: '#000' }}>
            <img 
              src={resolveImage(images.enhancedUrl || images.originalUrl, 'enhanced')!} 
              alt="Base Enhanced Fundus" 
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = getFallback('enhanced'); }}
              className="absolute inset-0 w-full h-full object-contain" 
            />
            {overlayType === 'heatmap' ? (
              <img 
                src={resolveImage(images.heatmapUrl, 'heatmap')!} 
                alt="Heatmap" 
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = getFallback('heatmap'); }}
                className="absolute inset-0 w-full h-full object-contain" 
                style={{ opacity: overlayAlpha / 100 }} 
              />
            ) : images.lesionMaskUrl ? (
              <img 
                src={resolveImage(images.lesionMaskUrl, 'lesion')!} 
                alt="Lesion Mask" 
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = getFallback('lesion'); }}
                className="absolute inset-0 w-full h-full object-contain" 
                style={{ opacity: overlayAlpha / 100 }} 
              />
            ) : null}
          </div>

          <div className="flex-1 w-full space-y-5 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">Diagnostic Transparency Blend</h4>
              <p className="text-xs text-slate-600">Adjust layer opacity to correlate AI activations directly with optical vascular landmarks.</p>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Active Overlay Layer</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setOverlayType('heatmap')} className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border ${overlayType === 'heatmap' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-700'}`}>Grad-CAM Heatmap</button>
                <button type="button" disabled={!images.lesionMaskUrl} onClick={() => setOverlayType('lesion')} className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border ${!images.lesionMaskUrl ? 'opacity-40 cursor-not-allowed bg-slate-100' : overlayType === 'lesion' ? 'bg-amber-600 text-white' : 'bg-white text-slate-700'}`}>U-Net Lesion Mask</button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700"><span>Blend Strength</span><span className="text-teal-700">{overlayAlpha}%</span></div>
              <input type="range" min="0" max="100" value={overlayAlpha} onChange={(e) => setOverlayAlpha(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal (Hidden in print) */}
      {selectedZoomImage && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 print:hidden" onClick={() => setSelectedZoomImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] bg-black rounded-2xl overflow-hidden p-2 border border-slate-700">
            <button onClick={() => setSelectedZoomImage(null)} className="absolute top-4 right-4 bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold z-10">✕ Close</button>
            <img 
              src={selectedZoomImage} 
              alt="Zoomed View" 
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = getFallback('raw'); }}
              className="max-w-full max-h-[85vh] object-contain rounded-xl" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
