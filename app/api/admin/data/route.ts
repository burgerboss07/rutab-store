import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) throw new Error('Service role key not configured');
  return createClient(supabaseUrl, serviceRoleKey);
}

const ALLOWED_TABLES = ['products', 'orders', 'order_items', 'categories', 'settings', 'banners'];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { table, action, data, id } = body;

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: `Table '${table}' not allowed` }, { status: 400 });
    }

    const adminClient = getAdminClient();

    if (action === 'insert') {
      const { data: result, error } = await adminClient
        .from(table)
        .insert(data)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'update') {
      if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
      const { data: result, error } = await adminClient
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'delete') {
      if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
      const { error } = await adminClient
        .from(table)
        .delete()
        .eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true });
    }

    if (action === 'upsert') {
      const { data: result, error } = await adminClient
        .from(table)
        .upsert(data, { onConflict: body.onConflict || 'id' })
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
