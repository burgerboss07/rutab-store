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
    key || 'placeholder-key',
    {
      cookies: {
        getAll() {
          if (typeof document === 'undefined') return [];
          const cookies = document.cookie.split('; ').filter(Boolean);
          return cookies.map(c => {
            const [name, ...rest] = c.split('=');
            return { name, value: rest.join('=') };
          });
        },
        setAll(cookiesToSet) {
          if (typeof document === 'undefined') return;
          cookiesToSet.forEach(({ name, value, options }) => {
            let cookie = `${name}=${value}; path=/; max-age=${options?.maxAge || 34560000}; SameSite=Lax;${options?.secure ? ' Secure;' : ''}`;
            document.cookie = cookie;
          });
        },
      },
    }
  );
}
