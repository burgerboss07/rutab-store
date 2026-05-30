import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import AdminShellWrapper from './AdminShellWrapper';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();

  const cookieFlag = cookieStore.get('rutab-admin-auth')?.value === 'true';
  let isAuthenticated = false;

  if (cookieFlag) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return cookieStore.getAll(); },
            setAll() {},
          },
        }
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.id)
          .single();
        const adminEmails = ['abd@rutab.store'];
        isAuthenticated = profile?.email !== undefined && adminEmails.includes(profile.email);
      }
    } catch {
      isAuthenticated = false;
    }
  }

  return <AdminShellWrapper initialAuthenticated={isAuthenticated}>{children}</AdminShellWrapper>;
}
