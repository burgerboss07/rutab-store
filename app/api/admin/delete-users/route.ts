import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase-admin';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(request: NextRequest) {
  try {
    const authCookie = request.cookies.get('rutab-admin-auth');
    if (!authCookie || authCookie.value !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'ids array required' }, { status: 400 });
    }

    // Only pass valid UUIDs to Supabase
    const validIds = ids.filter((id: string) => UUID_RE.test(id));

    if (validIds.length === 0) {
      return NextResponse.json({ success: true, deleted: 0, note: 'No valid UUIDs provided' });
    }

    const adminClient = getAdminClient();
    let profileErrors = 0;
    let authErrors = 0;
    let deleted = 0;

    for (const id of validIds) {
      // Delete from profiles table
      const { error: profileError } = await adminClient.from('profiles').delete().eq('id', id);
      if (profileError) {
        console.error('Profile delete error for', id, profileError);
        profileErrors++;
      }

      // Delete from auth.users (removes the user entirely)
      const { error: authError } = await adminClient.auth.admin.deleteUser(id);
      if (authError) {
        console.error('Auth delete error for', id, authError);
        authErrors++;
      }

      deleted++;
    }

    return NextResponse.json({
      success: true,
      deleted,
      profileErrors,
      authErrors,
    });
  } catch (err: any) {
    console.error('Error deleting users:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
