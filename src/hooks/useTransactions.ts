import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Transaction } from '@/types';
import { useAuth } from '@/context/AuthContext';

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
    } catch (e: unknown) {
      setError('Could not load transactions.');
      console.error('useTransactions fetch error', e);
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
