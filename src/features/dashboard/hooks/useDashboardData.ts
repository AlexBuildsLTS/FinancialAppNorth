// src/hooks/useDashboardData.ts

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { supabase } from '@/shared/lib/supabase';
import { Transaction, Budget, BudgetItemData } from '@/shared/types'; // Added BudgetItemData
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';
import { error } from 'console';

export interface DashboardMetrics {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsGoal: number;
  spendingTrends: { value: number; date: string; label?: string; }[];
  budgetAllocation: { category: string; value: number; }[];
  currentBudget: number;
  totalBudget: number;
  recentTransactions: Transaction[];
  budgets: BudgetItemData[]; // Use BudgetItemData from shared types
  incomeChartData: { value: number; label: string; }[];
  expenseChartData: { value: number; label: string; }[];
}

export const useDashboardData = () => {
  const { session } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [incomeChartData, setIncomeChartData] = useState<any[]>([]); // Separate state for income
  const [expenseChartData, setExpenseChartData] = useState<any[]>([]); // Separate state for expenses
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

      // --- Fetch monthly income and expenses for the last 6 months ---
      const monthlyDataPromises = [];
      const monthsToFetch = 6;
      for (let i = 0; i < monthsToFetch; i++) {
        const month = subMonths(now, i);
        const monthStart = format(startOfMonth(month), 'yyyy-MM-dd');
        const monthEnd = format(endOfMonth(month), 'yyyy-MM-dd');
        monthlyDataPromises.push(
          supabase.rpc('get_monthly_income_summary', { month_start: monthStart, month_end: monthEnd })
        );
      }
      const monthlyResults = await Promise.all(monthlyDataPromises);

      const incomeData: any[] = [];
      const expenseData: any[] = [];

      // Process results in reverse order to show oldest to newest
      for (let i = monthsToFetch - 1; i >= 0; i--) {
        const month = subMonths(now, i);
        const monthLabel = format(month, 'yyyy-MM-dd');
        const result = monthlyResults[i].data?.[0]; // Each RPC call returns an array with one object

        incomeData.push({
          value: result?.total_income || 0,
          label: monthLabel, // This will now be a full date string
        });
        expenseData.push({
          value: result?.total_expense || 0,
          label: monthLabel, // This will now be a full date string
        });
      }

      // --- Run other data queries in parallel ---
      const [
        totalBalanceResult,
        monthlyIncomeResult,
        monthlyExpensesResult,
        recentTransactionsResult,
        budgetsResult,
      ] = await Promise.all([
        // Query 1: Get total balance from all accounts
        supabase.from('accounts').select('balance').eq('user_id', userId),
        // Query 2: Get sum of income for the current month
        supabase.from('transactions').select('amount').eq('user_id', userId).eq('type', 'income').gte('transaction_date', periodStart).lte('transaction_date', periodEnd),
        // Query 3: Get sum of expenses for the current month
        supabase.from('transactions').select('amount').eq('user_id', userId).eq('type', 'expense').gte('transaction_date', periodStart).lte('transaction_date', periodEnd),
        // Query 4: Get 5 most recent transactions
        supabase.from('transactions').select('*').eq('user_id', userId).order('transaction_date', { ascending: false }).limit(5),
        // Query 5: Get all budgets for the user
        supabase.from('budgets').select('*').eq('user_id', userId),
      ]);

      // --- Process results ---
      const totalBalance = totalBalanceResult.data?.reduce((sum: number, acc: { balance: number }) => sum + acc.balance, 0) || 0;
      const monthlyIncome = monthlyIncomeResult.data?.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0) || 0;
      const monthlyExpenses = monthlyExpensesResult.data?.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0) || 0;
      const recentTransactions = (recentTransactionsResult.data as Transaction[]) || [];
      const budgets = (budgetsResult.data as Budget[]) || [];
      
      // Placeholder for savingsGoal, spendingTrends, budgetAllocation, currentBudget, totalBudget
      // These would typically come from additional Supabase queries or calculations
      const savingsGoal = 5000; // Example static value
      const savingsGoalValue = 5000; // Example static value, replace with actual data fetching
      const spendingTrendsData = incomeData.map((item, index) => ({
        value: item.value,
        date: item.label, // Assuming label is a date string
        label: format(subMonths(now, monthsToFetch - 1 - index), 'MMM dd'),
      }));
      const budgetAllocationData = budgets.map(b => ({ category: b.category, value: b.allocated_amount }));
      const currentBudgetAmount = budgets.reduce((sum, b) => sum + b.spent_amount, 0);
      const totalBudgetAmount = budgets.reduce((sum, b) => sum + b.allocated_amount, 0);

      setMetrics({
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        savingsGoal: savingsGoalValue,
        spendingTrends: spendingTrendsData,
        budgetAllocation: budgetAllocationData,
        currentBudget: currentBudgetAmount,
        totalBudget: totalBudgetAmount,
        recentTransactions,
        budgets: budgets.map(b => ({
          category: b.category,
          spent: b.spent_amount,
          budget: b.allocated_amount,
        })),
        incomeChartData: incomeData,
        expenseChartData: expenseData,
      });

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Function to allow manual refresh
  const refreshData = () => fetchData();

  return { metrics, incomeChartData, expenseChartData, loading, error, refreshData };
};
function setError(arg0: any) {
  throw new Error('Function not implemented.');
}

