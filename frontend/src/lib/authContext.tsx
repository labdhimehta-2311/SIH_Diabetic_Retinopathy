'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut as fbSignOut, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth } from './firebase';
import { SyncQueue } from './syncQueue'; // <-- NEW: Imported SyncQueue

export interface DoctorProfile {
  uid: string;
  email: string;
  displayName: string;
  clinic: string;
  role: string;
  medicalLicense: string;
}

interface AuthContextType {
  user: User | null;
  doctor: DoctorProfile | null;
  availableProfiles: Record<string, DoctorProfile>;
  loading: boolean;
  loginWithGoogle: () => Promise<User>;
  completeProfile: (name: string, clinic: string, role: string) => void;
  selectActiveDoctor: (uid: string) => void;
  deactivateActiveDoctor: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, doctor: null, availableProfiles: {}, loading: true,
  loginWithGoogle: async () => { throw new Error('Not implemented'); },
  completeProfile: () => {}, selectActiveDoctor: () => {}, deactivateActiveDoctor: () => {}, logout: async () => {}
});

const DEFAULT_DEMO_PROFILES: Record<string, DoctorProfile> = {
  'doc_sarah_rao_vitreo_01': {
    uid: 'doc_sarah_rao_vitreo_01',
    email: 'sarah.rao@retinx.org',
    displayName: 'Dr. Sarah Rao, MD',
    clinic: 'Apex Retina Institute & Metabolic Center',
    role: 'Vitreoretinal Specialist',
    medicalLicense: 'LIC-RAO-9012'
  },
  'doc_marcus_vance_rural_02': {
    uid: 'doc_marcus_vance_rural_02',
    email: 'marcus.vance@retinx.org',
    displayName: 'Dr. Marcus Vance, DO',
    clinic: 'Community Health Vision Network',
    role: 'Comprehensive Outreach Ophthalmologist',
    medicalLicense: 'LIC-VAN-4481'
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [availableProfiles, setAvailableProfiles] = useState<Record<string, DoctorProfile>>({});
  const [loading, setLoading] = useState(true);

  // --- NEW: Global Offline-to-Online Auto-Sync Listener ---
  useEffect(() => {
    const handleOnline = async () => {
      console.log("Internet restored! Processing offline queue...");
      try {
        await SyncQueue.processQueue(); 
        window.location.reload(); 
      } catch (error) {
        console.error("Failed to process sync queue on reconnection:", error);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  useEffect(() => {
    // Load all previously signed-in accounts from local storage
    const savedProfilesStr = localStorage.getItem('dr_profiles_v3');
    let savedProfiles = savedProfilesStr ? JSON.parse(savedProfilesStr) : null;
    if (!savedProfiles || Object.keys(savedProfiles).length === 0) {
      savedProfiles = DEFAULT_DEMO_PROFILES;
      localStorage.setItem('dr_profiles_v3', JSON.stringify(DEFAULT_DEMO_PROFILES));
    }
    setAvailableProfiles(savedProfiles);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      const isActiveSession = localStorage.getItem('dr_active_v3') === 'true';
      const currentUid = localStorage.getItem('dr_current_uid');

      if (currentUser) {
        if (isActiveSession && savedProfiles[currentUser.uid]) {
          setDoctor(savedProfiles[currentUser.uid]);
        } else {
          setDoctor(null);
        }
      } else {
        // If Firebase is disconnected but they had an active session (e.g. they switched provider)
        if (isActiveSession && currentUid && savedProfiles[currentUid]) {
           setDoctor(savedProfiles[currentUid]);
        } else {
           setDoctor(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    return result.user;
  };

  const completeProfile = (name: string, clinic: string, role: string) => {
    if (!user) return;
    const profile: DoctorProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: name,
      clinic: clinic,
      role: role,
      medicalLicense: `LIC-${user.uid.slice(0, 6).toUpperCase()}`
    };
    
    setDoctor(profile);
    
    const savedProfilesStr = localStorage.getItem('dr_profiles_v3');
    const savedProfiles = savedProfilesStr ? JSON.parse(savedProfilesStr) : {};
    savedProfiles[user.uid] = profile;
    setAvailableProfiles(savedProfiles);
    
    localStorage.setItem('dr_profiles_v3', JSON.stringify(savedProfiles));
    localStorage.setItem('dr_current_uid', user.uid);
    localStorage.setItem('dr_active_v3', 'true');
  };

  const selectActiveDoctor = (uid: string) => {
    if (!availableProfiles[uid]) return;
    setDoctor(availableProfiles[uid]);
    localStorage.setItem('dr_current_uid', uid);
    localStorage.setItem('dr_active_v3', 'true');
  };

  const deactivateActiveDoctor = () => {
    setDoctor(null);
    localStorage.setItem('dr_active_v3', 'false');
  };

  const logout = async () => {
    setDoctor(null);
    localStorage.setItem('dr_active_v3', 'false');
    localStorage.removeItem('dr_current_uid');
    try { await fbSignOut(auth); } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{ user, doctor, availableProfiles, loading, loginWithGoogle, completeProfile, selectActiveDoctor, deactivateActiveDoctor, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);