import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface AuditEntry {
  id: string;
  timestamp: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  screeningId?: string;
  action: 'AI_SCREENING_RUN' | 'CLINICAL_NOTES_EDIT' | 'DIAGNOSIS_OVERRIDE' | 'REPORT_EXPORTED_PDF' | 'PATIENT_ENROLLED';
  summary: string;
  details?: Record<string, any>;
}

const AUDIT_STORAGE_KEY = 'dr_audit_logs_v1';

export const AuditService = {
  getLogs(doctorId?: string, patientId?: string): AuditEntry[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
      let logs: AuditEntry[] = raw ? JSON.parse(raw) : [];
      if (doctorId) logs = logs.filter(l => l.doctorId === doctorId);
      if (patientId) logs = logs.filter(l => l.patientId === patientId);
      return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (e) {
      return [];
    }
  },

  async logAction(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<AuditEntry> {
    const fullEntry: AuditEntry = {
      ...entry,
      id: 'AUD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
      timestamp: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
        const list: AuditEntry[] = raw ? JSON.parse(raw) : [];
        list.unshift(fullEntry);
        // Keep last 500 audit logs locally
        localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(list.slice(0, 500)));
      } catch (e) {
        console.error("Local audit log save failed:", e);
      }

      try {
        if (navigator.onLine) {
          await addDoc(collection(db, 'audit_logs'), fullEntry);
        }
      } catch (e) {
        // Cached in firestore offline queue automatically
      }
    }

    return fullEntry;
  }
};
