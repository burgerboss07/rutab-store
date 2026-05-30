import './globals.css';
import { Bebas_Neue, Poppins, Inter } from 'next/font/google';
import LenisProvider from '@/components/LenisProvider';
import FaviconUpdater from '@/components/FaviconUpdater';
import SessionProvider from '@/components/SessionProvider';
import SyncProvider from '@/components/SyncProvider';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import { createClient } from '@supabase/supabase-js';

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  display: 'optional',
  variable: '--font-bebas-neue',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  display: 'optional',
  variable: '--font-poppins',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'optional',
  variable: '--font-inter',
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let title = 'RUTAB رطب — Luxury Streetwear Experience';
  let description = 'A premium, high-performance dark e-commerce destination for GCC youth streetwear drops. Express delivery in Kuwait and Gulf regions.';

  if (supabaseUrl && serviceKey) {
    try {
      const client = createClient(supabaseUrl, serviceKey);
      const { data } = await client.from('settings').select('value').eq('key', 'store_settings').maybeSingle();
      if (data?.value) {
        if (data.value.meta_title) title = data.value.meta_title;
        if (data.value.meta_description) description = data.value.meta_description;
      }
    } catch {}
  }

  return {
    title,
    description,
    icons: { icon: '/api/favicon', apple: '/api/favicon' },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${poppins.variable} ${inter.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {supabaseUrl && <link rel="preconnect" href={supabaseUrl} />}
        {supabaseUrl && <link rel="dns-prefetch" href={supabaseUrl} />}
      </head>
      <body className="antialiased">
        <SpeedInsights />
        <Analytics />
        <FaviconUpdater />
        <SessionProvider>
          <SyncProvider>
            <LenisProvider>
              {children}
            </LenisProvider>
          </SyncProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
