import { Transaction, FinancialSummary } from '../types';
import dayjs from 'dayjs';
 

// Configuration for Tax Entities (Titan 1 Differentiation)
export const TAX_JURISDICTIONS = {
  'US_CA': { rate: 0.29, name: 'California, USA' },
  'US_TX': { rate: 0.21, name: 'Texas, USA' },
  'SE': { rate: 0.32, name: 'Sweden' }, // High tax example
  'UK': { rate: 0.20, name: 'United Kingdom' },
};

export const ENTITY_TYPES = {
  'INDIVIDUAL': { deduction_factor: 0.0 },
  'LLC': { deduction_factor: 0.15 }, // LLCs write off ~15% more
  'CORP': { deduction_factor: 0.25 },
};

export class FinancialBrain {
  
  /**
   * Titan 1: Context-Aware Tax Projection
   * Unlike competitors using static %, we adjust based on User Entity & Location.
   */
  static calculateRealTaxLiability(
    netIncome: number, 
    locationCode: keyof typeof TAX_JURISDICTIONS = 'SE', 
    entityType: keyof typeof ENTITY_TYPES = 'INDIVIDUAL'
  ) {
    const jurisdiction = TAX_JURISDICTIONS[locationCode];
    const entity = ENTITY_TYPES[entityType];

    // Base tax
    let estimatedTax = netIncome * jurisdiction.rate;

    // Apply Entity optimizations (The "Proactive" part)
    // We assume the app has helped them track deductible expenses
    const optimizationSavings = estimatedTax * entity.deduction_factor;
    const finalLiability = Math.max(0, estimatedTax - optimizationSavings);

    return {
      estimatedTax: finalLiability,
      effectiveRate: (finalLiability / netIncome) * 100,
      savingsFromStructure: optimizationSavings,
      jurisdictionName: jurisdiction.name
    };
  }

  
  /**
   * Titan 1: The "Bankruptcy vs Profit" Predictor
   * Analyzes burn rate to give a timeline, not just a number.
   */
  static predictRunway(currentBalance: number, history: Transaction[]) {
    // 1. Calculate Average Monthly Burn
    const threeMonthsAgo = dayjs().subtract(3, 'month');
    const recentExpenses = history.filter(t => 
      t.type === 'expense' && dayjs(t.date).isAfter(threeMonthsAgo)
    );

    if (recentExpenses.length === 0) return { status: 'STABLE', monthsLeft: Infinity };

    const totalBurn = recentExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const monthlyBurn = totalBurn / 3;

    // 2. Predict
    if (monthlyBurn === 0) return { status: 'STABLE', monthsLeft: Infinity };

    const monthsLeft = currentBalance / monthlyBurn;

    // 3. Generate Insight (The "Meaning" vs "Data")
    let status: 'CRITICAL' | 'WARNING' | 'HEALTHY' | 'PROFITABLE' = 'HEALTHY';
    let message = "";

    if (monthsLeft < 1) {
      status = 'CRITICAL';
      message = "Insolvency imminent. Immediate freeze on expenses recommended.";
    } else if (monthsLeft < 3) {
      status = 'WARNING';
      message = `Runway is tight (${monthsLeft.toFixed(1)} months). Delay capital expenditures.`;
    } else if (monthsLeft > 12) {
      status = 'PROFITABLE';
      message = "Strong cash position. Consider reinvesting into growth assets.";
    } else {
      message = `Stable runway of ${monthsLeft.toFixed(1)} months.`;
    }

    return {
      status,
      monthsLeft,
      monthlyBurn,
      message
    };
  }

  /**
   * Generates the "CFO Report" for the Dashboard
   */
  static generateCFOReport(summary: FinancialSummary, transactions: Transaction[]) {
    // Hardcoded location/entity for MVP - later comes from User Settings
    const taxProjection = this.calculateRealTaxLiability(summary.income, 'SE', 'INDIVIDUAL');
    const runway = this.predictRunway(summary.balance, transactions);

    return {
      tax: taxProjection,
      runway: runway,
      healthScore: this.calculateHealthScore(summary, runway),
      actionItem: runway.status === 'CRITICAL' ? 'Cut Expenses' : 'Optimize Tax'
    };
  }

  private static calculateHealthScore(summary: FinancialSummary, runway: any) {
    let score = 50;
    if (summary.balance > 0) score += 10;
    if (runway.monthsLeft > 6) score += 20;
    if (summary.expense < (summary.income * 0.7)) score += 20; // 30% savings rule
    return Math.min(100, score);
  }
}