import './globals.css';
import LenisProvider from '@/components/LenisProvider';
import AuthProvider from '@/components/AuthProvider';

export const metadata = {
  title: 'RUTAB 2.0 — Luxury Streetwear Experience',
  description: 'A premium, high-performance dark e-commerce destination for GCC youth streetwear drops. Express delivery in Kuwait and Gulf regions.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">
        <LenisProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
