/**
 * src/services/taxService.ts
 * ROLE: Global Tax Liability & Compliance Engine.
 * PURPOSE: Estimates regional tax obligations (VAT/Income/Corporate) for US, UK, and EU.
 * ARCHITECTURE: Strategy Pattern based on User Country Configuration.
 */

import { supabase } from '../lib/supabase';
import { Transaction, TaxCategory, TaxReportSummary, User } from '../types';
import dayjs from 'dayjs';
import * as Haptics from 'expo-haptics';

interface TaxBracket {
  threshold: number;
  rate: number;
}

interface RegionalConfig {
  currency: string;
  vatName: string; // Moms, IVA, VAT, Sales Tax
  standardVatRate: number;
  corporateTaxRate: number;
  progressiveBrackets: TaxBracket[];
  fiscalYearEnd: string; // MM-DD
}

/**
 * 🌍 GLOBAL TAX REGISTRY
 * Data-driven configurations for NorthFinance target markets.
 */
const REGIONAL_CONFIGS: Record<string, RegionalConfig> = {
  Sweden: {
    currency: 'SEK',
    vatName: 'Moms',
    standardVatRate: 0.25,
    corporateTaxRate: 0.206,
    progressiveBrackets: [
      { threshold: 0, rate: 0.32 }, // Kommunalskatt average
      { threshold: 598500, rate: 0.52 }, // State tax threshold
    ],
    fiscalYearEnd: '12-31',
  },
  UK: {
    currency: 'GBP',
    vatName: 'VAT',
    standardVatRate: 0.2,
    corporateTaxRate: 0.25,
    progressiveBrackets: [
      { threshold: 12570, rate: 0.2 },
      { threshold: 50270, rate: 0.4 },
      { threshold: 125140, rate: 0.45 },
    ],
    fiscalYearEnd: '04-05',
  },
  Norway: {
    currency: 'NOK',
    vatName: 'MVA',
    standardVatRate: 0.25,
    corporateTaxRate: 0.22,
    progressiveBrackets: [
      { threshold: 0, rate: 0.22 },
      { threshold: 190350, rate: 0.237 }, // Step tax simplified
    ],
    fiscalYearEnd: '12-31',
  },
  Spain: {
    currency: 'EUR',
    vatName: 'IVA',
    standardVatRate: 0.21,
    corporateTaxRate: 0.25,
    progressiveBrackets: [
      { threshold: 0, rate: 0.19 },
      { threshold: 12450, rate: 0.24 },
      { threshold: 60000, rate: 0.45 },
    ],
    fiscalYearEnd: '12-31',
  },
  USA: {
    currency: 'USD',
    vatName: 'Sales Tax',
    standardVatRate: 0.0, // Calculated at checkout usually
    corporateTaxRate: 0.21,
    progressiveBrackets: [
      { threshold: 0, rate: 0.1 },
      { threshold: 11600, rate: 0.12 },
      { threshold: 47150, rate: 0.22 },
      { threshold: 100525, rate: 0.24 },
    ],
    fiscalYearEnd: '12-31',
  },
};

export class TaxService {
  /**
   * 📉 ESTIMATE TAX LIABILITY
   * Computes projected tax due based on current net income and regional brackets.
   */
  static async estimateLiability(
    userId: string
  ): Promise<{ estimatedTax: number; effectiveRate: number; breakdown: any }> {
    const { data: user } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    const country = user?.country || 'USA';
    const config = REGIONAL_CONFIGS[country] || REGIONAL_CONFIGS['USA'];

    // Fetch Year-to-Date Performance
    const startOfYear = dayjs().startOf('year').toISOString();
    const { data: txs } = await supabase
      .from('transactions')
      .select('amount, type, is_tax_deductible')
      .eq('user_id', userId)
      .gte('date', startOfYear);

    if (!txs) return { estimatedTax: 0, effectiveRate: 0, breakdown: {} };

    const income = txs
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const expenses = txs
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    const taxableProfit = Math.max(0, income - expenses);

    // Calculate Progressive Tax
    let estimatedTax = 0;
    let remainingProfit = taxableProfit;
    let prevThreshold = 0;

    for (const bracket of config.progressiveBrackets) {
      const taxableInThisBracket = Math.min(
        Math.max(0, remainingProfit),
        bracket.threshold === 0 ? Infinity : bracket.threshold - prevThreshold
      );

      if (taxableInThisBracket <= 0) break;

      estimatedTax += taxableInThisBracket * bracket.rate;
      remainingProfit -= taxableInThisBracket;
      prevThreshold = bracket.threshold;
    }

    const effectiveRate = taxableProfit > 0 ? estimatedTax / taxableProfit : 0;

    return {
      estimatedTax: Number(estimatedTax.toFixed(2)),
      effectiveRate: Number((effectiveRate * 100).toFixed(1)),
      breakdown: {
        totalIncome: income,
        totalExpenses: expenses,
        profit: taxableProfit,
        vatCollectedEstimate: income * config.standardVatRate,
      },
    };
  }

  /**
   * 🛡️ AUDIT-READY TAX REPORT
   * Aggregates all deductible transactions for CPA review.
   */
  static async generateRegionalTaxReport(
    userId: string
  ): Promise<TaxReportSummary> {
    const { data: user } = await supabase
      .from('profiles')
      .select('country')
      .eq('id', userId)
      .single();
    const config = REGIONAL_CONFIGS[user?.country || 'USA'];

    const { data: taxTxs } = await supabase
      .from('transactions')
      .select('*, documents(*)')
      .eq('user_id', userId)
      .eq('is_tax_deductible', true)
      .order('date', { ascending: false });

    const totalDeductible =
      taxTxs?.reduce((s, t) => s + Math.abs(t.amount), 0) || 0;

    // Categorize by NorthFinance Standard Tax Categories
    const breakdown: Record<string, number> = {};
    Object.values(TaxCategory).forEach((cat) => {
      breakdown[cat] = 0;
    });

    taxTxs?.forEach((t) => {
      const cat = t.tax_category || 'Other';
      breakdown[cat] = (breakdown[cat] || 0) + Math.abs(t.amount);
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    return {
      user_id: userId,
      generated_at: new Date().toISOString(),
      total_deductible_amount: totalDeductible,
      transaction_count: taxTxs?.length || 0,
      tax_categories_breakdown: breakdown,
      potential_savings: totalDeductible * (config?.corporateTaxRate || 0.21),
      evidence_files:
        taxTxs
          ?.flatMap((t) => t.documents?.map((d: any) => d.file_path) || [])
          .filter(Boolean) || [],
      transactions: taxTxs || [],
    };
  }

  /**
   * 🧾 VAT/MOMS ESTIMATOR
   * Specifically for EU/UK/Nordic businesses to track set-off.
   */
  static calculateVatSetOff(
    transactions: Transaction[],
    rate: number = 0.25
  ): number {
    return transactions
      .filter((t) => t.type === 'expense' && t.is_tax_deductible)
      .reduce((s, t) => s + Math.abs(t.amount) * (rate / (1 + rate)), 0);
  }
}
