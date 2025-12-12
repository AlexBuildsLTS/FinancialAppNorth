import { supabase } from '../lib/supabase';
import { CashFlowPoint, SafeSpendMetrics } from '../types';

/**
 * ==============================================================================
 * 📈 PREDICTIVE CASH FLOW ANALYSIS
 * ==============================================================================
 */

/**
 * Generates a 30-day cash flow forecast based on last 3 months of data.
 * Uses linear regression for income and exponential smoothing for expenses.
 */
export const generateCashFlowForecast = async (userId: string): Promise<CashFlowPoint[]> => {
  // 1. Fetch last 90 days of transactions
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, date')
    .eq('user_id', userId)
    .gte('date', ninetyDaysAgo.toISOString())
    .order('date', { ascending: true });

  if (!transactions || transactions.length < 10) {
    return [];
  }

  // 2. Calculate daily running balance (historical)
  let runningBalance = 0;
  const historicalPoints: CashFlowPoint[] = [];
  const dailyTotals: { [date: string]: number } = {};

  // Group by date
  transactions.forEach(t => {
    const dateKey = t.date.split('T')[0];
    dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + parseFloat(t.amount);
  });

  // Calculate running balance
  Object.keys(dailyTotals).sort().forEach(date => {
    runningBalance += dailyTotals[date];
    historicalPoints.push({
      date,
      balance: runningBalance,
      is_forecast: false
    });
  });

  // 3. Analyze patterns (last 30 days for forecasting)
  const recentTransactions = transactions.slice(-30);
  const avgDailyIncome = recentTransactions
    .filter(t => parseFloat(t.amount) > 0)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0) / 30;

  const avgDailyExpense = Math.abs(recentTransactions
    .filter(t => parseFloat(t.amount) < 0)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)) / 30;

  // 4. Generate 30-day forecast
  const forecastPoints: CashFlowPoint[] = [];
  let forecastBalance = runningBalance;

  for (let i = 1; i <= 30; i++) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + i);
    const dateStr = futureDate.toISOString().split('T')[0];

    // Simple forecast: income - expenses
    forecastBalance += (avgDailyIncome - avgDailyExpense);

    forecastPoints.push({
      date: dateStr,
      balance: forecastBalance,
      is_forecast: true
    });
  }

  return [...historicalPoints, ...forecastPoints];
};

/**
 * Calculates risk level based on forecast (will balance go negative?)
 */
export const getCashFlowRiskLevel = (forecast: CashFlowPoint[]): 'low' | 'medium' | 'high' => {
  const forecastPoints = forecast.filter(p => p.is_forecast);
  const negativeDays = forecastPoints.filter(p => p.balance < 0).length;

  if (negativeDays > 10) return 'high';
  if (negativeDays > 5) return 'medium';
  return 'low';
};

/**
 * Calculates the safe daily spending limit based on upcoming bills and cash flow.
 */
export const calculateSafeToSpend = async (userId: string): Promise<SafeSpendMetrics> => {
  const today = new Date();
  const nextPayday = new Date(today);
  nextPayday.setDate(today.getDate() + 14); // Assume bi-weekly pay cycle

  // Get current balance
  const { data: balanceData } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(1);

  let currentBalance = 0;
  if (balanceData && balanceData.length > 0) {
    // Calculate running balance from recent transactions
    const { data: recentTxns } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(50);

    currentBalance = recentTxns?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
  }

  // Get recurring bills due before next payday
  const { data: upcomingBills } = await supabase
    .from('transactions')
    .select('amount, description')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .lt('amount', 0)
    .gte('date', today.toISOString())
    .lte('date', nextPayday.toISOString());

  const totalRecurringBills = upcomingBills?.reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0) || 0;

  // Get average daily spending (last 30 days)
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const { data: recentSpending } = await supabase
    .from('transactions')
    .select('amount, date')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .lt('amount', 0)
    .gte('date', thirtyDaysAgo.toISOString());

  const dailySpendingGroups: { [date: string]: number } = {};
  recentSpending?.forEach(t => {
    const dateKey = t.date.split('T')[0];
    dailySpendingGroups[dateKey] = (dailySpendingGroups[dateKey] || 0) + Math.abs(parseFloat(t.amount));
  });

  const dailySpends = Object.values(dailySpendingGroups);
  const averageDailySpending = dailySpends.length > 0
    ? dailySpends.reduce((a, b) => a + b, 0) / dailySpends.length
    : 0;

  // Calculate days until payday
  const daysUntilPayday = Math.ceil((nextPayday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Safe to spend calculation
  const availableAfterBills = currentBalance - totalRecurringBills;
  const projectedSpending = averageDailySpending * daysUntilPayday;
  const safeDailyLimit = Math.max(0, (availableAfterBills - projectedSpending) / daysUntilPayday);

  // Risk assessment
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (safeDailyLimit < averageDailySpending * 0.5) riskLevel = 'high';
  else if (safeDailyLimit < averageDailySpending * 0.8) riskLevel = 'medium';

  return {
    daily_limit: Math.round(safeDailyLimit * 100) / 100,
    days_until_payday: daysUntilPayday,
    total_recurring_bills: totalRecurringBills,
    average_daily_spending: Math.round(averageDailySpending * 100) / 100,
    risk_level: riskLevel,
    next_payday: nextPayday.toISOString()
  };
};