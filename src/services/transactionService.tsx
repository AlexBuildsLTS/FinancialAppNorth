import { supabase } from '../lib/supabase';
import { Transaction } from '../types';

// Function to get the current logged-in user's ID
const getUserId = async (): Promise<string | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id || null;
};

// Fetches all transactions for the current user
export const fetchTransactions = async (): Promise<Transaction[]> => {
  try {
    const userId = await getUserId();
    if (!userId) {
      console.log('No user logged in, returning empty array.');
      return [];
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return data as Transaction[];
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return [];
  }
};
