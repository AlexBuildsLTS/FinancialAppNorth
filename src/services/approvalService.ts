import { supabase } from '@/lib/supabase';
import { ExpenseRequest } from '@/types';

export const approvalService = {
  // 1. Submit a new request
  async createRequest(orgId: string, userId: string, data: { amount: number, merchant: string, reason: string }) {
    const { error } = await supabase.from('expense_requests').insert({
      organization_id: orgId,
      requester_id: userId,
      amount: data.amount,
      merchant: data.merchant,
      reason: data.reason,
      status: 'pending'
    });
    if (error) throw error;
  },

  // 2. Get "My Requests" (Employee View)
  async getMyRequests(userId: string) {
    const { data, error } = await supabase
      .from('expense_requests')
      .select('*')
      .eq('requester_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // 3. Get "To Review" (Manager View)
  async getPendingRequests(orgId: string) {
    const { data, error } = await supabase
      .from('expense_requests')
      .select('*, profiles(full_name, avatar_url)')
      .eq('organization_id', orgId)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // 4. Approve Request (The "Titan" Feature)
  // This updates the request AND automatically logs it as a transaction
  async approveRequest(requestId: string, requestData: ExpenseRequest, managerId: string) {
    // A. Update Status
    const { error: updateError } = await supabase
      .from('expense_requests')
      .update({ status: 'approved' })
      .eq('id', requestId);

    if (updateError) throw updateError;

    // B. Create the Real Transaction
    // Auto-select the first account for now (In prod, manager selects account)
    const { data: account } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', managerId) // Assuming Org Owner pays
        .limit(1)
        .single();

    if (account) {
        await supabase.from('transactions').insert({
            user_id: managerId,
            account_id: account.id,
            amount: requestData.amount,
            type: 'expense',
            payee: requestData.merchant,
            description: `Approved Request: ${requestData.reason} (by ${requestData.requester_id})`,
            date: new Date().toISOString(),
            status: 'cleared',
            category: 'Business'
        });
    }
  },

  // 5. Reject Request
  async rejectRequest(requestId: string) {
    const { error } = await supabase
      .from('expense_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);
    if (error) throw error;
  }
};