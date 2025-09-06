import { useAuth } from '@/context/AuthContext';
import { fetchTransactions } from '@/services/transactionService';
import { DashboardMetricItem, Transaction } from '@/types';
import { Banknote, DollarSign, TrendingDown, TrendingUp } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';

export function useDashboardData() {
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetricItem[]>([]);
  const [chartData, setChartData] = useState<{ value: number; label: string }[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!profile?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
    const transactionsData = await fetchTransactions(5);

    setRecentTransactions(transactionsData);

      // Build simple chart data from recent transactions (value + date label)
      const sanitizedChartData = transactionsData.map((t: Transaction) => ({
        value: t.amount ?? 0,
        label: t.created_at ? new Date(t.created_at).toLocaleDateString() : '',
      }));
      setChartData(sanitizedChartData);
      
      const income = transactionsData
        .filter((t: Transaction) => t.type === 'income')
        .reduce((sum: number, t: Transaction) => sum + (t.amount ?? 0), 0);
      const expenses = transactionsData
        .filter((t: Transaction) => t.type === 'expense')
        .reduce((sum: number, t: Transaction) => sum + (t.amount ?? 0), 0);

      // FIX: This now correctly matches the detailed DashboardMetricItem type from your project.
      setMetrics([
        { title: 'Balance', value: `$${(income - expenses).toLocaleString('en-US')}`, change: 0, changeType: 'positive', Icon: DollarSign },
        { title: 'Income', value: `$${income.toLocaleString('en-US')}`, change: 0, changeType: 'positive', Icon: TrendingUp },
        { title: 'Expenses', value: `$${expenses.toLocaleString('en-US')}`, change: 0, changeType: 'negative', Icon: TrendingDown },
        { title: 'Savings', value: '$0.00', change: 0, changeType: 'positive', Icon: Banknote },
      ]);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { metrics, chartData, recentTransactions, isLoading, refreshData: fetchData };
}