import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Missing Supabase environment variables' }, { status: 500 });
    }

    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Fetch all auth users
    const { data: authUsers, error: listError } = await adminClient.auth.admin.listUsers();

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    // Fetch existing profiles
    const { data: existingProfiles } = await adminClient
      .from('profiles')
      .select('id');

    const existingIds = new Set((existingProfiles || []).map((p: any) => p.id));
    let created = 0;
    let skipped = 0;
    let errors = 0;

    // Create profiles for auth users that don't have one
    for (const user of authUsers.users) {
      if (!existingIds.has(user.id)) {
        const { error: insertError } = await adminClient
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || '',
            phone: user.phone || '',
          });

        if (insertError) {
          console.error('Failed to create profile for', user.id, insertError);
          errors++;
        } else {
          created++;
        }
      } else {
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      total_users: authUsers.users.length,
      profiles_created: created,
      profiles_skipped: skipped,
      errors,
    });
  } catch (err: any) {
    console.error('Sync users error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
