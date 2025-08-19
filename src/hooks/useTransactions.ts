import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '../types';
import { fetchTransactions } from '../services/transactionService';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchTransactions();
      setTransactions(data);
      setError(null);
    } catch (e) {
      setError("Failed to fetch transactions.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTransactions();
  }, [refreshTransactions]);

  return { transactions, isLoading, error, refreshTransactions };
};