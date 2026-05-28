import './globals.css';
import LenisProvider from '@/components/LenisProvider';

export const metadata = {
  title: 'RUTAB رطب — Luxury Streetwear Experience',
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
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
