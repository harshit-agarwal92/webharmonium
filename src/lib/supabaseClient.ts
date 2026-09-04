import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function getSupabaseCredentials() {
  let url = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : '') || '';
  const key = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : '') || '';

  url = url.trim();
  const trimmedKey = key.trim();

  // If user entered only project ref or URL without protocol
  if (url && !url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('sb_publishable_')) {
    url = `https://${url}.supabase.co`;
  }

  const isValid = Boolean(
    url &&
    trimmedKey &&
    (url.startsWith('http://') || url.startsWith('https://')) &&
    !url.includes('your-supabase-project') &&
    !trimmedKey.includes('your-supabase-anon-key')
  );

  return { url, key: trimmedKey, isValid };
}

const creds = getSupabaseCredentials();

export const isRealSupabase = creds.isValid;

if (!creds.isValid && typeof window !== 'undefined') {
  console.warn(
    '[Supabase Client Warning] Missing or invalid Supabase credentials at runtime.\n' +
    'Please verify that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are properly configured in your Vercel Project Settings > Environment Variables (assigned to Production, Preview, and Development).'
  );
}

// Singleton Supabase instance
let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;
  const currentCreds = getSupabaseCredentials();
  if (currentCreds.isValid) {
    cachedClient = createClient(currentCreds.url, currentCreds.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
    return cachedClient;
  }
  return null;
}

export const supabase: SupabaseClient | null = getSupabaseClient();
