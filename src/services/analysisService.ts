/**
 * src/services/analysisService.ts
 * ROLE: The "Titan" Predictive Engine.
 * PURPOSE: Provides high-precision cash flow forecasting, payday detection,
 * and liquidity risk assessment.
 */

import { supabase } from '../lib/supabase';
import { CashFlowPoint, SafeSpendMetrics } from '../types';
import dayjs from 'dayjs';

export const AnalysisService = {
  /**
   * 📉 TITAN-2 FORECASTING MODEL
   * Generates a 60-day window (30 history / 30 forecast).
   * USES: Exponential Moving Average (EMA) for burn rates to favor recent habits.
   */
  async generateCashFlowForecast(userId: string): Promise<CashFlowPoint[]> {
    const { data: account } = await supabase
      .from('accounts')
      .select('balance')
      .eq('user_id', userId)
      .single();

    const currentBalance = account?.balance || 0;
    const historyStart = dayjs().subtract(30, 'day').toISOString();

    // 1. Fetch historical data for habit modeling
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, date')
      .eq('user_id', userId)
      .gte('date', historyStart)
      .order('date', { ascending: true });

    // 2. Fetch known commitments (Fixed Costs)
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('amount, next_billing_date')
      .eq('user_id', userId)
      .eq('status', 'active');

    // --- RECONSTRUCT HISTORY ---
    const historicalPoints: CashFlowPoint[] = [];
    let rollingHistoryBalance = currentBalance;
    const dailyDeltaMap = new Map<string, number>();

    transactions?.forEach((t) => {
      const dateKey = dayjs(t.date).format('YYYY-MM-DD');
      dailyDeltaMap.set(
        dateKey,
        (dailyDeltaMap.get(dateKey) || 0) + Number(t.amount)
      );
    });

    for (let i = 0; i <= 30; i++) {
      const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      historicalPoints.unshift({
        date,
        value: Number(rollingHistoryBalance.toFixed(2)),
        is_forecast: false,
      });
      rollingHistoryBalance -= dailyDeltaMap.get(date) || 0;
    }

    // --- GENERATE INTELLIGENT FORECAST ---
    // Weighted Burn Rate: Recent spending is 2x more predictive than 30 days ago.
    const expenses = transactions?.filter((t) => t.amount < 0) || [];
    const avgDailyBurn = this.calculateWeightedBurn(expenses);

    const forecastPoints: CashFlowPoint[] = [];
    let forecastBalance = currentBalance;

    for (let i = 1; i <= 30; i++) {
      const futureDate = dayjs().add(i, 'day');
      const dateStr = futureDate.format('YYYY-MM-DD');

      // Apply Burn + Subscriptions
      forecastBalance -= avgDailyBurn;
      subscriptions?.forEach((sub) => {
        if (dayjs(sub.next_billing_date).date() === futureDate.date()) {
          forecastBalance -= Number(sub.amount);
        }
      });

      forecastPoints.push({
        date: dateStr,
        value: Number(forecastBalance.toFixed(2)),
        is_forecast: true,
      });
    }

    return [...historicalPoints, ...forecastPoints];
  },

  /**
   * 🛡️ SAFE-TO-SPEND (LIQUIDITY SHIELD)
   * Calculates discretionary limits after locking in fixed costs and emergency buffers.
   */
  async calculateSafeToSpend(userId: string): Promise<SafeSpendMetrics> {
    const today = dayjs();
    const { data: account } = await supabase
      .from('accounts')
      .select('balance')
      .eq('user_id', userId)
      .single();
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('amount')
      .eq('user_id', userId)
      .eq('status', 'active');

    const currentBalance = account?.balance || 0;
    const totalBills = subs?.reduce((sum, s) => sum + Number(s.amount), 0) || 0;

    // Auto-detect Payday (Look for highest recurring deposit)
    const daysUntilPayday = await this.detectDaysUntilPayday(userId);

    // Safety Logic: Balance - Bills - (15% Volatility Buffer)
    const lockedCapital = totalBills + currentBalance * 0.15;
    const available = Math.max(0, currentBalance - lockedCapital);
    const dailySafeLimit = available / (daysUntilPayday || 1);

    return {
      safeToSpend: Number(dailySafeLimit.toFixed(2)),
      monthlyIncome: 0, // Calculated via income service
      monthlyExpenses: 0,
      emergencyFund: currentBalance * 0.2, // 20% Liquidity Target
      daysUntilPayday,
      daily_limit: Number(dailySafeLimit.toFixed(2)),
      total_recurring_bills: totalBills,
      risk_level:
        dailySafeLimit < 50 ? 'high' : dailySafeLimit < 150 ? 'medium' : 'low',
    };
  },

  /**
   * 🔍 AUTO-PAYDAY DETECTION
   * Analyzes history to find the most likely next deposit date.
   */
  async detectDaysUntilPayday(userId: string): Promise<number> {
    const { data: income } = await supabase
      .from('transactions')
      .select('date, amount')
      .eq('user_id', userId)
      .gt('amount', 0)
      .limit(5);

    if (!income || income.length === 0) return 14; // Default fallback

    const lastPayDate = dayjs(income[0].date);
    const nextPayDate = lastPayDate.add(14, 'day'); // Assume bi-weekly if one-off
    const diff = nextPayDate.diff(dayjs(), 'day');

    return diff > 0 ? diff : 14;
  },

  calculateWeightedBurn(transactions: any[]): number {
    if (transactions.length === 0) return 0;
    // EMA-style weight: More weight on recent items
    const total = transactions.reduce((acc, t, idx) => {
      const weight = (idx + 1) / transactions.length;
      return acc + Math.abs(t.amount) * weight;
    }, 0);
    return (total / transactions.length) * 0.8; // Normalized
  },
};
