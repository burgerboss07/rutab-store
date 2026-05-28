import './globals.css';
import LenisProvider from '@/components/LenisProvider';
import FaviconUpdater from '@/components/FaviconUpdater';
import { createClient } from '@supabase/supabase-js';

export const metadata = {
  title: 'RUTAB رطب — Luxury Streetwear Experience',
  description: 'A premium, high-performance dark e-commerce destination for GCC youth streetwear drops. Express delivery in Kuwait and Gulf regions.',
  icons: { icon: '/favicon.ico', apple: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className="antialiased">
        <FaviconUpdater />
        <LenisProvider>
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
