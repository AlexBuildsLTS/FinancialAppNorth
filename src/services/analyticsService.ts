import { supabase } from '../lib/supabase';
import { FinancialSummary } from '../types';

/**
 * 📊 TITAN 4: ANALYTICS ENGINE
 * Centralizes data aggregation so widgets can just ask for "Revenue" 
 * without knowing SQL logic.
 */

// Define standard Chart Data structure (compatible with react-native-chart-kit)
interface ChartData {
  labels: string[];
  datasets: { data: number[] }[];
}

export const analyticsService = {
  
  /**
   * Fetch data for a specific widget type dynamically
   */
  getWidgetData: async (userId: string, widgetType: string): Promise<ChartData | null> => {
    switch (widgetType) {
      case 'cashflow':
        return await fetchCashFlowTrend(userId);
      case 'revenue_trend':
        return await fetchRevenueByCategory(userId);
      case 'burn_rate':
        return await fetchBurnRate(userId);
      default:
        console.warn(`[Analytics] Unknown widget type: ${widgetType}`);
        return null;
    }
  },

  /**
   * Get a snapshot of key metrics for the "Health Scorecard"
   */
  getHealthMetrics: async (userId: string) => {
    const { data: txs } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', userId);

    if (!txs) return null;

    const income = txs.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    const expense = txs.filter(t => t.type === 'expense').reduce((acc, t) => acc + Math.abs(Number(t.amount)), 0);
    const burnRate = expense / 30; // Approx daily burn

    return {
      income,
      expense,
      net: income - expense,
      burnRate,
      runwayDays: income > 0 ? (income / (burnRate || 1)) : 0
    };
  }
};

// --- INTERNAL HELPERS ---

const fetchCashFlowTrend = async (userId: string): Promise<ChartData> => {
  // Get last 6 months of data
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data } = await supabase
    .from('transactions')
    .select('amount, date')
    .eq('user_id', userId)
    .gte('date', sixMonthsAgo.toISOString())
    .order('date', { ascending: true });

  // Group by Month (Simplified aggregation)
  const monthlyData: Record<string, number> = {};
  data?.forEach(t => {
    const month = t.date.substring(0, 7); // "2024-01"
    monthlyData[month] = (monthlyData[month] || 0) + Number(t.amount);
  });

  const labels = Object.keys(monthlyData).slice(-6); // Last 6 months
  const values = labels.map(label => monthlyData[label]);

  return {
    labels: labels.map(l => l.substring(5)), // Show only "MM"
    datasets: [{ data: values }]
  };
};

const fetchRevenueByCategory = async (userId: string): Promise<ChartData> => {
  // This would typically join with a Categories table
  // For demo, we mock distinct categories
  return {
    labels: ['Sales', 'Consulting', 'Investments'],
    datasets: [{ data: [5000, 2500, 1200] }] 
  };
};

const fetchBurnRate = async (userId: string): Promise<ChartData> => {
  // Mocking burn rate stability
  return {
    labels: ['W1', 'W2', 'W3', 'W4'],
    datasets: [{ data: [1200, 1500, 1100, 900] }]
  };
};