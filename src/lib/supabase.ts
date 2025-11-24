// src/lib/supabase.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { secureStorage } from './secureStorage';


// Resolve runtime config (Expo extra, process.env)
const EX: any = (global as any)?.__expoConfig?.extra ?? {};
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || EX.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  EX.SUPABASE_ANON_KEY ||
  EX.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  '';
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ROLE_KEY ||
  EX.SUPABASE_SERVICE_ROLE_KEY ||
  EX.SUPABASE_ROLE_KEY ||
  '';
const SUPABASE_FUNCTIONS_URL =
  process.env.EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL ||
  process.env.SUPABASE_FUNCTIONS_URL ||
  EX.SUPABASE_FUNCTIONS_URL ||
  `https://qnrxncngoqphnerdrnnc.supabase.co/functions/v1`;

// Helpful debug warnings (non-fatal)
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Do not throw — we allow runtime usage to surface errors when attempting actual calls
  console.warn(
    '[supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY. Set env vars for full functionality.'
  );
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[supabase] Missing SUPABASE_SERVICE_ROLE_KEY — admin actions disabled locally.');
}

// Create supabase clients (only create if keys present)
function makeMissingClient(name: string, message?: string) {
  const err = message ?? `${name} not configured: missing SUPABASE_URL or key`;
  const handler: ProxyHandler<any> = {
    get() {
      return () => {
        throw new Error(err);
      };
    },
    apply() {
      throw new Error(err);
    },
  };
  return new Proxy({}, handler);
}

export const supabase: any =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          storage: secureStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : makeMissingClient(
        'supabase',
        'Supabase anon client not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY to enable DB features.'
      );

export const supabaseAdmin: any =
  SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : makeMissingClient(
        'supabaseAdmin',
        'Supabase admin client not configured. Set SUPABASE_SERVICE_ROLE_KEY for admin operations.'
      );

// Local any aliases used to reduce generic typing friction across the app
const _sb: any = supabase;
const _sbAdmin: any = supabaseAdmin;

/* -------------------------
   Helpers & API surface
   ------------------------- */

export type Role = 'member' | 'premium' | 'cpa' | 'support' | 'admin';

async function getCurrentAccessToken(): Promise<string> {
  const { data, error } = await _sb.auth.getSession();
  if (error) throw error;
  const session = (data as any)?.session ?? (data as any);
  if (!session?.access_token) throw new Error('Not authenticated');
  return session.access_token as string;
}

export async function adminChangeUserRole(userId: string, newRole: string) {
  if (!SUPABASE_FUNCTIONS_URL) throw new Error('SUPABASE_FUNCTIONS_URL not configured');
  const token = await getCurrentAccessToken();
  const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/admin-change-role`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId, newRole }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to change role: ${response.status} ${text}`);
  }
}

export async function adminDeactivateUser(userId: string) {
  if (!SUPABASE_FUNCTIONS_URL) throw new Error('SUPABASE_FUNCTIONS_URL not configured');
  const token = await getCurrentAccessToken();
  const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/admin-deactivate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId, deactivate: true }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to deactivate user: ${response.status} ${text}`);
  }
}

export async function adminDeleteUser(userId: string) {
  if (!SUPABASE_FUNCTIONS_URL) throw new Error('SUPABASE_FUNCTIONS_URL not configured');
  const token = await getCurrentAccessToken();
  const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/admin-delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to delete user: ${response.status} ${text}`);
  }
}

// Small convenience for retrieving public storage URLs; adapt bucket name if necessary
export function getPublicAvatarUrl(path: string) {
  try {
    const { data } = _sb.storage.from('avatars').getPublicUrl(path);
    return data?.publicUrl ?? null;
  } catch (err) {
    console.warn('[supabase] getPublicAvatarUrl failed', err);
    return null;
  }
}

export default {
  supabase,
  supabaseAdmin,
  adminChangeUserRole,
  adminDeactivateUser,
  adminDeleteUser,
  getPublicAvatarUrl,
};