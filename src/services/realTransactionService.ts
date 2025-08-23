import { supabase } from '@/lib/supabase';
import { Transaction } from '@/types';

export const createTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: transaction.clientId, // Map clientId to user_id
      account_id: transaction.accountId,
      title: transaction.title,
      description: transaction.description,
      category: transaction.category,
      amount: transaction.amount,
      transaction_date: transaction.date,
      transaction_time: transaction.time,
      type: transaction.type,
      status: transaction.status,
      tags: transaction.tags,
      location: transaction.location,
    })
    .select()
    .single();

  if (error) throw error;

  // Map back to our Transaction interface
  return {
    id: data.id,
    clientId: data.user_id,
    accountId: data.account_id,
    title: data.title,
    description: data.description,
    category: data.category,
    amount: data.amount,
    date: data.transaction_date,
    time: data.transaction_time,
    type: data.type,
    status: data.status,
    tags: data.tags,
    location: data.location,
  };
};

export const fetchTransactions = async (userId?: string): Promise<Transaction[]> => {
  let query = supabase
    .from('transactions')
    .select('*')
    .order('transaction_date', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Map to our Transaction interface
  return (data || []).map(item => ({
    id: item.id,
    clientId: item.user_id,
    accountId: item.account_id,
    title: item.title,
    description: item.description,
    category: item.category,
    amount: item.amount,
    date: item.transaction_date,
    time: item.transaction_time,
    type: item.type,
    status: item.status,
    tags: item.tags,
    location: item.location,
  }));
};

export const updateTransaction = async (id: string, updates: Partial<Transaction>): Promise<void> => {
  const { error } = await supabase
    .from('transactions')
    .update({
      title: updates.title,
      description: updates.description,
      category: updates.category,
      amount: updates.amount,
      transaction_date: updates.date,
      transaction_time: updates.time,
      type: updates.type,
      status: updates.status,
      tags: updates.tags,
      location: updates.location,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
};