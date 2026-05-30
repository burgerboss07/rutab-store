import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          },
        },
      }
    );

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Use service role to ensure admin profile exists with correct role
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await serviceClient.from('profiles').upsert({
      id: authData.user.id,
      email: authData.user.email!,
      role: 'super_admin',
      full_name: authData.user.user_metadata?.full_name || email.split('@')[0],
    }, { onConflict: 'id' });

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    const role = profile?.role || 'customer';
    if (role !== 'super_admin' && role !== 'manager') {
      await supabase.auth.signOut();
      return NextResponse.json({ error: 'Unauthorized — admin access required' }, { status: 403 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('rutab-admin-auth', 'true', {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('rutab-admin-auth', '', {
    path: '/',
    maxAge: 0,
  });
  return response;
}
