import { PatientService, ScreeningSession } from './patientService';
import { AuditService } from './auditService';

export interface QueuedScreening {
  queueId: string;
  queuedAt: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  visualExam: any;
  checkM3Setup: boolean;
  sampleId?: string; // If using sample
  imageFileBase64?: string; // If uploaded raw image offline
  imageFileName?: string;
  status: 'PENDING' | 'SYNCING' | 'COMPLETED' | 'FAILED';
  error?: string;
}

const QUEUE_STORAGE_KEY = 'dr_screening_sync_queue_v1';

export const SyncQueue = {
  getPending(): QueuedScreening[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  enqueue(item: Omit<QueuedScreening, 'queueId' | 'queuedAt' | 'status'>): QueuedScreening {
    const entry: QueuedScreening = {
      ...item,
      queueId: 'Q-' + Date.now().toString(36).toUpperCase(),
      queuedAt: new Date().toISOString(),
      status: 'PENDING'
    };

    const current = this.getPending();
    current.push(entry);
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('sync_queue_updated'));
    return entry;
  },

  async processQueue(onProgress?: (msg: string) => void): Promise<number> {
    if (typeof window === 'undefined' || !navigator.onLine) return 0;
    const list = this.getPending();
    const pendingItems = list.filter(i => i.status === 'PENDING' || i.status === 'FAILED');
    if (pendingItems.length === 0) return 0;

    let processedCount = 0;

    for (const item of pendingItems) {
      try {
        item.status = 'SYNCING';
        localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(list));
        window.dispatchEvent(new CustomEvent('sync_queue_updated'));

        if (onProgress) onProgress(`Syncing screening for patient ${item.patientId}...`);

        let aiResult: any;

        if (item.sampleId) {
          const res = await fetch('/api/screen-sample', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sample_id: item.sampleId,
              check_M3_setup: item.checkM3Setup
            })
          });
          if (!res.ok) throw new Error(`Sample screening failed with status ${res.status}`);
          aiResult = await res.json();
        } else if (item.imageFileBase64) {
          // Convert base64 to Blob
          const byteString = atob(item.imageFileBase64.split(',')[1] || item.imageFileBase64);
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: 'image/png' });
          const formData = new FormData();
          formData.append('image', blob, item.imageFileName || 'fundus.png');
          formData.append('patient_id', item.patientId);
          formData.append('doctor_id', item.doctorId);
          formData.append('check_M3_setup', item.checkM3Setup ? 'true' : 'false');

          const res = await fetch('/api/screen', {
            method: 'POST',
            body: formData
          });
          if (!res.ok) throw new Error(`Image screening failed with status ${res.status}`);
          aiResult = await res.json();
        }

        if (aiResult && aiResult.success) {
          const session: ScreeningSession = {
            id: 'SCR-' + (aiResult.sessionId || Date.now().toString().slice(-4)),
            date: new Date().toISOString().split('T')[0],
            doctorId: item.doctorId,
            doctorName: item.doctorName,
            visualExam: item.visualExam,
            checkM3Setup: item.checkM3Setup,
            aiResults: aiResult,
            clinicalNotes: `AI Screening completed via offline auto-sync. Predicted grade: ${aiResult.gradeLabel} (Confidence: ${aiResult.confidence}%).`,
            recommendation: aiResult.referable 
              ? 'Refer to Ophthalmologist / Vitreoretinal Specialist for detailed macular evaluation.' 
              : 'Annual follow-up recommended. Glycemic control maintained.',
            followUpInterval: aiResult.referable ? '1 - 3 Months' : '12 Months',
            finalized: false,
            createdAt: new Date().toISOString()
          };

          await PatientService.addScreeningSession(item.patientId, item.doctorId, session);
          await AuditService.logAction({
            doctorId: item.doctorId,
            doctorName: item.doctorName,
            patientId: item.patientId,
            screeningId: session.id,
            action: 'AI_SCREENING_RUN',
            summary: `Automated offline sync screening run for Patient ${item.patientId}. Grade: ${aiResult.grade}`,
            details: { aiResult, source: 'offline_sync_queue' }
          });

          item.status = 'COMPLETED';
          processedCount++;
        }
      } catch (err: any) {
        console.error("Failed to sync queued screening item:", err);
        item.status = 'FAILED';
        item.error = err.message || 'Unknown network error';
      }
    }

    // Keep completed items briefly or remove
    const remaining = list.filter(i => i.status !== 'COMPLETED');
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(remaining));
    window.dispatchEvent(new CustomEvent('sync_queue_updated'));

    return processedCount;
  }
};
