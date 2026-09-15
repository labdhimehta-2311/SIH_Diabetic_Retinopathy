'use client';

import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { SyncQueue, QueuedScreening } from '../lib/syncQueue';

export default function OfflineStatusBadge() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncMsg, setLastSyncMsg] = useState('');

  const updateQueueStatus = () => {
    const list = SyncQueue.getPending();
    setPendingCount(list.length);
  };

  useEffect(() => {
    setIsOnline(navigator.onLine);
    updateQueueStatus();

    const handleOnline = () => {
      setIsOnline(true);
      triggerAutoSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleQueueChange = () => {
      updateQueueStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('sync_queue_updated', handleQueueChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('sync_queue_updated', handleQueueChange);
    };
  }, []);

  const triggerAutoSync = async () => {
    setIsSyncing(true);
    try {
      const count = await SyncQueue.processQueue((msg) => setLastSyncMsg(msg));
      if (count > 0) {
        setLastSyncMsg(`Synced ${count} screening session(s)`);
        setTimeout(() => setLastSyncMsg(''), 4000);
      }
    } finally {
      setIsSyncing(false);
      updateQueueStatus();
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      {isOnline ? (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Wifi className="w-3.5 h-3.5" />
          <span>Online (Cloud Sync Active)</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-full font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode (Local Cache Active)</span>
        </div>
      )}

      {pendingCount > 0 && (
        <button
          onClick={triggerAutoSync}
          disabled={!isOnline || isSyncing}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full font-medium shadow-sm transition-all"
          title={isOnline ? "Click to trigger pending sync" : "Will auto-sync when network returns"}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : `${pendingCount} Queued for Sync`}</span>
        </button>
      )}

      {lastSyncMsg && (
        <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-teal-600" />
          {lastSyncMsg}
        </span>
      )}
    </div>
  );
}
