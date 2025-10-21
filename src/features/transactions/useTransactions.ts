import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/shared/lib/supabase';
import { Transaction } from '@/shared/types';
import { useAuth } from '@/shared/context/AuthContext';

export function useTransactions() {
  const { session } = useAuth();
  const user = session?.user;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;
      setTransactions(data || []);
    } catch (e: any) {
      setError('Could not load transactions.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTransactions();
    const channel = supabase
      .channel('public:transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
          fetchTransactions();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTransactions]);

  return { transactions, isLoading, error, refreshTransactions: fetchTransactions };
}
