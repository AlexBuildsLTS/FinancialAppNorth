import { supabase } from '../lib/supabase';
import type { Transaction } from '../types';

export type { Transaction } from '../types' ;

/**
 * Adds a new transaction to the database.
 * @param transactionData The transaction details.
 */
export async function addTransaction(
  transactionData: Omit<Transaction, 'id' | 'created_at' | 'status' | 'user_id'> & { user_id?: string }
): Promise<Transaction> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const newTransaction = {
    ...transactionData,
    user_id: transactionData.user_id || user.id,
    status: 'completed' as const,
  };

  const { data, error } = await supabase
    .from('transactions')
    .insert(newTransaction)
    .select()
    .single();

  if (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
  return data as Transaction;
};

/**
 * Fetch transactions (named function export so TS always sees correct return type).
 */
export async function fetchTransactions(limit?: number): Promise<Transaction[]> {
    const query = supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

    const { data, error } = limit ? await query.limit(limit) : await query;
    if (error) throw error;
    return (data || []) as Transaction[];
}
