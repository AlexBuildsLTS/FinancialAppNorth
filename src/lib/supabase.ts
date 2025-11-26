import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { secureStorage } from './secureStorage'; // Ensure this file exists and exports 'secureStorage'
import { Platform } from 'react-native';

// --- Configuration ---
// The client looks for these automatically, but we define them to be safe
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase keys missing - check .env');
}

// --- Client Initialization ---
export const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '', {
  auth: {
    storage: secureStorage, // Uses your secure storage adapter
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// --- Admin Helper Functions (Optimized) ---

export async function adminChangeUserRole(userId: string, newRole: string) {
  const { data, error } = await supabase.functions.invoke('admin-change-role', {
    body: { userId, newRole },
  });

  if (error) throw new Error(`Failed to change role: ${error.message}`);
  return data;
}

export async function adminDeactivateUser(userId: string) {
  const { data, error } = await supabase.functions.invoke('admin-deactivate', {
    body: { userId, deactivate: true },
  });

  if (error) throw new Error(`Failed to deactivate user: ${error.message}`);
  return data;
}

export async function adminDeleteUser(userId: string) {
  const { data, error } = await supabase.functions.invoke('admin-delete', {
    body: { userId },
  });

  if (error) throw new Error(`Failed to delete user: ${error.message}`);
  return data;
}