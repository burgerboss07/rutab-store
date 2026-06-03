'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId: number;
    let idleTimeout: ReturnType<typeof setTimeout>;

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    function startRaf() {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(raf);
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => {
        cancelAnimationFrame(rafId);
      }, 2000);
    }

    lenis.on('scroll', startRaf);
    startRaf();

    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
    });
    
    if (typeof document !== 'undefined' && document.body) {
      resizeObserver.observe(document.body);
    }

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(idleTimeout);
      resizeObserver.disconnect();
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}

