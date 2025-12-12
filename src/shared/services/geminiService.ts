import { supabase } from '../../lib/supabase';
import { User, TablesUpdate, FinancialSummary, UserRole } from '../../types';
import { encryptMessage, decryptMessage } from '../../lib/crypto';
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
   
  static async getProfileByEmail(email: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  }
  
  /**
   * Update user profile
   */
  static async updateProfile(userId: string, firstName: string, lastName: string, updates: TablesUpdate<'profiles'>) {
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
    // You may want to fetch the current first and last name, or pass empty strings if not available
    return this.updateProfile(userId, '', '', { currency });
  }

  /**
   * Update user name
   */
  static async updateName(userId: string, firstName: string, lastName: string) {
    return this.updateProfile(userId, firstName, lastName, { first_name: firstName, last_name: lastName });
  }

  /**
   * Get financial summary for dashboard
   * FIX: Added 'date' to trend objects to match FinancialSummary type definition
   */
  static async getFinancialSummary(userId: string): Promise<FinancialSummary> {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount, type, date')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching financial summary:', error);
      // Return proper fallback structure matching interface
      return { 
        balance: 0, 
        income: 0, 
        expense: 0, 
        trend: [{ date: new Date().toISOString(), value: 0 }] 
      };
    }

    let income = 0;
    let expense = 0;
    let runningBalance = 0;

    // FIX: Include 'date' in the map function
    const trend = transactions.map((t: any) => {
      runningBalance += parseFloat(t.amount);
      return { 
        value: runningBalance,
        date: t.date // Required by FinancialSummary interface
      };
    });

    transactions.forEach((tx: any) => {
      const amt = parseFloat(tx.amount);
      if (amt > 0) income += amt;
      else expense += Math.abs(amt);
    });

    const totalBalance = runningBalance;

    return {
      balance: totalBalance,
      income,
      expense,
      // Provide valid fallback if no transactions exist
      trend: trend.length > 0 ? trend : [{ date: new Date().toISOString(), value: 0 }]
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
      role: (p.role as UserRole) || UserRole.MEMBER,
      status: 'active', 
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
      // Cast string to specific role enum if necessary, or let DB handle validation
      .update({ role: newRole as any, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;
  }

  /**
   * Deactivate user (admin only)
   */
  static async deactivateUser(userId: string) {
    console.warn('deactivateUser: Logical delete not implemented yet');
  }

  /**
   * Delete user (admin only)
   */
  static async deleteUser(userId: string) {
    console.warn('deleteUser: Hard delete not implemented yet');
  }

  /**
   * Save API key for user
   */
  static async saveApiKey(userId: string, service: string, apiKey: string) {
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
    const { data, error } = await supabase
      .from('user_secrets')
      .select('api_key_encrypted')
      .eq('user_id', userId)
      .eq('service', service)
      .maybeSingle();

    if (error) throw error;
    return data && data.api_key_encrypted ? data.api_key_encrypted : null;
  }
}
/**
 * Get user profile by email
 */
async function getProfileByEmail(email: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error) throw error;
  return data;
}

