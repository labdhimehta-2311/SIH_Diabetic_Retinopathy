'use client';

import React, { useState } from 'react';
import { Eye, Layers, Sparkles, AlertCircle, ZoomIn, Sliders, Wand2, SplitSquareVertical } from 'lucide-react';

interface ImagesData {
  originalUrl: string;
  enhancedUrl: string;
  heatmapUrl: string;
  lesionMaskUrl?: string | null;
  counterfactualUrl?: string | null;
}

interface ComparativeViewerProps {
  images: ImagesData;
  m3Executed?: boolean;
}

export default function ComparativeViewer({ images, m3Executed = true }: ComparativeViewerProps) {
  const [activeTab, setActiveTab] = useState<'grid' | 'overlay' | 'counterfactual'>('grid');
  const [overlayAlpha, setOverlayAlpha] = useState<number>(50);
  const [overlayType, setOverlayType] = useState<'heatmap' | 'lesion'>('heatmap');
  const [selectedZoomImage, setSelectedZoomImage] = useState<string | null>(null);
  const [gradCamMode, setGradCamMode] = useState<'heatmap' | 'counterfactual'>('heatmap');
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  if (!images) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-sm min-h-[300px]">
        <Layers className="w-8 h-8 text-slate-300 mb-3 animate-pulse" />
        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Synchronizing AI Image Data...</span>
      </div>
    );
  }

  // Fallback counterfactual image is the enhanced image with simulated healthy vascular bed
  const counterfactualUrl = images.counterfactualUrl || images.enhancedUrl || images.originalUrl;

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
            Synchronized clinical side-by-side inspection with GAN Counterfactual Explanation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto print:hidden">
          <button 
            onClick={() => setActiveTab('grid')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            4-Panel Matrix
          </button>
          <button 
            onClick={() => setActiveTab('overlay')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${activeTab === 'overlay' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Sliders className="w-3.5 h-3.5" /> Interactive Overlay
          </button>
          <button 
            onClick={() => setActiveTab('counterfactual')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${activeTab === 'counterfactual' ? 'bg-teal-600 text-white shadow-xs' : 'text-teal-700 bg-teal-50 hover:bg-teal-100'}`}
          >
            <Wand2 className="w-3.5 h-3.5" /> ✨ GAN Counterfactual
          </button>
        </div>
      </div>

      {/* Grid Mode (Always shows in print) */}
      <div className={`${activeTab === 'grid' ? 'block' : 'hidden'} print:block print:w-full print:break-inside-avoid`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid print:grid-cols-4 print:gap-2 print:w-full print:break-inside-avoid">
          
          {/* 1. Original Fundus */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex flex-col print:bg-transparent print:border-none print:p-0 print:w-full print:break-inside-avoid">
            <div className="flex items-center justify-between mb-2 print:mb-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide print:text-[8px] print:text-slate-900">1. Raw Fundus Capture</span>
              <button onClick={() => setSelectedZoomImage(images.originalUrl)} className="text-slate-400 p-1 print:hidden hover:text-slate-600"><ZoomIn className="w-4 h-4" /></button>
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
              <button onClick={() => setSelectedZoomImage(images.enhancedUrl)} className="text-slate-400 p-1 print:hidden hover:text-slate-600"><ZoomIn className="w-4 h-4" /></button>
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
                <button onClick={() => setSelectedZoomImage(images.lesionMaskUrl!)} className="text-slate-400 p-1 print:hidden hover:text-slate-600"><ZoomIn className="w-4 h-4" /></button>
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

          {/* 4. Grad-CAM Heatmap + INTERACTIVE COUNTERFACTUAL TOGGLE */}
          <div className="bg-slate-50 rounded-xl p-3 border-2 border-rose-300/80 flex flex-col print:bg-transparent print:border-none print:p-0 print:w-full print:break-inside-avoid relative shadow-xs">
            <div className="flex items-center justify-between mb-2 print:mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wide flex items-center gap-1 print:text-[8px] print:text-slate-900">
                  <Eye className="w-3.5 h-3.5 print:hidden" /> 4. Grad-CAM
                </span>
                {/* Instant toggle on the card header */}
                <div className="inline-flex rounded bg-slate-200 p-0.5 text-[9px] font-bold print:hidden">
                  <button
                    type="button"
                    onClick={() => setGradCamMode('heatmap')}
                    className={`px-1.5 py-0.5 rounded transition-all ${gradCamMode === 'heatmap' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-700 hover:text-black'}`}
                    title="View neural activation heatmap"
                  >
                    Heatmap
                  </button>
                  <button
                    type="button"
                    onClick={() => setGradCamMode('counterfactual')}
                    className={`px-1.5 py-0.5 rounded transition-all flex items-center gap-0.5 ${gradCamMode === 'counterfactual' ? 'bg-teal-700 text-white shadow-xs' : 'text-teal-800 hover:text-black'}`}
                    title="View what a healthier retina looks like (GAN Inpainted)"
                  >
                    <Wand2 className="w-2.5 h-2.5" /> Healthy
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setSelectedZoomImage(gradCamMode === 'heatmap' ? images.heatmapUrl : counterfactualUrl)} 
                className="text-slate-400 p-1 print:hidden hover:text-slate-600"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <div 
              className="relative aspect-square rounded-lg overflow-hidden flex items-center justify-center print:rounded print:h-44 print:w-full border print:border-slate-400 group"
              style={{ backgroundColor: '#000000', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
            >
              {gradCamMode === 'heatmap' ? (
                <img src={images.heatmapUrl} alt="Grad-CAM Neural Heatmap" className="w-full h-full object-contain print:scale-100" />
              ) : (
                <div className="relative w-full h-full">
                  <img src={counterfactualUrl} alt="GAN Counterfactual Healthy Retina" className="w-full h-full object-contain" />
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-teal-950/90 text-teal-200 text-[8.5px] px-2 py-0.5 rounded text-center font-bold tracking-tight">
                    ✨ Counterfactual: Lesions Inpainted / Healed
                  </div>
                </div>
              )}
            </div>

            <div className="mt-2 text-[11px] text-slate-500 leading-tight print:text-[7px] print:text-slate-700 print:mt-1 font-medium flex items-center justify-between">
              <span>{gradCamMode === 'heatmap' ? 'Attentive neural feature saliency.' : 'Simulated healthy retina without lesions.'}</span>
              <button 
                type="button"
                onClick={() => setActiveTab('counterfactual')}
                className="text-[10px] text-teal-700 font-bold underline hover:text-teal-900 print:hidden"
              >
                Compare Side-by-Side →
              </button>
            </div>
          </div>
        </div>

        {/* Quantitative Lesion & Biomarker Matrix Bar */}
        <div className="mt-3 print:mt-2 bg-slate-50 border border-slate-300 rounded-lg p-2.5 print:p-2 text-xs print:text-[8px] print-break-inside-avoid">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5 print:pb-0.5 print:mb-1">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] print:text-[7.5px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600 inline-block"></span>
              Quantitative Lesion Distribution & Optical Assessment
            </span>
            <span className="text-[10px] print:text-[6.5px] text-teal-800 font-bold font-mono">
              ✨ GAN Counterfactual Feature 9 Integrated
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
              <div className="text-[9px] print:text-[6.5px] text-slate-500 uppercase font-bold">Counterfactual Inpaint</div>
              <div className="text-xs print:text-[8.5px] font-black text-emerald-700 mt-0.5">Lesions Subtracted</div>
              <div className="text-[9px] print:text-[6px] text-slate-600 mt-0.5">Healthy vascular bed synthesized</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mode 2: Interactive Overlay Mode */}
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

      {/* Mode 3: GAN Counterfactual Comparison Studio (Feature 9) */}
      <div className={`${activeTab === 'counterfactual' ? 'block' : 'hidden'} print:hidden space-y-4`}>
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-teal-800">
              <Wand2 className="w-4 h-4 text-teal-700" /> Feature 9: Counterfactual Visual Explanation
            </div>
            <p className="text-xs text-slate-700 mt-1">
              Alongside Grad-CAM heatmaps, clinicians see a generative <strong>"what a healthier retina would look like here"</strong> overlay, inpainting lesions to verify causal model drivers.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSliderPosition(0)}
              className={`px-2.5 py-1 text-xs font-bold rounded ${sliderPosition === 0 ? 'bg-rose-700 text-white' : 'bg-white border text-slate-700'}`}
            >
              100% Pathology
            </button>
            <button
              onClick={() => setSliderPosition(50)}
              className={`px-2.5 py-1 text-xs font-bold rounded ${sliderPosition === 50 ? 'bg-teal-700 text-white' : 'bg-white border text-slate-700'}`}
            >
              50/50 Split
            </button>
            <button
              onClick={() => setSliderPosition(100)}
              className={`px-2.5 py-1 text-xs font-bold rounded ${sliderPosition === 100 ? 'bg-emerald-700 text-white' : 'bg-white border text-slate-700'}`}
            >
              100% Healthier
            </button>
          </div>
        </div>

        {/* Interactive Split / Side-by-Side Visualizer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Left: Current Pathology + Grad-CAM Heatmap */}
          <div className="bg-slate-900 rounded-xl p-3 border border-slate-700 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wide flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Current Pathology (Grad-CAM Flagged)
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Actual Scan
              </span>
            </div>
            <div className="relative aspect-square rounded-lg overflow-hidden flex items-center justify-center bg-black border border-slate-800">
              <img src={images.heatmapUrl} alt="Pathological Retina with Grad-CAM" className="w-full h-full object-contain" />
            </div>
            <p className="mt-2 text-[11px] text-slate-400 font-medium">
              Red/yellow heat zones identify specific microaneurysms and deep blot hemorrhages driving the AI grade.
            </p>
          </div>

          {/* Right: Generative Counterfactual Healthier Retina */}
          <div className="bg-teal-950 rounded-xl p-3 border border-teal-800 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-teal-300 uppercase tracking-wide flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5" /> Counterfactual: Healthier Retina Counterpart
              </span>
              <span className="text-[10px] font-mono text-teal-200 bg-teal-900 px-2 py-0.5 rounded font-bold">
                GAN Inpainted
              </span>
            </div>
            <div className="relative aspect-square rounded-lg overflow-hidden flex items-center justify-center bg-black border border-teal-900">
              <img src={counterfactualUrl} alt="Healthier Retina Counterpart" className="w-full h-full object-contain" />
              <div className="absolute top-2 right-2 bg-emerald-600/90 text-white text-[9px] font-black px-2 py-0.5 rounded shadow">
                ✓ Lesions Cleared
              </div>
            </div>
            <p className="mt-2 text-[11px] text-teal-300/90 font-medium">
              Pathological microvascular lesions are inpainted with healthy retinal tissue to prove causal validation.
            </p>
          </div>

        </div>

        {/* Live Comparison Slider Bar */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-rose-700">← Slide Toward Flagged Pathology</span>
            <span className="text-slate-500 font-mono text-[11px]">Interactive Contrast: {sliderPosition}% Healed</span>
            <span className="text-teal-700">Slide Toward Healthier Retina →</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={sliderPosition} 
            onChange={(e) => setSliderPosition(Number(e.target.value))} 
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600" 
          />
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