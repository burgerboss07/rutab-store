import './globals.css';
import LenisProvider from '@/components/LenisProvider';
import FaviconUpdater from '@/components/FaviconUpdater';
import SessionProvider from '@/components/SessionProvider';
import SyncProvider from '@/components/SyncProvider';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { createClient } from '@supabase/supabase-js';

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
    <html lang="en">
      <head />
      <body className="antialiased">
        <SpeedInsights />
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
