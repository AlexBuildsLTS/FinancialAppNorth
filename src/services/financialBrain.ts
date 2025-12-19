import { supabase } from '../lib/supabase';
import { generateContent } from './geminiService';
import type { Transaction, Budget } from '../types';
import dayjs from 'dayjs';

export const FinancialBrain = {
  /**
   * 🧠 Entry point for "Ask AI CFO"
   */
  async askFinancialAdvisor(userId: string, userQuestion: string): Promise<string> {
    try {
      if (!userId) return "Missing user identification.";
      
      const question = userQuestion?.trim() || "Give me a general overview of my finances.";
      const context = await this.getFinancialContext(userId);
      
      // Calculate Runway
      const runway = this.predictRunway(context.balance, context.rawTransactions);
      
      const prompt = `
        You are NorthFinance CFO AI. Act as a high-end financial advisor.
        
        CONTEXT DATA:
        - Total Balance: $${context.balance.toFixed(2)}
        - Net Income (Monthly): $${context.netIncome.toFixed(2)}
        - Estimated Burn: $${runway.monthlyBurn.toFixed(2)}
        - Estimated Runway: ${runway.monthsLeft.toFixed(1)} months
        - Status: ${runway.status}

        RECENT TRANSACTIONS:
        ${context.recent_spend || "No transactions recorded yet."}

        BUDGET STATUS:
        ${context.budget_health || "No budgets set up."}

        USER'S QUESTION:
        "${question}"

        GOAL: Provide a professional, concise, and data-driven response. If they ask about buying something, reference their runway.
      `.trim();

      return await generateContent(prompt, userId);
    } catch (e) {
      console.error("[Brain] Failure:", e);
      return "I can't access your financial data right now.";
    }
  },

  async getFinancialContext(userId: string) {
    const [txRes, budgetRes, balanceRes] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(15),
      supabase.from('budgets').select('*, categories(name)').eq('user_id', userId),
      supabase.from('accounts').select('balance').eq('user_id', userId).maybeSingle()
    ]);

    const transactions = (txRes.data as Transaction[]) || [];
    const currentBalance = balanceRes.data?.balance || 0;

    const income = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

    return {
      balance: currentBalance,
      netIncome: income - expense,
      rawTransactions: transactions,
      recent_spend: transactions.map(t => `- ${dayjs(t.date).format('MMM D')}: ${t.description} ($${t.amount})`).join('\n'),
      budget_health: (budgetRes.data || []).map((b: any) => `${b.categories?.name}: $${b.amount}`).join(', ')
    };
  },

  predictRunway(balance: number, transactions: Transaction[]) {
    const expenses = transactions.filter(t => t.amount < 0);
    if (!expenses.length) return { status: 'STABLE', monthsLeft: 99, monthlyBurn: 0 };
    
    const totalExp = expenses.reduce((s, t) => s + Math.abs(t.amount), 0);
    const monthlyBurn = totalExp / 2; // Average over available data
    const monthsLeft = monthlyBurn > 0 ? (balance / monthlyBurn) : 99;

    return { 
      status: monthsLeft < 2 ? 'CRITICAL' : monthsLeft < 4 ? 'WARNING' : 'HEALTHY',
      monthsLeft, 
      monthlyBurn 
    };
  }
};