import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error(
      '[Supabase] Missing env vars:',
      !url ? 'NEXT_PUBLIC_SUPABASE_URL' : '',
      !key ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : ''
    );
  }

  return createBrowserClient(
    url || 'https://placeholder.supabase.co',
    key || 'placeholder-key'
  );
}
