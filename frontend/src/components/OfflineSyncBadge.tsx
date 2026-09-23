'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, Database, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';

export default function OfflineSyncBadge() {
  const [isOnline, setIsOnline] = useState(true);
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    // Fetch the actual patient items, not just the length
    const updateQueue = () => {
      try {
        const queueStr = localStorage.getItem('dr_screening_sync_queue_v1') || '[]';
        const queue = JSON.parse(queueStr);
        setQueueItems(Array.isArray(queue) ? queue : []);
      } catch (e) {
        setQueueItems([]);
      }
    };

    updateQueue();

    const handleOnline = () => {
      setIsOnline(true);
      if (queueItems.length > 0) {
        setIsSyncing(true);
        setIsExpanded(false); // Auto-close the list when syncing starts
        setTimeout(() => {
          setIsSyncing(false);
          setQueueItems([]);
        }, 3000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateQueue();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const interval = setInterval(updateQueue, 2000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [queueItems.length]);

  if (isOnline && queueItems.length === 0 && !isSyncing) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end animate-in slide-in-from-bottom-5 fade-in duration-300 print:hidden no-print">
      
      {/* 1. EXPANDABLE QUEUE LEDGER */}
      {isExpanded && queueItems.length > 0 && !isSyncing && (
        <div className="mb-3 w-72 bg-white/90 backdrop-blur-xl border border-rose-200 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in">
          <div className="bg-rose-50 border-b border-rose-100 px-4 py-3 flex justify-between items-center">
            <span className="text-[10px] font-bold text-rose-800 uppercase tracking-widest">Pending AI Inference</span>
            <span className="text-[10px] font-black text-rose-700 bg-rose-200/60 px-2 py-0.5 rounded-full">{queueItems.length}</span>
          </div>
          <div className="max-h-60 overflow-y-auto p-2 space-y-1.5">
            {queueItems.map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm flex flex-col gap-1">
                <div className="text-xs font-bold text-slate-800 flex justify-between items-center">
                  <span>{item.patientId || `Patient #${idx + 1}`}</span>
                  <Database className="w-3.5 h-3.5 text-rose-400" />
                </div>
                {item.doctorName && <div className="text-[10px] text-slate-500 font-medium">Dr. {item.doctorName}</div>}
                <div className="text-[9px] text-slate-400 italic">Saved securely to local storage</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. MAIN BADGE BUTTON */}
      <button 
        onClick={() => queueItems.length > 0 && !isSyncing && setIsExpanded(!isExpanded)}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border transition-all ${
          isSyncing 
            ? 'bg-teal-600/90 border-teal-400 text-white cursor-default' 
            : queueItems.length > 0 
              ? 'bg-rose-600/90 border-rose-400 text-white hover:bg-rose-700 hover:scale-[1.02] cursor-pointer active:scale-95'
              : 'bg-rose-600/90 border-rose-400 text-white cursor-default'
        }`}
      >
        {isSyncing ? (
          <RefreshCw className="w-5 h-5 animate-spin" />
        ) : queueItems.length > 0 ? (
          <Database className="w-5 h-5" />
        ) : (
          <WifiOff className="w-5 h-5 animate-pulse" />
        )}

        <div className="flex flex-col text-left">
          <span className="text-xs font-black uppercase tracking-wider opacity-80">
            {isSyncing 
              ? 'Connection Restored' 
              : isOnline 
                ? 'Sync Failed / Pending' 
                : 'Network Offline'}
          </span>
          <span className="text-sm font-bold">
            {isSyncing 
              ? 'Syncing patients to cloud...' 
              : queueItems.length === 0 
                ? 'Ready for offline screening'
                : `${queueItems.length} Patient${queueItems.length > 1 ? 's' : ''} queued locally`}
          </span>
        </div>
        
        {/* Toggle Arrow (Only visible if there are items to show) */}
        {!isSyncing && queueItems.length > 0 && (
          <div className="ml-2 pl-3 border-l border-white/30">
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </div>
        )}
      </button>
    </div>
  );
}