'use client';

import React from 'react';
import Link from 'next/link';
import { Activity, Flame, Clock, ChevronRight } from 'lucide-react';
import { QueuePatientItem } from '../lib/queueService';

interface ClinicalQueueMonitorProps {
  riskQueue: QueuePatientItem[];
  normalQueue: QueuePatientItem[];
}

export default function ClinicalQueueMonitor({ riskQueue, normalQueue }: ClinicalQueueMonitorProps) {
  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/60 p-5 shadow-xl rounded-2xl relative overflow-hidden transition-all animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-200/60 mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            <span>LIVE CLINICAL TRIAGE & SPECIALIST QUEUE MONITOR</span>
          </h2>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Discrete-event model active: 1 Reviewing Doctor @ 60s/case (~60 patients/hour nominal capacity)
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold text-slate-600">Live Auto-Ranking</span>
        </div>
      </div>

      {/* Two Queue Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* =================================================================== */}
        {/* COLUMN 1: AI RISK PRIORITY QUEUE (DR Grade 3, 4)                    */}
        {/* =================================================================== */}
        <div className="bg-rose-50/50 border border-rose-200/70 rounded-xl p-3 flex flex-col">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-rose-200/60">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-600 fill-rose-600" />
              <span className="text-xs font-black text-rose-900 uppercase tracking-wider">
                Risk Priority Queue ({riskQueue.length})
              </span>
            </div>
            <span className="px-2 py-0.5 bg-rose-100 border border-rose-300 text-rose-800 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-2xs">
              High-Risk Fast-Track
            </span>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {riskQueue.length === 0 ? (
              <div className="py-8 text-center text-xs text-rose-700/70 font-semibold">
                No high-risk patients currently waiting.
              </div>
            ) : (
              riskQueue.map((item) => (
                <Link
                  key={item.patientId}
                  href={`/report/${item.patientId}?screeningId=${item.screeningId}`}
                  className="bg-white/95 hover:bg-white border border-rose-200 hover:border-rose-300 p-2.5 rounded-lg shadow-2xs flex items-center justify-between gap-3 transition-all group block"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-rose-600 text-white font-black text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
                      #{item.rank}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate group-hover:text-rose-700 transition-colors">
                        {item.patientName}
                      </div>
                      <div className="text-[10px] font-semibold text-rose-700 truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-800 font-mono">
                      {item.waitDisplay}
                    </div>
                    <div className="text-[9px] text-slate-500 font-semibold">
                      {item.patientsAhead === 0 ? '0 ahead' : `${item.patientsAhead} ahead`}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* =================================================================== */}
        {/* COLUMN 2: NORMAL FIFO QUEUE (DR Grade 0, 1, 2)                     */}
        {/* =================================================================== */}
        <div className="bg-teal-50/50 border border-teal-200/70 rounded-xl p-3 flex flex-col">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-teal-200/60">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-black text-teal-900 uppercase tracking-wider">
                Normal FIFO Queue ({normalQueue.length})
              </span>
            </div>
            <span className="px-2 py-0.5 bg-teal-100 border border-teal-300 text-teal-800 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-2xs">
              Chronological Arrival
            </span>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {normalQueue.length === 0 ? (
              <div className="py-8 text-center text-xs text-teal-700/70 font-semibold">
                No routine monitoring patients currently waiting.
              </div>
            ) : (
              normalQueue.map((item) => (
                <Link
                  key={item.patientId}
                  href={`/report/${item.patientId}?screeningId=${item.screeningId}`}
                  className="bg-white/95 hover:bg-white border border-teal-200 hover:border-teal-300 p-2.5 rounded-lg shadow-2xs flex items-center justify-between gap-3 transition-all group block"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-black text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
                      #{item.rank}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate group-hover:text-teal-700 transition-colors">
                        {item.patientName}
                      </div>
                      <div className="text-[10px] font-medium text-slate-600 truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-800 font-mono">
                      {item.waitDisplay}
                    </div>
                    <div className="text-[9px] text-slate-500 font-semibold">
                      {item.patientsAhead} total ahead
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
