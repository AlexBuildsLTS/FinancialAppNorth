import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '@/types';
import { getTransactions, createTransaction as createTransactionService } from '@/services/dataService';

export const useTransactions = (accountId?: string) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = useCallback(async () => {
        if (!accountId) {
            setTransactions([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const data = await getTransactions(accountId);
            setTransactions(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch transactions');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [accountId]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
        try {
            setIsLoading(true);
            const newTransaction = await createTransactionService(transaction);
            setTransactions((prevTransactions) => [newTransaction, ...prevTransactions]);
            setError(null);
            return newTransaction;
        } catch (err) {
            setError('Failed to add transaction');
            console.error(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { transactions, isLoading, error, addTransaction, refetchTransactions: fetchTransactions };
};