import { supabase } from '@/lib/supabase';
import { Transaction } from '@/types';

/**
 * Adds a new transaction to the database.
 * @param transactionData The transaction details.
 */
export const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at' | 'status' | 'user_id'> & { user_id?: string }): Promise<Transaction> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

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
        console.error("Error adding transaction:", error);
        throw error;
    }
    return data as Transaction;
};
