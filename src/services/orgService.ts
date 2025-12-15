import { supabase } from '@/lib/supabase';
import { Organization, OrgMember } from '@/types';

export const orgService = {
  // 1. Get the Active Organization for the User
  async getMyOrganization(userId: string) {
    // First check if they own one
    const { data: owned } = await supabase
      .from('organizations')
      .select('*')
      .eq('owner_id', userId)
      .single();

    if (owned) return owned;

    // If not, check if they are a member of one
    const { data: member } = await supabase
      .from('organization_members')
      .select('organization_id, organizations(*)')
      .eq('user_id', userId)
      .single();

    return member?.organizations || null;
  },

  // 2. Create a New Organization
  async createOrganization(userId: string, name: string) {
    const { data, error } = await supabase
      .from('organizations')
      .insert([{ owner_id: userId, name }])
      .select()
      .single();

    if (error) throw error;
    
    // Auto-add owner as 'owner' in members table
    await supabase.from('organization_members').insert([
      { organization_id: data.id, user_id: userId, role: 'owner' }
    ]);

    return data;
  },

  // 3. Get All Members
  async getMembers(orgId: string) {
    const { data, error } = await supabase
      .from('organization_members')
      .select('*, profiles(full_name, email, avatar_url)')
      .eq('organization_id', orgId);

    if (error) throw error;
    return data;
  },

  // 4. Invite Member (Mock - in real prod this triggers an email via Edge Function)
  async inviteMember(orgId: string, email: string, role: 'admin' | 'member' = 'member') {
    // For MVP, we just verify the user exists and add them directly
    const { data: user } = await supabase.from('profiles').select('id').eq('email', email).single();
    
    if (!user) throw new Error("User not found. They must register first.");

    const { error } = await supabase.from('organization_members').insert([
      { organization_id: orgId, user_id: user.id, role }
    ]);

    if (error) throw error;
  }
};