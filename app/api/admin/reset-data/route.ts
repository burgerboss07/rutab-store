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

    const client = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const errors: string[] = [];

    // Orders + Revenue
    if (action === 'revenue_orders' || action === 'orders' || action === 'all') {
      const { error: itemsErr } = await client.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (itemsErr) errors.push(`order_items: ${itemsErr.message}`);

      const { error: ordersErr } = await client.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (ordersErr) errors.push(`orders: ${ordersErr.message}`);
    }

    // Customers — delete from both profiles AND auth.users
    if (action === 'customers' || action === 'all') {
      // Fetch all profiles (excluding the admin super-admin)
      const { data: profiles } = await client
        .from('profiles')
        .select('id, email')
        .neq('email', 'abd@rutab.store');

      if (profiles && profiles.length > 0) {
        for (const profile of profiles) {
          const { error: authErr } = await adminClient.auth.admin.deleteUser(profile.id);
          if (authErr) errors.push(`auth delete ${profile.id}: ${authErr.message}`);
        }
      }

      // Also delete any remaining profiles (cleanup)
      const { error: profErr } = await client.from('profiles').delete().neq('email', 'abd@rutab.store');
      if (profErr) errors.push(`profiles: ${profErr.message}`);
    }

    // Products
    if (action === 'products' || action === 'all') {
      const { error: piErr } = await client.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (piErr) errors.push(`order_items (products): ${piErr.message}`);

      const { error: prodErr } = await client.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (prodErr) errors.push(`products: ${prodErr.message}`);
    }

    // Full store reset — clean everything
    if (action === 'all') {
      const tables = ['coupons', 'banners', 'categories', 'order_items', 'orders', 'products', 'profiles'];
      for (const table of tables) {
        const { error } = await client.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) errors.push(`${table}: ${error.message}`);
      }

      // Reset settings to defaults
      const { error: settingsErr } = await client.from('settings').delete().neq('key', '');
      if (settingsErr) errors.push(`settings: ${settingsErr.message}`);

      // Re-create admin profile
      const { error: adminErr } = await client.from('profiles').upsert(
        { email: 'abd@rutab.store', role: 'super_admin', name: 'Abd' },
        { onConflict: 'email' }
      );
      if (adminErr) errors.push(`admin profile: ${adminErr.message}`);
    }

    if (errors.length > 0) {
      return NextResponse.json({ success: false, error: errors.join('; ') });
    }

    return NextResponse.json({ success: true, resetAction: action });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
