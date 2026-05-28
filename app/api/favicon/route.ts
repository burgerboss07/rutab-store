import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceKey) {
    try {
      const client = createClient(supabaseUrl, serviceKey);
      const { data } = await client.from('settings').select('value').eq('key', 'store_settings').maybeSingle();
      const logo = data?.value?.store_logo;

      if (logo) {
        const res = await fetch(logo, { cache: 'no-cache' });
        if (res.ok) {
          const buffer = await res.arrayBuffer();
          const contentType = res.headers.get('content-type') || 'image/png';
          return new NextResponse(buffer, {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=3600',
            },
          });
        }
      }
    } catch {}
  }

  return NextResponse.redirect(new URL('/favicon.svg', process.env.NEXT_PUBLIC_SITE_URL || 'https://rutab.store'));
}
