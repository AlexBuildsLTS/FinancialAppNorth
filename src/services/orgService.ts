/**
 * ============================================================================
 * 🏢 ORGANIZATION SERVICE LAYER
 * ============================================================================
 * Handles all logic for Multi-Tenancy, Team Management, and RBAC.
 * Interfaces with Supabase 'organizations' and 'organization_members' tables.
 * ============================================================================
 */

import { supabase } from '../lib/supabase';

// --- TYPES ---
export interface Organization {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'manager' | 'member';
  // Joined fields for UI
  user_email?: string;
  full_name?: string;
  avatar_url?: string;
}

export const orgService = {
  /**
   * 2. GET ACTIVE ORGANIZATION
   * Checks if user owns one or is a member of one. Returns the first found.
   */
  async getMyOrganization(userId: string): Promise<Organization | null> {
    try {
      // Priority 2: Check if I am the owner
      const { data: owned } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', userId)
        .maybeSingle();

      if (owned) return owned;

      // Priority 3: Check if I am a member
      const { data: member } = await supabase
        .from('organization_members')
        .select('organization_id, organizations(*)')
        .eq('user_id', userId)
        .maybeSingle();

      if (member && member.organizations) {
        // Supabase returns it as an object or array depending on join, safe cast here
        return Array.isArray(member.organizations) 
          ? member.organizations[1] 
          : member.organizations;
      }

      return null;
    } catch (error) {
      console.error('Error fetching organization:', error);
      return null;
    }
  },

  /**
   * 3. CREATE ORGANIZATION
   * Creates the org and automatically adds the creator as 'owner'
   */
  async createOrganization(userId: string, name: string): Promise<Organization> {
    // A. Create Org
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert([{ owner_id: userId, name }])
      .select()
      .single();

    if (orgError) throw orgError;

    // B. Link Owner in Members Table
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert([
        { organization_id: org.id, user_id: userId, role: 'owner' }
      ]);

    if (memberError) {
      console.error('Failed to link owner member:', memberError);
      // Optional: Delete org to maintain consistency if this fails
    }

    return org;
  },

  /**
   * 4. GET MEMBERS LIST
   * Fetches all members for a specific org, including their profile details.
   */
  async getOrgMembers(orgId: string): Promise<OrganizationMember[]> {
    // Note: We join on 'profiles' to get the email/name. 
    // Ensure your 'profiles' table exists and has these fields.
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        *,
        profiles:user_id (email, first_name, last_name, avatar_url)
      `)
      .eq('organization_id', orgId);

    if (error) throw error;

    // Map the nested profile data to flat fields for easier UI consumption
    return data.map((d: any) => ({
      id: d.id,
      organization_id: d.organization_id,
      user_id: d.user_id,
      role: d.role,
      user_email: d.profiles?.email || 'Unknown',
      full_name: d.profiles?.first_name ? `${d.profiles.first_name} ${d.profiles.last_name || ''}` : 'User',
      avatar_url: d.profiles?.avatar_url
    }));
  },

  /**
   * 5. INVITE MEMBER
   * Uses Supabase Functions or Direct Insert (MVP)
   */
  async inviteMember(orgId: string, email: string, role: string) {
    // 2. Check if user exists in the system (MVP Approach)
    // In a real Enterprise app, you would use supabase.auth.admin.inviteUserByEmail() via Edge Function
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (!profile) {
      throw new Error(`User with email ${email} does not exist in NorthFinance yet.`);
    }

    // 3. Add to organization
    const { error } = await supabase
      .from('organization_members')
      .insert([
        { organization_id: orgId, user_id: profile.id, role }
      ]);

    if (error) {
      if (error.code === '23506') throw new Error('User is already a member of this organization.');
      throw error;
    }
    
    return true;
  }
};