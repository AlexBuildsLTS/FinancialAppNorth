import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { secureStorage } from './secureStorage';

// --- Configuration ---
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
// Default to local edge function URL if not set in env
const SUPABASE_FUNCTIONS_URL = process.env.EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL || 'https://qnrxncngoqphnerdrnnc.supabase.co/functions/v1'; 

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase keys missing - check .env');
}

// --- Client Initialization (Safe for Web/Mobile) ---
export const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '', {
  auth: {
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// --- Admin Helper Functions (Restored) ---

// Helper: Get the current user's token to authenticate the Edge Function request
async function getCurrentAccessToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session?.access_token) throw new Error('Not authenticated');
  return data.session.access_token;
}

export async function adminChangeUserRole(userId: string, newRole: string) {
  const token = await getCurrentAccessToken();
  const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/admin-change-role`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ userId, newRole }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to change role: ${text}`);
  }
}

export async function adminDeactivateUser(userId: string) {
  const token = await getCurrentAccessToken();
  const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/admin-deactivate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ userId, deactivate: true }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to deactivate user: ${text}`);
  }
}

export async function adminDeleteUser(userId: string) {
  const token = await getCurrentAccessToken();
  const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/admin-delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to delete user: ${text}`);
  }
}