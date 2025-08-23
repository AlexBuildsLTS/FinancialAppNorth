import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '../types';
import { fetchTransactions } from '../services/realTransactionService';
import { useAuth } from '../context/AuthContext';

export const useTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const data = await fetchTransactions(user.id);
      setTransactions(data);
      setError(null);
    } catch (e) {
      setError("Failed to fetch transactions.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshTransactions();
  }, [refreshTransactions]);

  return { transactions, isLoading, error, refreshTransactions };
};