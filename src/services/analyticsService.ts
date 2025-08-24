import { Transaction } from '@/types';
import { startOfMonth, format } from 'date-fns';

export interface AnalyticsData {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  expenseByCategory: { category: string; amount: number }[];
  incomeVsExpenseData: { month: string; income: number; expenses: number }[];
  topSpendingCategory: { category: string; amount: number } | null;
}

export const processAnalytics = (transactions: Transaction[]): AnalyticsData => {
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const expenseByCategoryMap = new Map<string, number>();
  transactions.filter(t => t.type === 'expense').forEach(t => {
      const category = t.category || 'Other';
      expenseByCategoryMap.set(category, (expenseByCategoryMap.get(category) || 0) + t.amount);
  });

  const expenseByCategory = Array.from(expenseByCategoryMap.entries()).map(([category, amount]) => ({ category, amount }));
  const topSpendingCategory = expenseByCategory.length > 0 ? expenseByCategory.reduce((prev, current) => (prev.amount > current.amount) ? prev : current) : null;

  const monthlyDataMap = new Map<string, { income: number, expenses: number }>();
  transactions.forEach(t => {
      const date = new Date(t.date);
      if(!isNaN(date.getTime())) {
        const month = format(startOfMonth(date), 'MMM');
        const current = monthlyDataMap.get(month) || { income: 0, expenses: 0 };
        if (t.type === 'income') {
            current.income += t.amount;
        } else {
            current.expenses += t.amount;
        }
        monthlyDataMap.set(month, current);
      }
  });
  
  const incomeVsExpenseData = Array.from(monthlyDataMap.entries()).map(([month, data]) => ({ month, ...data }));

  return {
    totalIncome,
    totalExpenses,
    netCashFlow: totalIncome - totalExpenses,
    expenseByCategory,
    incomeVsExpenseData,
    topSpendingCategory
  };
};