import { supabase } from '@/lib/supabase';

export type UserRole = 'Member' | 'Premium Member' | 'Professional Accountant' | 'Support' | 'Administrator';

export interface RolePermission {
  role: UserRole;
  permission: string;
}

export const getUserPermissions = async (userId: string): Promise<string[]> => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (!profile) return [];

  const { data: permissions } = await supabase
    .from('role_permissions')
    .select('permission')
    .eq('role', profile.role);

  return permissions?.map(p => p.permission) || [];
};

export const hasPermission = async (userId: string, permission: string): Promise<boolean> => {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(permission);
};

export const updateUserRole = async (userId: string, newRole: UserRole): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) throw error;

  // Log the role change
  await supabase
    .from('audit_trails')
    .insert({
      user_id: userId,
      entity_type: 'profile',
      entity_id: userId,
      action: 'update',
      changes: { role: newRole },
    });
};

export const assignClientToCPA = async (cpaId: string, clientId: string): Promise<void> => {
  const { error } = await supabase
    .from('client_assignments')
    .insert({
      cpa_id: cpaId,
      client_id: clientId,
      status: 'active',
      assigned_by: cpaId, // In real app, this would be the admin who made the assignment
    });

  if (error) throw error;
};

export const getStorageLimitForRole = (role: UserRole): number => {
  switch (role) {
    case 'Member':
      return 50; // 50MB
    case 'Premium Member':
      return 500; // 500MB
    case 'Professional Accountant':
      return 2000; // 2GB
    case 'Administrator':
      return 10000; // 10GB
    default:
      return 50;
  }
};