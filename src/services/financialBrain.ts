/**
 * src/services/financialBrain.ts
 * ROLE: The Strategic Intelligence Dispatcher (Titan-Engine).
 * PURPOSE: Orchestrates Gemini AI, Deterministic Math, and Vision Context
 * to act as an Autonomous CFO.
 */

import { supabase } from '../lib/supabase';
import { generateContent } from './geminiService';
import {
  Transaction,
  BudgetWithSpent,
  FinancialSummary,
  DetectedSubscription,
  SafeSpendMetrics,
  HealthMetrics,
  DocumentItem,
} from '../types';
import dayjs from 'dayjs';
import { BudgetService } from './budgetService';
import { dataService } from './dataService';

// Constants
const Z_SCORE_THRESHOLD = 2.5;
const SAFETY_BUFFER_PERCENT = 0.15;
const MIN_TRANSACTIONS_FOR_ANOMALY = 10;
const SAVINGS_RATE_WEIGHT = 0.4;
const BUDGET_ADHERENCE_WEIGHT = 0.6;
const CHAT_HISTORY_LIMIT = 3;
const RECENT_DOCUMENTS_LIMIT = 5;
const RECENT_TRANSACTIONS_DAYS = 30;

// Enum for intent classification
enum Intent {
  TAX_STRATEGY = 'tax_strategy',
  AUDIT = 'audit',
  AFFORDABILITY = 'affordability',
  VISION_QUERY = 'vision_query',
  GENERAL = 'general',
}

// Keywords for intent classification
const INTENT_KEYWORDS: Record<string, Intent> = {
  tax: Intent.TAX_STRATEGY,
  deduct: Intent.TAX_STRATEGY,
  anomaly: Intent.AUDIT,
  wrong: Intent.AUDIT,
  weird: Intent.AUDIT,
  'can i afford': Intent.AFFORDABILITY,
  buy: Intent.AFFORDABILITY,
  scan: Intent.VISION_QUERY,
  receipt: Intent.VISION_QUERY,
};

// Interface for AI interaction logs
interface AIInteraction {
  user_id: string;
  question: string;
  response: string;
  analysis_type: string;
  created_at: string;
}

interface EnhancedFinancialContext {
  summary: FinancialSummary;
  recentTransactions: Transaction[];
  recentScans: DocumentItem[]; // AAA+ Addition: Vision Awareness
  budgets: BudgetWithSpent[];
  subscriptions: DetectedSubscription[];
  safeSpend: SafeSpendMetrics;
  healthMetrics: HealthMetrics;
  anomalies: Transaction[];
  forecast: { predictedAmount: number; trend: string };
  chatHistory: AIInteraction[]; // AAA+ Addition: Short-term memory
}

export class FinancialBrain {
  /**
   * 🤖 AUTONOMOUS CFO ADVISOR
   * Uses Intent-Classification to hydrate context and provide strategic reasoning.
   */
  static async askAdvisor(userId: string, question: string): Promise<string> {
    if (!userId || !question) {
      throw new Error('User ID and question are required');
    }

    try {
      // 1. Identify Intent (Minimal context call)
      const intent = this.classifyIntent(question);

      // 2. Hydrate Context based on Intent (Saves tokens/latency)
      const context = await this.buildTargetedContext(userId, intent);

      // 3. Build the CFO Executive Prompt
      const prompt = this.buildExecutivePrompt(question, context, intent);

      // 4. Call specialized Edge Function or Gemini
      // If it's a deep financial audit, use the specialized 'financial-advisor' function
      const response =
        intent === Intent.AUDIT
          ? (
              await supabase.functions.invoke('financial-advisor', {
                body: { question, context },
              })
            ).data?.response || 'Audit service unavailable'
          : await generateContent(prompt, userId);

      await this.logInteraction(userId, question, response, intent);
      return response;
    } catch (error: any) {
      console.error('[FinancialBrain] Tactical failure:', error);
      // Provide user-friendly error message
      return "I've encountered a data-lake synchronization issue. Please try your request again.";
    }
  }

  // Private helper methods for fetching data
  private static async fetchSummary(userId: string): Promise<FinancialSummary> {
    return await dataService.getFinancialSummary(userId);
  }

  private static async fetchTransactions(userId: string): Promise<Transaction[]> {
    return await dataService.getTransactions(userId, RECENT_TRANSACTIONS_DAYS);
  }

  private static async fetchBudgets(userId: string): Promise<BudgetWithSpent[]> {
    return await BudgetService.getBudgets(userId);
  }

  private static async fetchSubscriptions(userId: string): Promise<DetectedSubscription[]> {
    return await dataService.getSubscriptions(userId);
  }

  private static async fetchForecast(userId: string): Promise<{ predictedAmount: number; trend: string }> {
    return await dataService.getSpendingForecast(userId);
  }

  private static async fetchDocuments(userId: string): Promise<DocumentItem[]> {
    const documents = await dataService.getDocuments(userId);
    return documents.slice(0, RECENT_DOCUMENTS_LIMIT);
  }

