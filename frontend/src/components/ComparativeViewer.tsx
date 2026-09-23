'use client';

import React, { useState } from 'react';
import { Eye, Layers, Sparkles, AlertCircle, ZoomIn, Sliders } from 'lucide-react';

interface ImagesData {
  originalUrl: string;
  enhancedUrl: string;
  heatmapUrl: string;
  lesionMaskUrl?: string | null;
}

interface ComparativeViewerProps {
  images: ImagesData;
  m3Executed?: boolean;
}

export default function ComparativeViewer({ images, m3Executed = true }: ComparativeViewerProps) {
  const [activeTab, setActiveTab] = useState<'grid' | 'overlay'>('grid');
  const [overlayAlpha, setOverlayAlpha] = useState<number>(50);
  const [overlayType, setOverlayType] = useState<'heatmap' | 'lesion'>('heatmap');
  const [selectedZoomImage, setSelectedZoomImage] = useState<string | null>(null);
  if (!images) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-sm min-h-[300px]">
        <Layers className="w-8 h-8 text-slate-300 mb-3 animate-pulse" />
        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Synchronizing AI Image Data...</span>
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
            Comparative Fundus Diagnostic Matrix
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 print:text-[7px] print:uppercase print:mt-0">
            Synchronized clinical side-by-side inspection
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl self-start sm:self-auto print:hidden">
          <button onClick={() => setActiveTab('grid')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>4-Panel Matrix</button>
          <button onClick={() => setActiveTab('overlay')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${activeTab === 'overlay' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>
            <Sliders className="w-3.5 h-3.5" /> Interactive Overlay Blend
          </button>
        </div>
      </div>

      {/* Grid Mode (Always shows in print) */}
      <div className={`${activeTab === 'grid' ? 'block' : 'hidden'} print:block print:w-full print:break-inside-avoid`}>
        {/* CRITICAL FIX: print:grid print:grid-cols-4 prevents Safari from dropping to a single column */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid print:grid-cols-4 print:gap-2 print:w-full print:break-inside-avoid">
          
          {/* 1. Original Fundus */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex flex-col print:bg-transparent print:border-none print:p-0 print:w-full print:break-inside-avoid">
            <div className="flex items-center justify-between mb-2 print:mb-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide print:text-[8px] print:text-slate-900">1. Raw Fundus Capture</span>
              <button onClick={() => setSelectedZoomImage(images.originalUrl)} className="text-slate-400 p-1 print:hidden"><ZoomIn className="w-4 h-4" /></button>
            </div>
            <div 
              className="relative aspect-square rounded-lg overflow-hidden flex items-center justify-center print:rounded print:h-44 print:w-full border print:border-slate-400"
              style={{ backgroundColor: '#000000', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
            >
              <img src={images.originalUrl} alt="Raw Fundus Capture" className="w-full h-full object-contain print:scale-100" />
            </div>
            <div className="mt-2 text-[11px] text-slate-500 leading-tight print:text-[7px] print:text-slate-700 print:mt-1 font-medium">Unmodified 45° macular retinal field.</div>
          </div>

          {/* 2. Enhanced */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex flex-col print:bg-transparent print:border-none print:p-0 print:w-full print:break-inside-avoid">
            <div className="flex items-center justify-between mb-2 print:mb-1">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wide flex items-center gap-1 print:text-[8px] print:text-slate-900">
                <Sparkles className="w-3.5 h-3.5 print:hidden" /> 2. CLAHE Contrast
              </span>
              <button onClick={() => setSelectedZoomImage(images.enhancedUrl)} className="text-slate-400 p-1 print:hidden"><ZoomIn className="w-4 h-4" /></button>
            </div>
            <div 
              className="relative aspect-square rounded-lg overflow-hidden flex items-center justify-center print:rounded print:h-44 print:w-full border print:border-slate-400"
              style={{ backgroundColor: '#000000', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
            >
              <img src={images.enhancedUrl} alt="CLAHE Enhanced Fundus" className="w-full h-full object-contain print:scale-100" />
            </div>
            <div className="mt-2 text-[11px] text-slate-500 leading-tight print:text-[7px] print:text-slate-700 print:mt-1 font-medium">Green-channel microvascular boost.</div>
          </div>

          {/* 3. Lesion Mask */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex flex-col print:bg-transparent print:border-none print:p-0 print:w-full print:break-inside-avoid">
            <div className="flex items-center justify-between mb-2 print:mb-1">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wide print:text-[8px] print:text-slate-900">3. U-Net Lesion Mask</span>
              {images.lesionMaskUrl && (
                <button onClick={() => setSelectedZoomImage(images.lesionMaskUrl!)} className="text-slate-400 p-1 print:hidden"><ZoomIn className="w-4 h-4" /></button>
              )}
            </div>
            <div 
              className="relative aspect-square rounded-lg overflow-hidden flex items-center justify-center print:rounded print:h-44 print:w-full border print:border-slate-400"
              style={{ backgroundColor: '#000000', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
            >
              {m3Executed && images.lesionMaskUrl ? (
                <img src={images.lesionMaskUrl} alt="U-Net Segmentation Mask" className="w-full h-full object-contain print:scale-100" />
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <AlertCircle className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-[8px] font-semibold text-slate-300">Segmentation Bypassed</span>
                </div>
              )}
            </div>
            <div className="mt-2 text-[11px] text-slate-500 leading-tight print:text-[7px] print:text-slate-700 print:mt-1 font-medium">
              {m3Executed ? 'Microaneurysms, hemorrhages & exudates.' : 'Lesion segmentation disabled.'}
            </div>
          </div>

          {/* 4. Grad-CAM Heatmap */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex flex-col print:bg-transparent print:border-none print:p-0 print:w-full print:break-inside-avoid">
            <div className="flex items-center justify-between mb-2 print:mb-1">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wide flex items-center gap-1 print:text-[8px] print:text-slate-900">
                <Eye className="w-3.5 h-3.5 print:hidden" /> 4. Grad-CAM Activation
              </span>
              <button onClick={() => setSelectedZoomImage(images.heatmapUrl)} className="text-slate-400 p-1 print:hidden"><ZoomIn className="w-4 h-4" /></button>
            </div>
            <div 
              className="relative aspect-square rounded-lg overflow-hidden flex items-center justify-center print:rounded print:h-44 print:w-full border print:border-slate-400"
              style={{ backgroundColor: '#000000', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
            >
              <img src={images.heatmapUrl} alt="Grad-CAM Neural Heatmap" className="w-full h-full object-contain print:scale-100" />
            </div>
            <div className="mt-2 text-[11px] text-slate-500 leading-tight print:text-[7px] print:text-slate-700 print:mt-1 font-medium">Attentive feature grading saliency.</div>
          </div>
        </div>

        {/* Quantitative Lesion & Biomarker Matrix Bar (Fills Page 1 cleanly with essential clinical data) */}
        <div className="mt-3 print:mt-2 bg-slate-50 border border-slate-300 rounded-lg p-2.5 print:p-2 text-xs print:text-[8px] print-break-inside-avoid">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5 print:pb-0.5 print:mb-1">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] print:text-[7.5px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600 inline-block"></span>
              Quantitative Lesion Distribution & Optical Assessment
            </span>
            <span className="text-[10px] print:text-[6.5px] text-slate-500 font-mono">
              Field of View: 45° • Depth: 24-bit sRGB • Optics Quality: High
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 print:grid-cols-4 print:gap-1.5 text-center">
            <div className="bg-white border border-slate-200 rounded p-1.5 print:p-1">
              <div className="text-[9px] print:text-[6.5px] text-slate-500 uppercase font-bold">Microaneurysms (MA)</div>
              <div className="text-xs print:text-[8.5px] font-black text-amber-700 mt-0.5">Focal Vascular Dilations</div>
              <div className="text-[9px] print:text-[6px] text-slate-600 mt-0.5">Isolated capillary outpouchings</div>
            </div>
            <div className="bg-white border border-slate-200 rounded p-1.5 print:p-1">
              <div className="text-[9px] print:text-[6.5px] text-slate-500 uppercase font-bold">Hemorrhages (HEM)</div>
              <div className="text-xs print:text-[8.5px] font-black text-rose-700 mt-0.5">Intra-Retinal Micro-Bleeds</div>
              <div className="text-[9px] print:text-[6px] text-slate-600 mt-0.5">Blot, dot & flame patterns</div>
            </div>
            <div className="bg-white border border-slate-200 rounded p-1.5 print:p-1">
              <div className="text-[9px] print:text-[6.5px] text-slate-500 uppercase font-bold">Hard Exudates (EX)</div>
              <div className="text-xs print:text-[8.5px] font-black text-teal-700 mt-0.5">Lipoprotein Deposition</div>
              <div className="text-[9px] print:text-[6px] text-slate-600 mt-0.5">Macular edema risk assessment</div>
            </div>
            <div className="bg-white border border-slate-200 rounded p-1.5 print:p-1">
              <div className="text-[9px] print:text-[6.5px] text-slate-500 uppercase font-bold">Vessel Arborization</div>
              <div className="text-xs print:text-[8.5px] font-black text-slate-800 mt-0.5">Arcades & Caliber Checked</div>
              <div className="text-[9px] print:text-[6px] text-slate-600 mt-0.5">Optic disc & foveal centration</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Overlay Mode (Hidden in print) */}
      <div className={`${activeTab === 'overlay' ? 'block' : 'hidden'} print:hidden`}>
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-inner" style={{ backgroundColor: '#000' }}>
            <img src={images.enhancedUrl} alt="Base Enhanced Fundus" className="absolute inset-0 w-full h-full object-contain" />
            {overlayType === 'heatmap' ? (
              <img src={images.heatmapUrl} alt="Heatmap" className="absolute inset-0 w-full h-full object-contain" style={{ opacity: overlayAlpha / 100 }} />
            ) : images.lesionMaskUrl ? (
              <img src={images.lesionMaskUrl} alt="Lesion Mask" className="absolute inset-0 w-full h-full object-contain" style={{ opacity: overlayAlpha / 100 }} />
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
            <img src={selectedZoomImage} alt="Zoomed View" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}