import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase-admin';

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

    const adminClient = getAdminClient();
    const { error } = await adminClient.from('profiles').delete().in('id', ids);
    if (error) throw error;

    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (err: any) {
    console.error('Error deleting users:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
