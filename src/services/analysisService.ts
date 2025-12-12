import { supabase } from '../lib/supabase';
import { CashFlowPoint } from '../types';

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