import React from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, AlertCircle } from 'lucide-react';

interface SeverityBadgeProps {
  grade: number;
  referable?: boolean;
  confidence?: number;
  size?: 'sm' | 'md' | 'lg';
}

const GRADE_CONFIG = [
  {
    label: 'Grade 0: No DR',
    fullLabel: 'No Apparent Diabetic Retinopathy',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    dot: 'bg-emerald-500',
    icon: CheckCircle
  },
  {
    label: 'Grade 1: Mild NPDR',
    fullLabel: 'Mild Non-Proliferative Diabetic Retinopathy',
    bg: 'bg-amber-50 text-amber-800 border-amber-300',
    dot: 'bg-amber-500',
    icon: AlertCircle
  },
  {
    label: 'Grade 2: Moderate NPDR',
    fullLabel: 'Moderate Non-Proliferative Diabetic Retinopathy',
    bg: 'bg-orange-50 text-orange-800 border-orange-300',
    dot: 'bg-orange-500',
    icon: AlertTriangle
  },
  {
    label: 'Grade 3: Severe NPDR',
    fullLabel: 'Severe Non-Proliferative Diabetic Retinopathy',
    bg: 'bg-rose-50 text-rose-800 border-rose-300',
    dot: 'bg-rose-600',
    icon: ShieldAlert
  },
  {
    label: 'Grade 4: Proliferative DR',
    fullLabel: 'Proliferative Diabetic Retinopathy',
    bg: 'bg-red-100 text-red-950 border-red-400',
    dot: 'bg-red-700',
    icon: ShieldAlert
  }
];

export default function SeverityBadge({ grade, referable, confidence, size = 'md' }: SeverityBadgeProps) {
  const safeGrade = Math.max(0, Math.min(4, Math.floor(grade || 0)));
  const config = GRADE_CONFIG[safeGrade];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs sm:text-sm',
    lg: 'px-4 py-2 text-base'
  }[size];

  return (
    <div className="inline-flex items-center gap-2 flex-wrap">
      <div className={`inline-flex items-center gap-1.5 font-semibold rounded-full border shadow-sm ${config.bg} ${sizeClasses}`}>
        <span className={`w-2 h-2 rounded-full ${config.dot}`} />
        <Icon className="w-4 h-4 shrink-0" />
        <span>{config.label}</span>
        {confidence !== undefined && (
          <span className="opacity-75 font-normal ml-0.5">({confidence}%)</span>
        )}
      </div>

      {referable !== undefined && (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
            referable
              ? 'bg-rose-100 text-rose-800 border-rose-200'
              : 'bg-teal-100 text-teal-800 border-teal-200'
          }`}
        >
          {referable ? '● Referable DR' : '○ Non-Referable'}
        </span>
      )}
    </div>
  );
}
