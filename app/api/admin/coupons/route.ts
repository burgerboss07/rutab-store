import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) throw new Error('Service role key not configured');
  return createClient(supabaseUrl, serviceRoleKey);
}

export async function GET() {
  try {
    const adminClient = getAdminClient();
    const { data, error } = await adminClient
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ coupons: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, coupon } = body;

    const adminClient = getAdminClient();

    if (action === 'create') {
      const { data, error } = await adminClient
        .from('coupons')
        .insert({ ...coupon, used_count: 0 })
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, coupon: data });
    }

    if (action === 'update') {
      const { data, error } = await adminClient
        .from('coupons')
        .update(coupon)
        .eq('id', coupon.id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, coupon: data });
    }

    if (action === 'delete') {
      const { error } = await adminClient
        .from('coupons')
        .delete()
        .eq('id', coupon.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true });
    }

    if (action === 'toggle') {
      const { error } = await adminClient
        .from('coupons')
        .update({ is_active: coupon.is_active })
        .eq('id', coupon.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
