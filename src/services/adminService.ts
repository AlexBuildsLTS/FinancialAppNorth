import { supabase } from '@/lib/supabase';
import { User, UserRole } from '@/context/AuthContext';

// Fetches all users from Supabase
export const fetchAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(profile => ({
    id: profile.id,
    email: profile.email,
    role: profile.role,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
    storageLimit: profile.storage_limit_mb,
  }));
};

// Updates a user's role in Supabase
export const updateUserRole = async (userId: string, newRole: UserRole): Promise<User> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  // Log the role change for auditing
  await supabase
    .from('audit_trails')
    .insert({
      user_id: userId,
      entity_type: 'profile',
      entity_id: userId,
      action: 'update',
      changes: { role: newRole },
    });

  return {
    id: data.id,
    email: data.email,
    role: data.role,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    storageLimit: data.storage_limit_mb,
  };
};

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'info' | 'warning' | 'error' | 'success' = 'info'
): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title,
      message,
      type,
    });

  if (error) throw error;
};

export const sendGlobalMessage = async (
  title: string,
  message: string,
  targetRole?: UserRole
): Promise<void> => {
  let query = supabase.from('profiles').select('id');
  
  if (targetRole) {
    query = query.eq('role', targetRole);
  }

  const { data: users, error: fetchError } = await query;
  if (fetchError) throw fetchError;

  const notifications = users?.map(user => ({
    user_id: user.id,
    title,
    message,
    type: 'info' as const,
  })) || [];

  const { error } = await supabase
    .from('notifications')
    .insert(notifications);

  if (error) throw error;
};