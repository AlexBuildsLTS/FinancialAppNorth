import { supabase } from '../lib/supabase';
// @ts-ignore: Type declarations for geminiService may be missing during lint or build.
import { generateContent } from './geminiService';
import type { Transaction, Budget } from '../types';
import dayjs from 'dayjs';

// Local interface for budget processing (maps DB schema to brain's expected format)
interface BudgetForBrain {
  id: string;
  user_id: string;
  category: string;
  limit_amount: number;
  spent_amount: number;
  period: string;
}

// --- CONFIGURATION (Defined locally to avoid import errors) ---
export const TAX_JURISDICTIONS = {
  'US_CA': { rate: 0.29, name: 'California, USA' },
  'US_TX': { rate: 0.21, name: 'Texas, USA' },
  'SE': { rate: 0.32, name: 'Sweden' },
  'UK': { rate: 0.20, name: 'United Kingdom' },
};

export const ENTITY_TYPES = {
  'INDIVIDUAL': { deduction_factor: 0.0 },
  'LLC': { deduction_factor: 0.15 },
  'CORP': { deduction_factor: 0.25 },
};

export const FinancialBrain = {

  /**
   * 🧠 ACTIVE INTELLIGENCE ENTRY POINT
   */
  async askFinancialAdvisor(userId: string, userQuestion: string): Promise<string> {
    try {
      // Validate inputs
      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        throw new Error('Valid userId is required');
      }
      
      if (!userQuestion || typeof userQuestion !== 'string' || userQuestion.trim().length === 0) {
        // Default question if none provided
        userQuestion = "Provide a brief financial health assessment and any key recommendations.";
      }

      const context = await this.getFinancialContext(userId);
      const runway = this.predictRunway(context.balance, context.rawTransactions);
      
      // Default to Sweden/Individual for now
      const tax = this.calculateRealTaxLiability(context.netIncome, 'SE', 'INDIVIDUAL');

      // Ensure all numeric values are valid before formatting
      const balance = isNaN(context.balance) ? 0 : context.balance;
      const monthlyBurn = isNaN(runway.monthlyBurn) ? 0 : runway.monthlyBurn;
      const monthsLeft = isNaN(runway.monthsLeft) ? 0 : runway.monthsLeft;
      const estimatedTax = isNaN(tax.estimatedTax) ? 0 : tax.estimatedTax;

      const prompt = `
        You are NorthFinance, a strategic CFO AI.
        
        --- LIVE FINANCIAL STATUS ---
        💰 Balance: $${balance.toFixed(2)}
        📉 Monthly Burn: $${monthlyBurn.toFixed(2)}
        ⚠️ Runway: ${monthsLeft.toFixed(1)} months (${runway.status || 'unknown'})
        🏛️ Tax Liability (Est): $${estimatedTax.toFixed(2)}
        
        --- RECENT SPENDING ---
        ${context.recent_spend || 'No recent spending data available.'}

        --- BUDGET HEALTH ---
        ${context.budget_health || 'No budget data available.'}

        --- USER QUESTION ---
        "${userQuestion.trim()}"

        INSTRUCTIONS:
        Answer directly. If asked about affordability, reference the Runway Status.
      `.trim();

      if (!prompt || prompt.length === 0) {
        throw new Error('Generated prompt is empty');
      }
      
      // Additional validation - ensure prompt has meaningful content
      if (prompt.length < 50) {
        console.warn('Generated prompt is suspiciously short:', prompt.substring(0, 100));
      }

      return await generateContent(prompt, userId);

    } catch (error) {
      console.error("Brain Failure:", error);
      return "I'm unable to connect to your financial core right now.";
    }
  },

  /**
   * 🏗️ DATA FETCHING LAYER
   */
  async getFinancialContext(userId: string): Promise<{
    balance: number;
    netIncome: number;
    rawTransactions: Transaction[];
    recent_spend: string;
    budget_health: string;
  }> {
    const [txRes, budgetRes, balanceRes] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(20),
      supabase.from('budgets').select('*').eq('user_id', userId),
      supabase.from('accounts').select('balance').eq('user_id', userId).maybeSingle()
    ]);

    // Map DB schema to brain's expected format
    const rawBudgets = (budgetRes.data || []) as Budget[];
    
    // Fetch category names for budgets
    const categoryIds = [...new Set(rawBudgets.map(b => b.category_id).filter(Boolean))];
    const { data: categories } = categoryIds.length > 0 ? await supabase
      .from('categories')
      .select('id, name')
      .in('id', categoryIds) : { data: null };
    
    const categoryMap = new Map((categories || []).map((c: any) => [c.id, c.name]));
    
    const budgets: BudgetForBrain[] = rawBudgets.map((b: Budget) => ({
      id: b.id,
      user_id: b.user_id,
      category: categoryMap.get(b.category_id) || b.category_id || 'Uncategorized',
      limit_amount: Number(b.amount) || 0,
      spent_amount: 0, // Will be calculated if needed
      period: b.period || 'monthly'
    }));

    const transactions = (txRes.data as Transaction[]) || [];
    const currentBalance = balanceRes.data?.balance || 0;

    // Logic: Net Income
    const income = transactions.filter(t => (t.amount || 0) > 0).reduce((sum, t) => sum + (t.amount || 0), 0);
    const expense = transactions.filter(t => (t.amount || 0) < 0).reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

    return {
      balance: currentBalance,
      netIncome: Math.max(0, income - expense),
      rawTransactions: transactions,
      recent_spend: transactions.map(t => 
        `${dayjs(t.date).format('MM/DD')}: ${t.merchant || t.merchant_name || t.description || 'Unknown'} ($${Math.abs(t.amount || 0)})`
      ).join('\n'),
      budget_health: budgets.map(b => 
        `${b.category}: ${Math.round((b.spent_amount / (b.limit_amount || 1)) * 100)}%`
      ).join('\n')
    };
  },

  /**
   * 📊 TITAN 1: TAX ALGORITHM
   */
  calculateRealTaxLiability(netIncome: number, location: keyof typeof TAX_JURISDICTIONS, entity: keyof typeof ENTITY_TYPES) {
    const rate = TAX_JURISDICTIONS[location].rate;
    const deduction = ENTITY_TYPES[entity].deduction_factor;
    const baseTax = netIncome * rate;
    const savings = baseTax * deduction;
    
    return {
      estimatedTax: Math.max(0, baseTax - savings),
      savingsFromStructure: savings,
      effectiveRate: rate * (1 - deduction) * 100,
      jurisdictionName: TAX_JURISDICTIONS[location].name
    };
  },

  /**
   * 🔮 TITAN 2: RUNWAY ALGORITHM
   */
  predictRunway(balance: number, transactions: Transaction[]) {
    const threeMonthsAgo = dayjs().subtract(3, 'month');
    const recentExpenses = transactions.filter(t => 
      (t.amount || 0) < 0 && dayjs(t.date).isAfter(threeMonthsAgo)
    );

    let monthlyBurn = 0;
    if (recentExpenses.length > 0) {
      const totalBurn = recentExpenses.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
      monthlyBurn = totalBurn / 3;
    }

    if (monthlyBurn === 0) return { status: 'STABLE', monthsLeft: 99, monthlyBurn: 0, message: "No recent burn" };

    const months = balance / monthlyBurn;
    let status = 'HEALTHY';
    if (months < 1) status = 'CRITICAL';
    else if (months < 3) status = 'WARNING';

    return { status, monthsLeft: months, monthlyBurn, message: "Based on 3-month avg" };
  }
};