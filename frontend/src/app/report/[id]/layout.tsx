'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/authContext';
import { PatientService, Patient, ScreeningSession } from '../../../lib/patientService';
import SihEnhancements from '../../../components/SihEnhancements';

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const searchParams = useSearchParams();
  const { doctor } = useAuth();
  const patientId = params?.id as string;
  const screeningIdParam = searchParams?.get('screeningId');

  const [patient, setPatient] = useState<Patient | null>(null);
  const [screening, setScreening] = useState<ScreeningSession | null>(null);

  useEffect(() => {
    if (!doctor || !patientId) return;
    PatientService.getPatientById(patientId, doctor.uid).then((p) => {
      if (!p) return;
      setPatient(p);
      const screenings = p.screenings || [];
      const s = screeningIdParam 
        ? screenings.find((sc) => sc.id === screeningIdParam) || screenings[0]
        : screenings[0];
      setScreening(s || null);
    });
  }, [doctor, patientId, screeningIdParam]);

  return (
    <div className="report-layout-wrapper">
      {children}
      {screening && (
        <div className="max-w-5xl mx-auto mt-4 print:mt-2 print:p-0">
          <SihEnhancements screening={screening} patient={patient} />
        </div>
      )}
    </div>
  );
}
