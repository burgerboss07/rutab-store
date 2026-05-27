import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Supabase service key not configured' }, { status: 500 });
    }

    const client = createClient(supabaseUrl, serviceRoleKey);

    if (action === 'revenue_orders' || action === 'all') {
      // Delete order items first to satisfy foreign keys, then orders
      await client.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await client.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }

    if (action === 'customers' || action === 'all') {
      // Delete addresses first, then profiles (excluding admin user to avoid locking admin dashboard out)
      await client.from('addresses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await client.from('profiles').delete().neq('email', 'abd@rutab.store');
    }

    if (action === 'catalog' || action === 'all') {
      // Deleting catalog requires cleaning up referencing order items first
      await client.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await client.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
