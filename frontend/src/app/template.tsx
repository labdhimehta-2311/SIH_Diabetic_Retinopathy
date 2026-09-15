'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function RootTemplate({ children }: { children: React.ReactNode }) {
  const container = useRef(null);

  useGSAP(() => {
    // Fades and slides the entire page content up seamlessly on route change
    gsap.fromTo(
      container.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    );
  }, { scope: container });

  return <div ref={container} className="w-full h-full">{children}</div>;
}