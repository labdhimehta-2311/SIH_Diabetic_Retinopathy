import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '../lib/authContext';
import Navbar from '../components/Navbar';
import Link from 'next/link';
export const metadata: Metadata = {
  title: 'RetinaScan AI - Diabetic Retinopathy Clinical Screening Platform',
  description: 'AI-assisted Diabetic Retinopathy Screening Pipeline with MATLAB bridge inference, ResNet-50 grading, and U-Net lesion segmentation.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[url('/theme-bg.png')] bg-cover bg-fixed bg-center bg-no-repeat min-h-screen text-slate-900">
        <div className="min-h-screen flex flex-col bg-slate-100/30 backdrop-blur-sm">
          <AuthProvider>
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </main>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}