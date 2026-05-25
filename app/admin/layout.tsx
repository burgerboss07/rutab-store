import { cookies } from 'next/headers';
import AdminShellWrapper from './AdminShellWrapper';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get('rutab-admin-auth')?.value === 'true';
  return <AdminShellWrapper initialAuthenticated={isAuthenticated}>{children}</AdminShellWrapper>;
}
