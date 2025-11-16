import { supabase } from '@/lib/supabase';

// Data structure for the metrics grid
export interface DashboardMetrics {
  totalRevenue: number;
  netProfit: number;
  expenses: number;
  cashBalance: number;
  revenueChange: number; // Percentage change
  profitChange: number;  // Percentage change
}

// Data structure for the chart
export interface ChartDataPoint {
  value: number;
  label: string;
  date?: string; // Optional for pointer label
}

/**
 * Fetches key metrics for the main dashboard.
 * This calls a PostgreSQL function in Supabase named `get_dashboard_metrics`.
 */
export const getDashboardMetrics = async (userId: string): Promise<DashboardMetrics> => {
  const { data, error } = await supabase.rpc('get_dashboard_metrics', { p_user_id: userId });

  if (error) {
    console.error('Error fetching dashboard metrics:', error);
    throw new Error('Could not load dashboard metrics.');
  }
  
  return data;
};

/**
 * Fetches monthly cash flow data for the dashboard chart.
 * This calls a PostgreSQL function in Supabase named `get_monthly_cash_flow`.
 */
export const getMonthlyCashFlow = async (userId: string): Promise<ChartDataPoint[]> => {
    const { data, error } = await supabase.rpc('get_monthly_cash_flow', { p_user_id: userId });

    if (error) {
        console.error('Error fetching chart data:', error);
        throw new Error('Could not load chart data.');
    }
    
    return data.map((d: any) => ({
        value: d.net_flow / 1000, // Format for chart (e.g., in thousands)
        label: d.month_label,
        date: d.month_label, // Pass month name for pointer tooltip
    }));
};