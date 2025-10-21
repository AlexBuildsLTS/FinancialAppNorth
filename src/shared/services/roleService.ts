import { supabase } from '@/shared/lib/supabase';
import { Profile } from '@/shared/types';

/**
 * Fetches the profile of a user to check their role.
 * @param userId The ID of the user.
 */
export const getUserRole = async (userId: string): Promise<Profile['role']> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user role:', error);
    throw error;
  }
  
  return data.role;
};