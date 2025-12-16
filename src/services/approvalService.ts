import { supabase } from '@/lib/supabase';
import { ExpenseRequest } from '@/types';

export const approvalService = {
  // 1. Submit a new request
  async createRequest(orgId: string, userId: string, data: { amount: number, merchant: string, reason: string }) {
    if (!orgId || !userId) {
      throw new Error('Organization ID and User ID are required');
    }
    if (!data.amount || data.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    if (!data.merchant || data.merchant.trim().length === 0) {
      throw new Error('Merchant name is required');
    }

    const { data: result, error } = await supabase
      .from('expense_requests')
      .insert({
        organization_id: orgId,
        requester_id: userId,
        amount: data.amount,
        merchant: data.merchant.trim(),
        reason: data.reason?.trim() || 'No reason provided',
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Create request error:', error);
      if (error.code === '23503') {
        throw new Error('Invalid organization or user. Please try again.');
      } else if (error.code === '42501') {
        throw new Error('Permission denied. You may not have access to create requests for this organization.');
      }
      throw new Error(error.message || 'Failed to create expense request');
    }

    return result;
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
      .select('*, requester:profiles!expense_requests_requester_id_fkey(first_name, last_name, avatar_url)')
      .eq('organization_id', orgId)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      // Fallback: if foreign key doesn't exist, query without join and fetch profiles separately
      if (error.code === 'PGRST200' || error.message?.includes('relationship')) {
        const { data: requests, error: reqError } = await supabase
          .from('expense_requests')
          .select('*')
          .eq('organization_id', orgId)
          .eq('status', 'pending')
          .order('created_at', { ascending: true });
        
        if (reqError) throw reqError;
        
        // Fetch profiles separately
        if (requests && requests.length > 0) {
          const requesterIds = requests.map(r => r.requester_id).filter(Boolean);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, avatar_url')
            .in('id', requesterIds);
          
          // Merge profiles into requests
          return requests.map(req => ({
            ...req,
            requester: profiles?.find(p => p.id === req.requester_id) || null
          }));
        }
        return requests || [];
      }
      throw error;
    }
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