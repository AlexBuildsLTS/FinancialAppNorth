import { supabase } from '@/lib/supabase';
import { Profile, UserRole } from '@/types'; // Assuming UserProfile type exists

export const getAllUsers = async (): Promise<Profile[]> => {
  // This requires admin privileges on the RLS policies for the 'profiles' table.
  const { data, error } = await supabase.from('profiles').select('*');

  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
  return data as Profile[];
};

export const updateUserStatus = async (userId: string, status: 'Active' | 'Inactive'): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ status: status })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
  return data as Profile;
};

export const deleteUser = async (userId: string): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
  return data as Profile;
};

export const updateUserRole = async (userId: string, role: UserRole): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: role })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
  return data as Profile;
};

export const updateUserProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
  return data as Profile;
};

export const getSystemStats = async () => {
  // Placeholder for system stats. In a real application, this would fetch data from the database.
  // For example, it might query the 'profiles' table for total users, 'transactions' for revenue, etc.
  return {
    totalUsers: 1234,
    totalRevenue: 56789.01,
    newSignups: 42,
    activeSubscriptions: 789,
  };
};
