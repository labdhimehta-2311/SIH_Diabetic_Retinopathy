'use client';

import React from 'react';
import { ShieldCheck, Clock, User, FileText, X } from 'lucide-react';
import { AuditEntry } from '../lib/auditService';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditEntry[];
}

export default function AuditTrailModal({ isOpen, onClose, logs }: AuditTrailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Regulatory & Clinical Audit Trail
              </h3>
              <p className="text-xs text-slate-500">
                Immutable chronological log of all AI screening runs, edits, and clinical actions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {logs.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              No audit records logged yet for this scope.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-50 transition-colors text-xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-teal-600" />
                    {log.action}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="text-slate-600 mb-2">{log.summary}</p>

                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    {log.doctorName} ({log.doctorId})
                  </span>
                  {log.patientId && (
                    <span className="bg-slate-200/70 px-1.5 py-0.5 rounded text-slate-700 font-mono">
                      Pt: {log.patientId}
                    </span>
                  )}
                  {log.screeningId && (
                    <span className="bg-teal-100/70 text-teal-800 px-1.5 py-0.5 rounded font-mono">
                      Scr: {log.screeningId}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-all"
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
}
