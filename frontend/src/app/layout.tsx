import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '../lib/authContext';
import Navbar from '../components/Navbar';
import dynamic from 'next/dynamic';

// 1. IMPORT DYNAMICALLY AND DISABLE SSR
const OfflineSyncBadge = dynamic(
  () => import('../components/OfflineSyncBadge'), 
  { ssr: false } 
);

export const metadata: Metadata = {
  title: 'RetinaScan AI - Diabetic Retinopathy Clinical Screening Platform',
  description: 'AI-assisted Diabetic Retinopathy Screening Pipeline with MATLAB bridge inference, ResNet-50 grading, and U-Net lesion segmentation.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[url('/theme-bg.png')] bg-cover bg-fixed bg-center bg-no-repeat min-h-screen text-slate-900 print:bg-none print:min-h-0 print:text-black">
        <div className="min-h-screen flex flex-col bg-slate-100/30 backdrop-blur-sm print:min-h-0 print:block print:bg-transparent">
          <AuthProvider>
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 print:p-0 print:m-0 print:max-w-none print:block">
              {children}
            </main>
          </AuthProvider>
        </div>
        
        {/* 2. THIS WILL NOW ONLY LOAD ON THE CLIENT SIDE */}
        <OfflineSyncBadge />
      </body>
    </html>
  );
}