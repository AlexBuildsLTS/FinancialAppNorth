import { supabase } from '@/shared/lib/supabase';

/**
 * Store base64-encoded public JWK on the user's profile.public_jwk.
 * Requires the user to be signed in and RLS to allow updates to own profile.
 */
export async function registerPublicJwk(publicJwkBase64: string) {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('profiles')
    .update({ public_jwk: publicJwkBase64 })
    .eq('id', user.id);

  if (error) throw error;
  return true;
}

export async function getPublicJwkForUser(userId: string) {
  const { data, error } = await supabase.from('profiles').select('public_jwk').eq('id', userId).single();
  if (error) throw error;
  return data?.public_jwk ?? null;
}
