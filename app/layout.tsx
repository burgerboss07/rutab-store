import './globals.css';
import LenisProvider from '@/components/LenisProvider';
import { createClient } from '@supabase/supabase-js';

export async function generateMetadata() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let title = 'RUTAB رطب — Luxury Streetwear Experience';
  let description = 'A premium, high-performance dark e-commerce destination for GCC youth streetwear drops. Express delivery in Kuwait and Gulf regions.';
  let logoUrl = '';

  if (supabaseUrl && serviceKey) {
    try {
      const client = createClient(supabaseUrl, serviceKey);
      const { data } = await client.from('settings').select('value').eq('key', 'store_settings').maybeSingle();
      if (data?.value) {
        if (data.value.meta_title) title = data.value.meta_title;
        if (data.value.meta_description) description = data.value.meta_description;
        if (data.value.store_logo) logoUrl = data.value.store_logo;
      }
    } catch {}
  }

  return {
    title,
    description,
    icons: logoUrl ? { icon: logoUrl, apple: logoUrl } : { icon: '/favicon.ico' },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className="antialiased">
        <LenisProvider>
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
