import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
}

/**
 * Returns the currently authenticated user (nullable).
 */
export async function getCurrentAuthUser() {
  const {
	data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

/**
 * Fetches the profile row from the "profiles" table for the given user id (or the current user if omitted).
 */
export async function getProfile(userId?: string): Promise<UserProfile | null> {
  const authUser = await getCurrentAuthUser();
  const id = userId ?? authUser?.id;
  if (!id) return null;

  const { data, error } = await supabase
	.from('profiles')
	.select('id, email, full_name, avatar_url, created_at')
	.eq('id', id)
	.single();

  if (error) {
	// When no row exists, return null instead of throwing to allow callers to create a profile.
	// Other errors propagate.
	if (error.message?.toLowerCase().includes('null')) return null;
	throw error;
  }

  return (data as UserProfile) ?? null;
}

/**
 * Creates or updates (upserts) a profile row for the current user.
 * Provide at least one field besides id to update.
 */
export async function updateProfile(updates: Partial<UserProfile> & { id?: string }): Promise<UserProfile> {
  const authUser = await getCurrentAuthUser();
  const id = updates.id ?? authUser?.id;
  if (!id) throw new Error('User not authenticated');

  const payload = { ...updates, id };

  const { data, error } = await supabase
	.from('profiles')
	.upsert(payload, { returning: 'representation' })
	.select()
	.single();

  if (error) throw error;
  return data as UserProfile;
}

/**
 * Signs the current user out.
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
 