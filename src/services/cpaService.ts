import { supabase } from '../lib/supabase';
import { CpaClient, TablesInsert } from '../types';
import { notifyCpaRequest, notifyClientInvitation } from './dataService';

export class CpaService {
  /**
   * Request a CPA connection
   */
  static async requestCPA(userId: string, cpaEmail: string) {
    // Find CPA by email
    const { data: cpa, error: cpaError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .eq('email', cpaEmail)
      .eq('role', 'cpa')
      .single();

    if (cpaError || !cpa) {
      throw new Error('CPA not found with that email address');
    }

    // Check if request already exists
    const { data: existing } = await supabase
      .from('cpa_clients')
      .select('id')
      .or(`and(client_id.eq.${userId},cpa_id.eq.${cpa.id}),and(client_id.eq.${cpa.id},cpa_id.eq.${userId})`)
      .maybeSingle();

    if (existing) {
      throw new Error('Connection request already exists');
    }

    const insertData: TablesInsert<'cpa_clients'> = {
      cpa_id: cpa.id,
      client_id: userId,
      status: 'pending',
      permissions: {
        view_transactions: true,
        view_reports: true
      }
    };

    const { data, error } = await supabase
      .from('cpa_clients')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    // Notify CPA
    const { data: client } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', userId)
      .single();

    const clientName = client ? `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'A client' : 'A client';
    await notifyCpaRequest(cpa.id, clientName);

    return data;
  }

  /**
    * Invite a client (CPA initiates)
    */
  static async inviteClient(cpaId: string, clientEmail: string) {
    // Find client by email
    const { data: client, error: clientError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', clientEmail)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found with that email address');
    }

    // Check if relationship already exists
    const { data: existing } = await supabase
      .from('cpa_clients')
      .select('id')
      .or(`and(client_id.eq.${client.id},cpa_id.eq.${cpaId}),and(client_id.eq.${cpaId},cpa_id.eq.${client.id})`)
      .maybeSingle();

    if (existing) {
      throw new Error('Relationship already exists with this client');
    }

    const insertData: TablesInsert<'cpa_clients'> = {
      cpa_id: cpaId,
      client_id: client.id,
      status: 'pending', // Pending acceptance by client
      permissions: {
        view_transactions: true,
        view_reports: true
      }
    };

    const { data, error } = await supabase
      .from('cpa_clients')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    // Notify client
    const { data: cpa } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', cpaId)
      .single();

    const cpaName = cpa ? `${cpa.first_name || ''} ${cpa.last_name || ''}`.trim() || 'A CPA' : 'A CPA';
    await notifyClientInvitation(client.id, cpaName);

    return data;
  }

  /**
   * Accept a client request (CPA only)
   */
  static async acceptClient(cpaId: string, clientId: string) {
    const { data, error } = await supabase
      .from('cpa_clients')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('cpa_id', cpaId)
      .eq('client_id', clientId)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Reject or remove client connection
   */
  static async removeClient(cpaId: string, clientId: string) {
    const { error } = await supabase
      .from('cpa_clients')
      .delete()
      .eq('cpa_id', cpaId)
      .eq('client_id', clientId);

    if (error) throw error;
  }

  /**
    * Get CPA's clients
    */
  static async getCpaClients(cpaId: string): Promise<CpaClient[]> {
    const { data, error } = await supabase
      .from('cpa_clients')
      .select('*, client:profiles(*)')
      .eq('cpa_id', cpaId);

    if (error) throw error;

    return data.map((item: any) => ({
      id: item.client.id,
      name: item.client.first_name ? `${item.client.first_name} ${item.client.last_name}` : 'Unknown',
      email: item.client.email,
      status: item.status,
      last_audit: item.updated_at || item.created_at,
    })) || [];
  }

  /**
    * Get client's CPAs
    */
  static async getClientCpas(clientId: string): Promise<CpaClient[]> {
    const { data, error } = await supabase
      .from('cpa_clients')
      .select('*, cpa:profiles(*)')
      .eq('client_id', clientId);

    if (error) throw error;

    return data.map((item: any) => ({
      id: item.cpa.id,
      name: item.cpa.first_name ? `${item.cpa.first_name} ${item.cpa.last_name}` : 'Unknown',
      email: item.cpa.email,
      status: item.status,
      last_audit: item.updated_at || item.created_at,
    })) || [];
  }

  /**
    * Accept invitation from CPA
    */
  static async acceptInvitation(clientId: string, cpaId: string) {
    const { data, error } = await supabase
      .from('cpa_clients')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('cpa_id', cpaId)
      .eq('client_id', clientId)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
    * Decline invitation from CPA
    */
  static async declineInvitation(clientId: string, cpaId: string) {
    const { error } = await supabase
      .from('cpa_clients')
      .delete()
      .eq('cpa_id', cpaId)
      .eq('client_id', clientId)
      .eq('status', 'pending');

    if (error) throw error;
  }

  /**
   * Update client permissions
   */
  static async updateClientPermissions(cpaId: string, clientId: string, permissions: any) {
    const { data, error } = await supabase
      .from('cpa_clients')
      .update({
        permissions,
        updated_at: new Date().toISOString()
      })
      .eq('cpa_id', cpaId)
      .eq('client_id', clientId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }


  /**
    * Check if user is CPA for client
    */
  static async isCpaForClient(cpaId: string, clientId: string): Promise<boolean> {
    const { data } = await supabase
      .from('cpa_clients')
      .select('id')
      .eq('cpa_id', cpaId)
      .eq('client_id', clientId)
      .eq('status', 'active')
      .maybeSingle();

    return !!data;
  }

  /**
   * Get shared documents for CPA-client relationship
   */
  static async getSharedDocuments(cpaId: string, clientId: string) {
    // Verify relationship exists
    const isAuthorized = await this.isCpaForClient(cpaId, clientId);
    if (!isAuthorized) {
      throw new Error('Unauthorized access to client documents');
    }

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get shared transactions for CPA-client relationship
   */
  static async getSharedTransactions(cpaId: string, clientId: string, options: any = {}) {
    // Verify relationship exists
    const isAuthorized = await this.isCpaForClient(cpaId, clientId);
    if (!isAuthorized) {
      throw new Error('Unauthorized access to client transactions');
    }

    let query = supabase
      .from('transactions')
      .select('*, categories(name)')
      .eq('user_id', clientId);

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.dateFrom) {
      query = query.gte('date', options.dateFrom);
    }

    if (options.dateTo) {
      query = query.lte('date', options.dateTo);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;

    return data.map((t: any) => ({
      ...t,
      category: t.categories?.name || 'Uncategorized'
    }));
  }
}