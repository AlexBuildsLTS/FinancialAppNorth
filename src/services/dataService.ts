// src/services/dataService.ts
import { supabase } from '@/lib/supabase';
import { Transaction } from '@/types';

/**
 * Fetches all transactions for the currently authenticated user.
 */
export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
  // The 'data' from Supabase should now directly match the Transaction interface.
  // No complex mapping is needed if your table and type are aligned.
  return data as Transaction[];
};

/**
 * Creates a new transaction.
 */
export const createTransaction = async (
  transaction: Omit<Transaction, 'id' | 'created_at'>
): Promise<Transaction> => {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
        ...transaction,
        // Ensure the object passed in matches the table structure
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
  return data as Transaction;
};