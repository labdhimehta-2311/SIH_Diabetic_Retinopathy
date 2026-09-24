'use client';

import React from 'react';
import { User, Users, Clock, AlertTriangle, Sparkles } from 'lucide-react';
import { classifyDRQueue } from '../lib/queueService';

interface QueueAssignmentCardProps {
  grade: number;
  gradeLabel: string;
  rank?: number;
  patientsAhead?: number;
  estimatedWaitMinutes?: number;
  queueTypeOverride?: 'RISK_PRIORITY' | 'NORMAL_FIFO';
}

export default function QueueAssignmentCard({
  grade,
  gradeLabel,
  rank = 1,
  patientsAhead = 0,
  estimatedWaitMinutes,
  queueTypeOverride
}: QueueAssignmentCardProps) {
  const queueType = queueTypeOverride || classifyDRQueue(grade);
  const isRisk = queueType === 'RISK_PRIORITY';

  // Compute wait time if not provided
  const waitMinutes = estimatedWaitMinutes !== undefined 
    ? estimatedWaitMinutes 
    : (isRisk ? patientsAhead : patientsAhead);
  const waitDisplay = waitMinutes === 0 ? '0 minutes' : `~${waitMinutes} minute${waitMinutes > 1 ? 's' : ''}`;

  return (
    <div className="print-break-inside-avoid border-2 border-slate-900 p-4 space-y-3 bg-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 border-b border-slate-200 pb-2">
        <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
          CLINICAL QUEUE ASSIGNMENT & WAITING TIME ESTIMATE
        </h3>
        <span className="text-[9px] font-mono text-slate-500 font-medium">
          Discrete-Event Queue Model
        </span>
      </div>

      {/* Alert / Queue Banner */}
      {isRisk ? (
        <div className="bg-rose-50 border border-rose-300 p-2.5 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-rose-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
              !
            </div>
            <span className="font-black text-rose-950 text-xs uppercase tracking-wide">
              RISK PRIORITY QUEUE
            </span>
          </div>
          <span className="px-2.5 py-0.5 bg-rose-100/90 border border-rose-300 text-rose-800 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-2xs">
            HIGH-PRIORITY REFERRAL (GRADE {grade}: {gradeLabel.toUpperCase()})
          </span>
        </div>
      ) : (
        <div className="bg-teal-50 border border-teal-300 p-2.5 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-teal-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span className="font-black text-teal-950 text-xs uppercase tracking-wide">
              NORMAL FIFO QUEUE
            </span>
          </div>
          <span className="px-2.5 py-0.5 bg-teal-100/90 border border-teal-300 text-teal-800 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-2xs">
            ROUTINE / PERIODIC MONITORING (GRADE {grade}: {gradeLabel.toUpperCase()})
          </span>
        </div>
      )}

      {/* Three Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Metric 1: Your Position */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-center gap-1">
            <User className="w-3 h-3 text-slate-600" /> YOUR POSITION
          </div>
          <div className="text-2xl font-black text-slate-900 leading-none">
            #{rank}
          </div>
          <div className="text-[9px] text-slate-500 font-medium">
            Rank in {isRisk ? 'Risk Queue' : 'Normal Queue'}
          </div>
        </div>

        {/* Metric 2: Patients Ahead */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-center gap-1">
            <Users className="w-3 h-3 text-slate-600" /> PATIENTS AHEAD
          </div>
          <div className="text-2xl font-black text-slate-900 leading-none">
            {patientsAhead}
          </div>
          <div className="text-[9px] text-slate-500 font-medium">
            {patientsAhead === 1 ? '1 patient ahead' : `${patientsAhead} patients ahead`}
          </div>
        </div>

        {/* Metric 3: Estimated Wait Time */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 text-slate-600" /> ESTIMATED WAIT TIME
          </div>
          <div className="text-2xl font-black text-slate-900 leading-none">
            {waitDisplay}
          </div>
          <div className="text-[9px] text-slate-500 font-medium">
            Based on 60s/case review (Est.)
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 pt-1 text-[9.5px] text-slate-500 border-t border-slate-100">
        <div className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>
            {isRisk
              ? 'High-risk cases fast-tracked ahead of routine screenings for rapid specialist review.'
              : 'Routine screenings processed chronologically after high-risk fast-track review.'}
          </span>
        </div>
        <span className="font-mono text-slate-600 font-semibold shrink-0">
          1 Doctor Active (60s/case)
        </span>
      </div>
    </div>
  );
}
