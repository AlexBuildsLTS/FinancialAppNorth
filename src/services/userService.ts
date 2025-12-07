import { supabase } from '../lib/supabase';
import { User, TablesUpdate, FinancialSummary } from '../types';

export class UserService {
  /**
   * Get user profile
   */
  static async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: TablesUpdate<'profiles'>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update user currency
   */
  static async updateCurrency(userId: string, currency: string) {
    return this.updateProfile(userId, { currency });
  }

  /**
   * Update user name
   */
  static async updateName(userId: string, firstName: string, lastName: string) {
    return this.updateProfile(userId, { first_name: firstName, last_name: lastName });
  }

  /**
   * Get financial summary for dashboard
   */
  static async getFinancialSummary(userId: string): Promise<FinancialSummary> {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount, type, date')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching financial summary:', error);
      return { balance: 0, income: 0, expense: 0, trend: [{ value: 0 }] };
    }

    let income = 0;
    let expense = 0;
    let runningBalance = 0;

    const trend = transactions.map((t: any) => {
      runningBalance += parseFloat(t.amount);
      return { value: runningBalance };
    });

    transactions.forEach((tx: any) => {
      const amt = parseFloat(tx.amount);
      if (amt > 0) income += amt;
      else expense += Math.abs(amt);
    });

    // Total balance is the final running balance, not income - expense
    const totalBalance = runningBalance;

    return {
      balance: totalBalance,
      income,
      expense,
      trend: trend.length > 0 ? trend : [{ value: 0 }, { value: 0 }]
    };
  }

  /**
   * Get all users (admin only)
   */
  static async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((p: any) => ({
      id: p.id,
      email: p.email || 'No Email',
      name: p.first_name ? `${p.first_name} ${p.last_name}` : 'Unknown',
      role: p.role,
      status: 'active', // TODO: Add status field to profiles table
      avatar: p.avatar_url,
      currency: p.currency,
      country: p.country
    }));
  }

  /**
   * Update user role (admin only)
   */
  static async updateUserRole(userId: string, newRole: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;
  }

  /**
   * Deactivate user (admin only)
   */
  static async deactivateUser(userId: string) {
    // TODO: Implement deactivation logic
    // This might involve updating a status field or auth.users
    console.warn('deactivateUser not fully implemented');
  }

  /**
   * Delete user (admin only)
   */
  static async deleteUser(userId: string) {
    // TODO: Implement deletion logic with proper cleanup
    console.warn('deleteUser not fully implemented');
  }

  /**
   * Save API key for user
   */
  static async saveApiKey(userId: string, service: string, apiKey: string) {
    // Check if exists first to avoid constraint errors
    const { data: existing } = await supabase
      .from('user_secrets')
      .select('id')
      .eq('user_id', userId)
      .eq('service', service)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('user_secrets')
        .update({ api_key_encrypted: apiKey })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('user_secrets')
        .insert({ user_id: userId, service, api_key_encrypted: apiKey });
      if (error) throw error;
    }
  }

  /**
   * Get API key for user
   */
  static async getApiKey(userId: string, service: string): Promise<string | null> {
    const { data } = await supabase
      .from('user_secrets')
      .select('api_key_encrypted')
      .eq('user_id', userId)
      .eq('service', service)
      .maybeSingle();

    return data?.api_key_encrypted || null;
  }
}