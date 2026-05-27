'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark'); // Safe default

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme') as 'light' | 'dark';
    if (saved) {
      setTheme(saved);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Apply theme class to html element
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const toggle = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  if (!mounted) {
    // Return empty shell with same size/styling during SSR to avoid mismatch
    return (
      <div className="w-16 h-6 flex items-center justify-center bg-black/30 rounded-full opacity-0" />
    );
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/30 hover:bg-black/50 transition cursor-pointer"
      aria-label="Toggle dark/light mode"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4 text-[#ff0000]" /> : <Moon className="w-4 h-4 text-[#ff0000]" />}
      <span className="text-xs font-medium uppercase text-white">{theme}</span>
    </button>
  );
}
