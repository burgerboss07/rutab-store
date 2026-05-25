import { createClient as createBrowserClient } from './supabase-browser';
import { SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (typeof window === 'undefined') {
    throw new Error('getSupabase() is for client use. Use createClient() from supabase-server in server code.');
  }
  if (!_supabase) {
    _supabase = createBrowserClient() as unknown as SupabaseClient;
  }
  return _supabase;
}
