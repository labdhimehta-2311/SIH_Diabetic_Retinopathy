/**
 * =============================================================================
 * CLINICAL TRIAGE & AI RISK PRIORITY QUEUE SERVICE
 * =============================================================================
 * Implements discrete-event queue management for Diabetic Retinopathy screening:
 * - DR Grade 3, 4 -> AI RISK PRIORITY QUEUE (High-Risk Fast-Track)
 * - DR Grade 0, 1, 2 -> NORMAL FIFO QUEUE (Chronological Routine Review)
 * 
 * Review capacity model: 1 Reviewing Doctor @ 60s/case (~60 patients/hour)
 * =============================================================================
 */

import { Patient, ScreeningSession } from './patientService';

export type QueueType = 'RISK_PRIORITY' | 'NORMAL_FIFO';

export interface QueuePatientItem {
  patientId: string;
  patientName: string;
  age?: number;
  sex?: string;
  phone?: string;
  screeningId: string;
  screeningDate: string;
  timestamp: number;
  grade: number;
  gradeLabel: string;
  confidence: number;
  referable: boolean;
  queueType: QueueType;
  rank: number;
  patientsAhead: number;
  estimatedWaitMinutes: number;
  waitDisplay: string;
  subtitle: string;
}

export interface QueueSystemState {
  totalEnrolled: number;
  riskQueue: QueuePatientItem[];
  normalQueue: QueuePatientItem[];
  activeReferrals: number;
  allQueuedPatients: Map<string, QueuePatientItem>;
}

export function classifyDRQueue(grade: number): QueueType {
  // If DR = 3 or 4 -> AI Risk Priority Queue
  // If DR = 0, 1, or 2 -> Normal FIFO Queue
  return (grade >= 3) ? 'RISK_PRIORITY' : 'NORMAL_FIFO';
}

export function getQueueSubtitle(grade: number, gradeLabel: string): string {
  if (grade === 4) {
    return 'Urgent Surgical/PRP Triage (Grade 4: Proliferative DR)';
  } else if (grade === 3) {
    return 'High-Priority Referral (Grade 3: Severe NPDR)';
  } else if (grade === 2) {
    return 'Close Monitoring (Grade 2: Moderate NPDR)';
  } else if (grade === 1) {
    return 'Periodic Monitoring (Grade 1: Mild NPDR)';
  } else {
    return 'Routine Monitoring (Grade 0: Normal Retina)';
  }
}

/**
 * Computes the full discrete-event queue state across all patients.
 */
export function computeQueueSystem(patients: Patient[]): QueueSystemState {
  const riskList: QueuePatientItem[] = [];
  const normalList: QueuePatientItem[] = [];
  const queueMap = new Map<string, QueuePatientItem>();

  let activeReferralsCount = 0;

  patients.forEach(patient => {
    if (!patient || !patient.screenings || patient.screenings.length === 0) {
      return;
    }

    const latestScreening: ScreeningSession = patient.screenings[0];
    const ai = latestScreening.aiResults;
    if (!ai) return;

    const grade = ai.grade ?? 0;
    const isReferable = Boolean(ai.referable || grade >= 2);
    if (isReferable) {
      activeReferralsCount++;
    }

    const queueType = classifyDRQueue(grade);
    const screeningTime = new Date(latestScreening.createdAt || latestScreening.date || 0).getTime();

    const item: QueuePatientItem = {
      patientId: patient.id,
      patientName: patient.name || 'Unnamed Patient',
      age: patient.age,
      sex: patient.sex,
      phone: patient.phone,
      screeningId: latestScreening.id,
      screeningDate: latestScreening.date,
      timestamp: isNaN(screeningTime) ? 0 : screeningTime,
      grade,
      gradeLabel: ai.gradeLabel || `Grade ${grade}`,
      confidence: ai.confidence || 95.0,
      referable: isReferable,
      queueType,
      rank: 0,
      patientsAhead: 0,
      estimatedWaitMinutes: 0,
      waitDisplay: '',
      subtitle: getQueueSubtitle(grade, ai.gradeLabel || '')
    };

    if (queueType === 'RISK_PRIORITY') {
      riskList.push(item);
    } else {
      normalList.push(item);
    }
  });

  // Sort Risk Priority Queue:
  // Highest severity first (Grade 4 before Grade 3), then earlier arrivals first (FIFO within severity tier)
  riskList.sort((a, b) => {
    if (b.grade !== a.grade) {
      return b.grade - a.grade; // Grade 4 before Grade 3
    }
    return a.timestamp - b.timestamp; // FIFO
  });

  // Sort Normal FIFO Queue:
  // Pure FIFO based on arrival timestamp
  normalList.sort((a, b) => a.timestamp - b.timestamp);

  // Assign rankings and discrete-event waiting times
  // Doctor review rate: 1 case / minute (60s nominal)
  riskList.forEach((item, index) => {
    const rank = index + 1;
    const ahead = index;
    const waitMins = index; // 0 mins for #1, 1 min for #2, etc.

    item.rank = rank;
    item.patientsAhead = ahead;
    item.estimatedWaitMinutes = waitMins;
    item.waitDisplay = waitMins === 0 ? '0 minutes' : `~${waitMins} minute${waitMins > 1 ? 's' : ''}`;

    queueMap.set(item.patientId, item);
  });

  const totalRiskCases = riskList.length;

  normalList.forEach((item, index) => {
    const rank = index + 1;
    // Normal cases are reviewed after all risk priority cases
    const totalAhead = totalRiskCases + index;
    const waitMins = totalRiskCases + index;

    item.rank = rank;
    item.patientsAhead = totalAhead;
    item.estimatedWaitMinutes = waitMins;
    item.waitDisplay = `~${waitMins} minute${waitMins > 1 ? 's' : ''}`;

    queueMap.set(item.patientId, item);
  });

  return {
    totalEnrolled: patients.length,
    riskQueue: riskList,
    normalQueue: normalList,
    activeReferrals: activeReferralsCount,
    allQueuedPatients: queueMap
  };
}
