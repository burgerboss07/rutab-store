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

    // Only pass valid UUIDs to Supabase — mock IDs (u1, u2, …) are skipped
    const validIds = ids.filter((id: string) => UUID_RE.test(id));

    if (validIds.length > 0) {
      const adminClient = getAdminClient();
      const { error } = await adminClient.from('profiles').delete().in('id', validIds);
      if (error) throw error;
    }

    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (err: any) {
    console.error('Error deleting users:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
