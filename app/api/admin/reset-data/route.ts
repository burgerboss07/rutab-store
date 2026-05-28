import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Supabase service key not configured. Set SUPABASE_SERVICE_ROLE_KEY in Vercel env.' }, { status: 500 });
    }

    const client = createClient(supabaseUrl, serviceRoleKey);
    const errors: string[] = [];

    if (action === 'revenue_orders' || action === 'orders' || action === 'all') {
      const { error: itemsErr } = await client.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (itemsErr) errors.push(`order_items: ${itemsErr.message}`);

      const { error: ordersErr } = await client.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (ordersErr) errors.push(`orders: ${ordersErr.message}`);
    }

    if (action === 'customers' || action === 'all') {
      const { error: profErr } = await client.from('profiles').delete().neq('email', 'abd@rutab.store');
      if (profErr) errors.push(`profiles: ${profErr.message}`);
    }

    if (action === 'products' || action === 'all') {
      const { error: piErr } = await client.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (piErr) errors.push(`order_items (products): ${piErr.message}`);

      const { error: prodErr } = await client.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (prodErr) errors.push(`products: ${prodErr.message}`);
    }

    if (action === 'analytics') {
      // No analytics-specific table yet; add when one exists
    }

    if (errors.length > 0) {
      return NextResponse.json({ success: false, error: errors.join('; ') });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
