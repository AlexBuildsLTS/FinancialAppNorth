/**
 * ============================================================================
 * 🤖 NORTHFINANCE PREDICTIVE ENGINE (TITAN 2)
 * ============================================================================
 * @module Forecasting
 * @description
 * Implements Linear Regression (Least Squares Method) to analyze historical
 * financial data and project future trends.
 *
 * Used by: CFO Dashboard, Cash Flow Reports.
 * ============================================================================
 */

import { differenceInDays, addMonths, startOfMonth, format } from 'date-fns';

type DataPoint = {
  date: Date;
  value: number;
};

type ForecastResult = {
  slope: number;
  intercept: number;
  predict: (date: Date) => number;
  trend: 'up' | 'down' | 'flat';
};

/**
 * Calculates the linear trend line from a set of data points.
 * @param data Array of { date, value } objects.
 */
export const calculateTrend = (data: DataPoint[]): ForecastResult => {
  const n = data.length;
  // Safety: Need at least 2 points to draw a line
  if (n < 2) {
    return { slope: 0, intercept: 0, predict: () => 0, trend: 'flat' };
  }

  // Normalize dates to "Days from Start" (x-axis) for mathematical processing
  const startDate = data[0].date;
  const xValues = data.map(d => differenceInDays(d.date, startDate));
  const yValues = data.map(d => d.value);

  // Summation Calculations
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

  // Slope (m) and Intercept (b) formulas
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Prediction Function
  const predict = (targetDate: Date) => {
    const daysDiff = differenceInDays(targetDate, startDate);
    const result = slope * daysDiff + intercept;
    // Finance specific: Spending cannot be negative in this context
    return Math.max(0, result);
  };

  return {
    slope,
    intercept,
    predict,
    trend: slope > 0.5 ? 'up' : slope < -0.5 ? 'down' : 'flat',
  };
};

/**
 * Generates specific forecast data points for charting libraries.
 * @param history Raw historical data.
 * @param monthsAhead Number of months to project.
 */
export const generateFinancialForecast = (history: DataPoint[], monthsAhead: number = 3) => {
  // 1. Sort history chronologically
  const sortedHistory = [...history].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  if (sortedHistory.length === 0) return { model: null, forecast: [] };

  // 2. Calculate Model
  const model = calculateTrend(sortedHistory);
  const lastDate = sortedHistory[sortedHistory.length - 1].date;
  const forecast = [];

  // 3. Generate Future Points
  for (let i = 1; i <= monthsAhead; i++) {
    const nextDate = startOfMonth(addMonths(lastDate, i));
    const predictedValue = model.predict(nextDate);
    
    forecast.push({
      label: format(nextDate, 'MMM'),
      value: Math.round(predictedValue),
      type: 'projected'
    });
  }

  return { model, forecast };
};