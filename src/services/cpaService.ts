import { supabase } from '../lib/supabase';
import { CpaClient, TablesInsert } from '../types';

export class CpaService {
  /**
   * Request a CPA connection
   */
  static async requestCPA(userId: string, cpaEmail: string) {
    // Find CPA by email
    const { data: cpa, error: cpaError } = await supabase
      .from('profiles')
      .select('id')
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