  private static async fetchChatHistory(userId: string): Promise<AIInteraction[]> {
    const { data, error } = await supabase
      .from('ai_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(CHAT_HISTORY_LIMIT);

    if (error) {
      console.warn('[FinancialBrain] Failed to fetch chat history:', error);
      return [];
    }

    return data || [];
  }

  /**
   * 🎯 TARGETED CONTEXT BUILDING
   * Parallel execution with Vision (OCR) awareness.
   */
  private static async buildTargetedContext(
    userId: string,
    intent: Intent
  ): Promise<EnhancedFinancialContext> {
    const [
      summary,
      transactions,
      budgets,
      subscriptions,
      forecast,
      healthMetrics,
      scans,
      history,
    ] = await Promise.all([
      this.fetchSummary(userId),
      this.fetchTransactions(userId),
      this.fetchBudgets(userId),
      this.fetchSubscriptions(userId),
      this.fetchForecast(userId),
      this.calculateHealthMetrics(userId),
      this.fetchDocuments(userId),
      this.fetchChatHistory(userId),
    ]);

    return {
      summary,
      recentTransactions: transactions,
      recentScans: scans,
      budgets,
      subscriptions,
      safeSpend: this.calculateDeterministicSafeSpend(summary, budgets),
      healthMetrics,
      anomalies: this.detectAnomalies(transactions),
      forecast,
      chatHistory: history,
    };
  }

  /**
   * 🔍 Z-SCORE + MERCHANT TREND DETECTION
   * Hard math to catch what Generative AI might miss.
   */
  private static detectAnomalies(transactions: Transaction[]): Transaction[] {
    if (transactions.length < MIN_TRANSACTIONS_FOR_ANOMALY) {
      return []; // Not enough data for reliable anomaly detection
    }

    const amounts = transactions.map((t) => Math.abs(t.amount));

    if (amounts.length === 0) return [];

    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const stdDev = Math.sqrt(
      amounts.map((x) => Math.pow(x - avg, 2)).reduce((a, b) => a + b, 0) /
        amounts.length
    );

    if (stdDev === 0) return []; // No variance, no anomalies

    return transactions.filter((t) =>
      Math.abs(t.amount) > avg + stdDev * Z_SCORE_THRESHOLD
    );
  }

  private static calculateDeterministicSafeSpend(
    summary: FinancialSummary,
    budgets: BudgetWithSpent[]
  ): SafeSpendMetrics {
    const daysRemaining = Math.max(1, dayjs().daysInMonth() - dayjs().date());
    const commitments = budgets.reduce((acc, b) => acc + b.amount, 0);
    const safetyBuffer = summary.expense * SAFETY_BUFFER_PERCENT;

    const surplus = summary.income - commitments - safetyBuffer;
    const safeToSpend = Math.max(0, surplus / daysRemaining);

    return {
      safeToSpend,
      monthlyIncome: summary.income,
      monthlyExpenses: summary.expense,
      emergencyFund: summary.balance * 0.25, // Could extract as constant if needed
      daysUntilPayday: daysRemaining,
    };
  }

  private static classifyIntent(question: string): Intent {
    const low = question.toLowerCase();
    for (const [keyword, intent] of Object.entries(INTENT_KEYWORDS)) {
      if (low.includes(keyword)) return intent;
    }
    return Intent.GENERAL;
  }

  private static buildExecutivePrompt(
    question: string,
    context: EnhancedFinancialContext,
    intent: Intent
  ): string {
    const recentScanContext = context.recentScans
      .map((s) => `${s.file_name} (${s.status})`)
      .join(', ');

    return `
      SYSTEM: NorthFinance Executive CFO (Titan-Engine)
      CONTEXTUAL INTELLIGENCE:
      - Health: ${context.healthMetrics.score}/100 (${
      context.healthMetrics.status
    })
      - Liquidity: $${context.summary.balance.toFixed(
        2
      )} ($${context.safeSpend.safeToSpend.toFixed(2)} safe daily)
      - Anomalies: ${
        context.anomalies.length > 0
          ? context.anomalies.map((a) => a.description).join(', ')
          : 'None'
      }
      - Recent Vision Activity: ${recentScanContext || 'No recent scans'}
      - Intent: ${intent}

      USER QUESTION: "${question}"
      
      EXECUTIVE GUIDELINES:
      1. Reference specific numbers from the context.
      2. If intent is 'affordability', prioritize the 15% safety buffer.
      3. If intent is 'vision_query', reference the status of recent OCR scans.
      4. Avoid boilerplate; provide tactical, high-velocity advice.
    `.trim();
  }

  static async calculateHealthMetrics(userId: string): Promise<HealthMetrics> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      const summary = await dataService.getFinancialSummary(userId);
      const budgets = await BudgetService.getBudgets(userId);

      const savingsRate =
        summary.income > 0
          ? ((summary.income - summary.expense) / summary.income) * 100
          : 0;
      const budgetAdherence =
        budgets.length > 0
          ? (budgets.filter((b) => b.spent <= b.amount).length / budgets.length) *
            100
          : 100;

      const score = Math.min(
        100,
        Math.max(0, Math.floor(savingsRate * SAVINGS_RATE_WEIGHT + budgetAdherence * BUDGET_ADHERENCE_WEIGHT))
      );

      const status =
        score > 80
          ? 'Elite'
          : score > 60
          ? 'Healthy'
          : score > 40
          ? 'Stable'
          : 'Critical';

      return {
        score,
        status,
        recommendation: 'Syncing with AI for dynamic recommendation...', // Will be overridden by AI in UI
        safeToSpend: this.calculateDeterministicSafeSpend(summary, budgets)
          .safeToSpend,
      };
    } catch (error: any) {
      console.error('[FinancialBrain] Failed to calculate health metrics:', error);
      // Return default values on error
      return {
        score: 0,
        status: 'Critical',
        recommendation: 'Unable to calculate health metrics due to data issues.',
        safeToSpend: 0,
      };
    }
  }

  private static async logInteraction(
    userId: string,
    question: string,
    response: string,
    intent: Intent
  ) {
    try {
      await supabase.from('ai_interactions').insert({
        user_id: userId,
        question,
        response,
        analysis_type: intent,
      });
    } catch (error: any) {
      console.warn('[FinancialBrain] Failed to log interaction:', error);
      // Don't throw, as logging failure shouldn't break the main flow
    }
  }
}
