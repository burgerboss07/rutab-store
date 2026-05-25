import { NextResponse } from 'next/server';

/** Simple email notification endpoint.
 *  In production, integrate with SendGrid / Resend / Supabase Auth.
 *  Currently logs to email_logs table via Supabase.
 */
export async function POST(req: Request) {
  try {
    const { to, subject, template, data } = await req.json();
    if (!to || !subject) {
      return NextResponse.json({ error: 'Missing to or subject' }, { status: 400 });
    }

    // Log to database
    const { createClient } = await import('@supabase/supabase-js');
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await client.from('email_logs').insert({
      to_email: to,
      subject,
      template: template || 'default',
    });

    // TODO: Integrate with SendGrid/Resend SMTP here
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
