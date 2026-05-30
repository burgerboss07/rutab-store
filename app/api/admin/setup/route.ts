import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
    }

    const client = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    let userId: string | undefined;

    // Try to create the admin user in Supabase Auth
    const { data: userData, error: createErr } = await client.auth.admin.createUser({
      email: 'abd@rutab.store',
      password: 'Urmine456',
      email_confirm: true,
      user_metadata: { full_name: 'Abd' },
    });

    if (!createErr && userData?.user) {
      userId = userData.user.id;
    } else if (createErr?.message.includes('already exists')) {
      // User exists — find them and reset password
      const { data: users } = await client.auth.admin.listUsers();
      const existing = users?.users.find(u => u.email === 'abd@rutab.store');
      if (existing) {
        userId = existing.id;
        await client.auth.admin.updateUserById(existing.id, { password: 'Urmine456' });
      }
    } else {
      return NextResponse.json({ error: createErr?.message || 'Failed to create user' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Could not resolve admin user ID' }, { status: 500 });
    }

    // Upsert admin profile
    const { error: profileErr } = await client.from('profiles').upsert({
      id: userId,
      email: 'abd@rutab.store',
      role: 'super_admin',
      full_name: 'Abd',
    }, { onConflict: 'id' });

    if (profileErr) {
      return NextResponse.json({ error: profileErr.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Admin user created. You can now log in at /admin.' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
