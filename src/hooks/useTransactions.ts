import { useState, useEffect } from 'react';
import { Transaction } from '@/types';
import { getTransactions } from '@/services/dataService';

export const useTransactions = (accountId?: string) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTransactions = async () => {
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
        };

        fetchTransactions();
    }, [accountId]);

    return { transactions, isLoading, error };
};