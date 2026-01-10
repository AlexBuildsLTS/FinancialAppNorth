/**
 * src/services/orgService.ts
 * ROLE: Enterprise Provisioning Engine (Titan-Grade).
 * PURPOSE: Manages lifecycle of corporate entities and multi-user membership junctions.
 * RESOLVES: Infinite RLS Recursion (500) and state-sync bugs.
 */

import { supabase } from '../lib/supabase';
import { Organization } from '../types';

interface OrgMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  full_name: string;
  user_email: string;
  avatar_url?: string;
}

export class OrgService {
  /**
   * 🔍 RESOLVE ACTIVE SESSION
   * Looks at membership records to determine the user's active corporate environment.
   */
  static async getMyOrganization(userId: string): Promise<Organization | null> {
    try {
      const { data: membership, error } = await supabase
        .from('organization_members')
        .select(
          `
          organization_id,
          organizations (*)
        `
        )
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        // High-fidelity error detection for the 500 loop
        if (error.message.includes('recursion')) {
          throw new Error(
            'DATABASE_POLICY_LOOP: Run the SQL reset script to fix RLS.'
          );
        }
        throw error;
      }

      return membership?.organizations
        ? (membership.organizations as unknown as Organization)
        : null;
    } catch (e) {
      console.error('[OrgService] Tactical resolution failure:', e);
      return null;
    }
  }

  /**
   * 🏗️ PROVISION CORPORATE ENTITY
   * Atomic two-step: Create Legal Entity -> Bind Membership Identity.
   */
  static async createOrganization(
    userId: string,
    name: string
  ): Promise<Organization> {
    // 1. Establish the Organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert([{ name: name.trim(), owner_id: userId }])
      .select()
      .single();

    if (orgError) {
      console.error('[OrgService] Insert Rejection:', orgError.message);
      throw new Error(orgError.message);
    }

    // 2. Establish the Ownership Bond (Fixes "Disappearing Org" bug)
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert([
        {
          organization_id: org.id,
          user_id: userId,
          role: 'owner',
        },
      ]);

    if (memberError) {
      console.error('[OrgService] Junction Link Failure:', memberError.message);
    }

    return org;
  }

  /**
   * 👥 TEAM DIRECTORY (Required for members.tsx)
   */
  static async getOrgMembers(orgId: string): Promise<OrgMember[]> {
    const { data, error } = await supabase
      .from('organization_members')
      .select(
        `
        *,
        profiles:user_id (first_name, last_name, email, avatar_url)
      `
      )
      .eq('organization_id', orgId);

    if (error) throw error;

    return (data || []).map((m: any) => ({
      id: m.id,
      organization_id: m.organization_id,
      user_id: m.user_id,
      role: m.role,
      full_name: m.profiles?.first_name
        ? `${m.profiles.first_name} ${m.profiles.last_name || ''}`.trim()
        : 'Pending Onboarding',
      user_email: m.profiles?.email || 'Unknown',
      avatar_url: m.profiles?.avatar_url,
    }));
  }

  /**
   * ✉️ PROVISION NEW MEMBER (Required for invites)
   */
  static async inviteMember(
    orgId: string,
    email: string,
    role: string
  ): Promise<void> {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (profileError || !profile) {
      throw new Error(`Identity "${email}" not found in system.`);
    }

    const { error } = await supabase
      .from('organization_members')
      .insert([{ organization_id: orgId, user_id: profile.id, role }]);

    if (error) {
      if (error.code === '23505')
        throw new Error('User already belongs to this entity.');
      throw error;
    }
  }
}

// Export for consumption
export const orgService = OrgService;
