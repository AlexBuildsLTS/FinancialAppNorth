import { supabase } from '../lib/supabase';
import { CashFlowPoint, SafeSpendMetrics } from '../types';

/**
 * ==============================================================================
 * 📈 PREDICTIVE CASH FLOW ANALYSIS (Titan Edition)
 * ==============================================================================
 */

/**
 * Generates a 30-day cash flow forecast.
 * IMPROVEMENT: Uses real `accounts` balance and specific `subscriptions` dates for accuracy.
 */
export const generateCashFlowForecast = async (userId: string): Promise<CashFlowPoint[]> => {
  // 1. Get Real Current Balance
  const { data: account } = await supabase
    .from('accounts')
    .select('balance')
    .eq('user_id', userId)
    .single();
    
  const currentBalance = account?.balance || 0;

  // 2. Fetch History (Last 30 Days) for Context
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, date')
    .eq('user_id', userId)
    .gte('date', thirtyDaysAgo.toISOString())
    .order('date', { ascending: true });

  // 3. Fetch Active Subscriptions (Known Future Expenses)
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('amount, next_billing_date')
    .eq('user_id', userId)
    .eq('status', 'active');

  // --- RECONSTRUCT HISTORY (Working backwards from current balance) ---
  const historicalPoints: CashFlowPoint[] = [];
  let tempBalance = currentBalance;
  
  // We iterate backwards from yesterday to build the historical line
  const today = new Date();
  const txMap = new Map<string, number>();
  
  transactions?.forEach(t => {
      const d = t.date.split('T')[0];
      txMap.set(d, (txMap.get(d) || 0) + Number(t.amount));
  });

  for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      historicalPoints.unshift({
          date: dateStr,
          value: parseFloat(tempBalance.toFixed(2)),
          is_forecast: false
      });

      // Reverse engineering the balance: 
      // Balance Yesterday = Today - (Income - Expense) -> Today - NetChange
      const dayChange = txMap.get(dateStr) || 0;
      tempBalance -= dayChange;
  }

  // --- GENERATE FORECAST (Forward looking) ---
  // Calculate Avg Daily Burn (Excluding massive outliers if we were using a real ML model)
  const totalSpend = transactions?.filter(t => Number(t.amount) < 0)
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
  const avgDailyBurn = Math.abs(totalSpend / 30);

  const forecastPoints: CashFlowPoint[] = [];
  let forecastBalance = currentBalance;

  for (let i = 1; i <= 30; i++) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + i);
    const dateStr = futureDate.toISOString().split('T')[0];

    // 1. Apply Baseline Burn
    forecastBalance -= avgDailyBurn;

    // 2. Apply Specific Subscription Hits
    // (Simple logic: if billing day matches today's day of month)
    subscriptions?.forEach(sub => {
        const billDate = new Date(sub.next_billing_date);
        if (billDate.getDate() === futureDate.getDate()) {
            forecastBalance -= Number(sub.amount);
        }
    });

    forecastPoints.push({
      date: dateStr,
      value: parseFloat(forecastBalance.toFixed(2)),
      is_forecast: true
    });
  }

  return [...historicalPoints, ...forecastPoints];
};

/**
 * Calculates risk level based on forecast
 */
export const getCashFlowRiskLevel = (forecast: CashFlowPoint[]): 'low' | 'medium' | 'high' => {
  const futurePoints = forecast.filter(p => p.is_forecast);
  const minBalance = Math.min(...futurePoints.map(p => p.value));

  if (minBalance < 0) return 'high'; // Going broke
  if (minBalance < 100) return 'medium'; // Cutting it close
  return 'low';
};

/**
 * Calculates the "Safe-to-Spend" daily limit.
 * FORMULA: (Balance - Recurring Bills) / Days until Payday
 */
export const calculateSafeToSpend = async (userId: string): Promise<SafeSpendMetrics> => {
  const today = new Date();
  
  // 1. Identify Payday (Simple heuristic: largest recurring deposit or default +14 days)
  // In a real app, user sets this. Here we assume standard bi-weekly.
  const nextPayday = new Date(today);
  nextPayday.setDate(today.getDate() + 14); 

  // 2. Get REAL Balance
  const { data: account } = await supabase
    .from('accounts')
    .select('balance')
    .eq('user_id', userId)
    .single();
  const currentBalance = account?.balance || 0;

  // 3. Get Upcoming Subscriptions (The "Committed" money)
  const { data: subs } = await supabase
    .from('subscriptions')
    .select('amount')
    .eq('user_id', userId)
    .eq('status', 'active');
  
  const totalRecurringBills = subs?.reduce((sum, s) => sum + Number(s.amount), 0) || 0;

  // 4. Calculate Days
  const daysUntilPayday = Math.ceil((nextPayday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // 5. Safe Calculation
  // We reserve the money for bills first.
  const availableAfterBills = currentBalance - totalRecurringBills;
  
  // We assume you need to eat.
  // const dailySurvivalNeeds = 20; // Hardcoded survival buffer
  // const discretionary = availableAfterBills - (dailySurvivalNeeds * daysUntilPayday);

  const safeDailyLimit = Math.max(0, availableAfterBills / daysUntilPayday);

  // 6. Get Avg Spending for Context
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: recent } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('date', thirtyDaysAgo.toISOString());
    
  const totalRecent = recent?.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) || 0;
  const averageDailySpending = totalRecent / 30;

  // 7. Risk Assessment
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (safeDailyLimit < averageDailySpending * 0.5) riskLevel = 'high'; // You usually spend double what is safe
  else if (safeDailyLimit < averageDailySpending) riskLevel = 'medium';

  return {
    safeToSpend: parseFloat(safeDailyLimit.toFixed(2)),
    monthlyIncome: 0, // This would need to be calculated from actual income data
    monthlyExpenses: totalRecent,
    emergencyFund: currentBalance * 0.3,
    daysUntilPayday: daysUntilPayday,
    daily_limit: parseFloat(safeDailyLimit.toFixed(2)),
    days_until_payday: daysUntilPayday,
    total_recurring_bills: totalRecurringBills,
    average_daily_spending: parseFloat(averageDailySpending.toFixed(2)),
    risk_level: riskLevel,
    next_payday: nextPayday.toISOString()
  };
};
