// src/hooks/useDashboardData.ts

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { supabase } from '@/shared/lib/supabase';
import { lineDataItem } from 'react-native-gifted-charts';
import { Transaction } from '@/shared/types';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';

export interface DashboardMetrics {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  recentTransactions: Transaction[];
}

export const useDashboardData = () => {
  const { session } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<lineDataItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);

    try {
      const userId = session.user.id;
      const now = new Date();
      const periodStart = format(startOfMonth(now), 'yyyy-MM-dd');
      const periodEnd = format(endOfMonth(now), 'yyyy-MM-dd');

      // --- Run all data queries in parallel ---
      const [
        totalBalanceResult,
        monthlyIncomeResult,
        monthlyExpensesResult,
        recentTransactionsResult,
        chartDataResult
      ] = await Promise.all([
        // Query 1: Get total balance from all accounts
        supabase.from('accounts').select('balance').eq('user_id', userId),
        // Query 2: Get sum of income for the current month
        supabase.from('transactions').select('amount').eq('user_id', userId).eq('type', 'income').gte('transaction_date', periodStart).lte('transaction_date', periodEnd),
        // Query 3: Get sum of expenses for the current month
        supabase.from('transactions').select('amount').eq('user_id', userId).eq('type', 'expense').gte('transaction_date', periodStart).lte('transaction_date', periodEnd),
        // Query 4: Get 5 most recent transactions
        supabase.from('transactions').select('*').eq('user_id', userId).order('transaction_date', { ascending: false }).limit(5),
        // Query 5: Get monthly income over the last 6 months for the chart
        supabase.rpc('get_monthly_income_summary', { user_id_param: userId, months_param: 6 })
      ]);

      // --- Process results ---
      const totalBalance = totalBalanceResult.data?.reduce((sum: number, acc: { balance: number }) => sum + acc.balance, 0) || 0;
      const monthlyIncome = monthlyIncomeResult.data?.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0) || 0;
      const monthlyExpenses = monthlyExpensesResult.data?.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0) || 0;
      const recentTransactions = (recentTransactionsResult.data as Transaction[]) || [];
      
      const formattedChartData = chartDataResult.data?.map((d: { month: string; total: number }) => ({
        value: d.total,
        label: format(new Date(d.month), 'MMM'),
      })) || [];

      setMetrics({ totalBalance, monthlyIncome, monthlyExpenses, recentTransactions });
      setChartData(formattedChartData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // You can set an error state here to show a message to the user
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Function to allow manual refresh
  const refreshData = () => fetchData();

  return { metrics, chartData, loading, refreshData };
};