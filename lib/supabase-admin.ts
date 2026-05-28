import { createClient } from '@supabase/supabase-js';

let _adminClient: ReturnType<typeof createClient> | null = null;

export function getAdminClient() {
  if (!_adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY env var');
    }
    _adminClient = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _adminClient;
}
