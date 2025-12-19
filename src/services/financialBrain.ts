import { supabase } from '../lib/supabase';
import { generateContent } from './geminiService';
import { Tables, Transaction, BudgetWithSpent, FinancialSummary, DetectedSubscription, SafeSpendMetrics, UserRoleEnum } from '../types';
import dayjs from 'dayjs';
import { BudgetService } from './budgetService';
import { dataService } from './dataService';

interface FinancialContext {
  summary: FinancialSummary;
  recentTransactions: Transaction[];
  budgets: BudgetWithSpent[];
  subscriptions: DetectedSubscription[];
  safeSpend: SafeSpendMetrics;
  healthScore: number;
  spendingForecast: { predictedAmount: number; trend: 'up' | 'down' | 'stable' };
}

interface AnalysisResult {
  insight: string;
  confidence: number;
  recommendations: string[];
  riskFactors: string[];
  opportunities: string[];
}

export const FinancialBrain = {
  /**
   * 🧠 CENTRAL INTELLIGENCE HUB: Active CFO Analysis
   * Performs comprehensive RAG across all financial data sources
   */
  async askAdvisor(userId: string, question: string): Promise<string> {
    try {
      // Build comprehensive financial context
      const context = await this.buildFinancialContext(userId);
      
      // Analyze question intent and route to specialized analysis
      const analysisType = this.classifyQuestion(question);
      
      // Generate contextual prompt with rich data
      const prompt = await this.buildContextualPrompt(question, context, analysisType);
      
      // Get AI response
      const response = await generateContent(prompt, userId);
      
      // Log interaction for learning
      await this.logInteraction(userId, question, response, analysisType);
      
      return response;
    } catch (error: any) {
      console.error('[FinancialBrain] Analysis failed:', error);
      return this.generateFallbackResponse(error);
    }
  },

  /**
   * 📊 Build Comprehensive Financial Context
   * Aggregates data from all sources for RAG analysis
   */
  async buildFinancialContext(userId: string): Promise<FinancialContext> {
    const thirtyDaysAgo = dayjs().subtract(30, 'day').format('YYYY-MM-DD');
    const ninetyDaysAgo = dayjs().subtract(90, 'day').format('YYYY-MM-DD');

    try {
      // Parallel data fetching for performance
      const [
        summary,
        recentTxs,
        budgets,
        subscriptions,
        forecast,
        healthScore
      ] = await Promise.all([
        dataService.getFinancialSummary(userId),
        this.getRecentTransactions(userId, 20),
        BudgetService.getBudgets(userId),
        dataService.getSubscriptions(userId),
        dataService.getSpendingForecast(userId),
        dataService.getFinancialHealthScore(userId)
      ]);

      // Calculate safe-to-spend metrics
      const safeSpend = await this.calculateSafeSpend(userId, summary, budgets);

      return {
        summary,
        recentTransactions: recentTxs,
        budgets,
        subscriptions,
        safeSpend,
        healthScore,
        spendingForecast: forecast
      };
    } catch (error: any) {
      console.error('[FinancialBrain] Context build failed:', error);
      // Return minimal context for graceful degradation
      return {
        summary: { balance: 0, income: 0, expense: 0, savings_rate: 0, trend: [] },
        recentTransactions: [],
        budgets: [],
        subscriptions: [],
        safeSpend: { safeToSpend: 0, monthlyIncome: 0, monthlyExpenses: 0, emergencyFund: 0, daysUntilPayday: 0 },
        healthScore: 0,
        spendingForecast: { predictedAmount: 0, trend: 'stable' }
      };
    }
  },

  /**
   * 🎯 Question Classification for Intelligent Routing
   */
  classifyQuestion(question: string): string {
    const lowerQ = question.toLowerCase();
    
    if (lowerQ.includes('budget') || lowerQ.includes('spend') || lowerQ.includes('safe')) {
      return 'budget_analysis';
    } else if (lowerQ.includes('invest') || lowerQ.includes('save') || lowerQ.includes('future')) {
      return 'investment_planning';
    } else if (lowerQ.includes('subscription') || lowerQ.includes('recurring')) {
      return 'subscription_analysis';
    } else if (lowerQ.includes('tax') || lowerQ.includes('deductible')) {
      return 'tax_optimization';
    } else if (lowerQ.includes('risk') || lowerQ.includes('emergency') || lowerQ.includes('warning')) {
      return 'risk_assessment';
    } else if (lowerQ.includes('cash flow') || lowerQ.includes('forecast') || lowerQ.includes('predict')) {
      return 'cash_flow_analysis';
    } else if (lowerQ.includes('health') || lowerQ.includes('score') || lowerQ.includes('overall')) {
      return 'financial_health';
    } else {
      return 'general_advisory';
    }
  },

  /**
   * 📝 Build Contextual Prompt with Rich Financial Data
   */
  async buildContextualPrompt(question: string, context: FinancialContext, analysisType: string): Promise<string> {
    const { summary, recentTransactions, budgets, subscriptions, safeSpend, healthScore, spendingForecast } = context;
    
    // Format recent transactions for analysis
    const transactionSummary = recentTransactions.slice(0, 10).map(tx => 
      `${dayjs(tx.date).format('MMM D')}: ${tx.description || 'Unknown'} ($${Math.abs(tx.amount).toFixed(2)} ${tx.amount >= 0 ? 'income' : 'expense'})`
    ).join('\n');

    // Format budget status
    const budgetStatus = budgets.map(b => 
      `${b.category_name}: $${b.spent.toFixed(2)}/$${b.amount.toFixed(2)} (${b.percentage.toFixed(1)}%)`
    ).join('\n');

    // Format subscription analysis
    const subscriptionAnalysis = subscriptions.slice(0, 5).map(sub => 
      `${sub.merchant}: $${sub.amount.toFixed(2)}/month (${sub.status})`
    ).join('\n');

    const basePrompt = `
NORTHFINANCE CFO ANALYSIS SYSTEM

USER PROFILE:
- Financial Health Score: ${healthScore}/100
- Safe-to-Spend: $${safeSpend.safeToSpend.toFixed(2)}
- Days Until Payday: ${safeSpend.daysUntilPayday}

FINANCIAL SNAPSHOT:
- Current Balance: $${summary.balance.toFixed(2)}
- Monthly Income: $${summary.income.toFixed(2)}
- Monthly Expenses: $${summary.expense.toFixed(2)}
- Savings Rate: ${((summary.savings_rate || 0) * 100).toFixed(1)}%
- Spending Trend: ${spendingForecast.trend} (predicted: $${spendingForecast.predictedAmount.toFixed(2)})

RECENT TRANSACTIONS (Last 10):
${transactionSummary || "No recent transactions"}

BUDGET STATUS:
${budgetStatus || "No budgets set"}

SUBSCRIPTION ANALYSIS:
${subscriptionAnalysis || "No subscriptions detected"}

QUESTION: "${question}"

ANALYSIS TYPE: ${analysisType}

INSTRUCTIONS:
1. Provide specific, data-driven insights using the financial context above
2. Reference actual numbers and trends from the data
3. Identify risk factors and opportunities
4. Give actionable recommendations
5. Maintain professional CFO advisory tone
6. If data is insufficient, acknowledge limitations
7. Focus on predictive and proactive insights, not just historical reporting

RESPONSE FORMAT:
- Brief executive summary (1-2 sentences)
- Detailed analysis with data references
- 2-3 specific, actionable recommendations
- Risk indicators (if any)
- Opportunity areas (if any)
    `.trim();

    return basePrompt;
  },

  /**
   * 💰 Calculate Safe-to-Spend Metrics
   */
  async calculateSafeSpend(userId: string, summary: FinancialSummary, budgets: BudgetWithSpent[]): Promise<SafeSpendMetrics> {
    const currentDay = dayjs().date();
    const daysInMonth = dayjs().daysInMonth();
    const daysRemaining = daysInMonth - currentDay;
    
    const monthlyIncome = summary.income;
    const monthlyExpenses = summary.expense;
    const budgetedExpenses = budgets.reduce((sum, b) => sum + b.amount, 0);
    const emergencyFund = summary.balance * 0.3; // Assume 30% of balance is emergency fund
    
    // Calculate safe-to-spend for remainder of month
    const dailyBudget = (monthlyIncome - budgetedExpenses) / daysInMonth;
    const safeToSpend = Math.max(0, dailyBudget * daysRemaining);
    
    return {
      safeToSpend,
      monthlyIncome,
      monthlyExpenses,
      emergencyFund,
      daysUntilPayday: daysRemaining
    };
  },

  /**
   * 📈 Get Recent Transactions with Category Details
   */
  async getRecentTransactions(userId: string, limit: number = 20): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, categories(name, icon, color)')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((tx: any) => ({
        ...tx,
        category: tx.categories ? tx.categories.name : 'Uncategorized',
        category_icon: tx.categories?.icon,
        category_color: tx.categories?.color
      }));
    } catch (error) {
      console.error('[FinancialBrain] Failed to fetch transactions:', error);
      return [];
    }
  },

  /**
   * 🔍 Perform Deep Financial Analysis
   */
  async performDeepAnalysis(userId: string, analysisType: string): Promise<AnalysisResult> {
    const context = await this.buildFinancialContext(userId);
    
    // This is where more sophisticated analysis logic would go
    // For now, we'll use the AI to perform the analysis
    const prompt = `
    Perform a deep ${analysisType} analysis based on this financial data:
    
    Balance: $${context.summary.balance.toFixed(2)}
    Income: $${context.summary.income.toFixed(2)}
    Expenses: $${context.summary.expense.toFixed(2)}
    Health Score: ${context.healthScore}/100
    Budgets: ${context.budgets.length} active
    Subscriptions: ${context.subscriptions.length} detected
    
    Provide:
    1. Key insight summary
    2. Risk assessment
    3. Opportunity identification
    4. Confidence level (0-100)
    5. 3 actionable recommendations
    `;

    const response = await generateContent(prompt, userId);
    
    // Parse response into structured format (this would need more sophisticated parsing)
    return {
      insight: response,
      confidence: 85, // Placeholder
      recommendations: [], // Would parse from response
      riskFactors: [],
      opportunities: []
    };
  },

  /**
   * 📊 Generate Proactive Insights
   */
  async generateProactiveInsights(userId: string): Promise<string[]> {
    const context = await this.buildFinancialContext(userId);
    const insights: string[] = [];

    // Budget alerts
    context.budgets.forEach(budget => {
      if (budget.percentage > 80) {
        insights.push(`⚠️ Budget Alert: ${budget.category_name} is ${budget.percentage.toFixed(1)}% used ($${budget.spent.toFixed(2)}/$${budget.amount.toFixed(2)})`);
      }
    });

    // Subscription anomalies
    context.subscriptions.forEach(sub => {
      if (sub.status === 'price_hike') {
        insights.push(`📈 Price Increase Detected: ${sub.merchant} subscription increased to $${sub.amount.toFixed(2)}/month`);
      }
    });

    // Cash flow warnings
    if (context.safeSpend.safeToSpend < 100) {
      insights.push(`🚨 Low Safe-to-Spend: Only $${context.safeSpend.safeToSpend.toFixed(2)} available for next ${context.safeSpend.daysUntilPayday} days`);
    }

    // Health score improvements
    if (context.healthScore < 50) {
      insights.push(`💡 Financial Health: Score ${context.healthScore}/100 needs improvement. Focus on increasing savings rate.`);
    }

    return insights;
  },

  /**
   * 📝 Log Interaction for Learning
   */
  async logInteraction(userId: string, question: string, response: string, analysisType: string): Promise<void> {
    try {
      await supabase.from('ai_interactions').insert({
        user_id: userId,
        question,
        response,
        analysis_type: analysisType,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.warn('[FinancialBrain] Failed to log interaction:', error);
    }
  },

  /**
   * 🛡️ Generate Fallback Response
   */
  generateFallbackResponse(error: any): string {
    console.error('[FinancialBrain] Error details:', error);

    // For debugging, return the actual error message
    return `Financial Brain Error: ${error.message || 'Unknown error'}. Please check your connection or API keys.`;
  },

  /**
   * 🔮 Predictive Cash Flow Analysis
   */
  async predictCashFlow(userId: string, days: number = 30): Promise<{ dates: string[]; inflows: number[]; outflows: number[]; netFlow: number[] }> {
    try {
      const sixtyDaysAgo = dayjs().subtract(60, 'day').format('YYYY-MM-DD');
      
      const { data: historicalData } = await supabase
        .from('transactions')
        .select('amount, date')
        .eq('user_id', userId)
        .gte('date', sixtyDaysAgo)
        .order('date', { ascending: true });

      if (!historicalData || historicalData.length === 0) {
        return { dates: [], inflows: [], outflows: [], netFlow: [] };
      }

      // Simple moving average prediction
      const dailyAverages = this.calculateDailyAverages(historicalData);
      const predictions = this.generatePredictions(dailyAverages, days);

      return predictions;
    } catch (error) {
      console.error('[FinancialBrain] Cash flow prediction failed:', error);
      return { dates: [], inflows: [], outflows: [], netFlow: [] };
    }
  },

  /**
   * 📊 Calculate Daily Averages for Prediction
   */
  calculateDailyAverages(transactions: any[]): { inflows: number; outflows: number } {
    const dailyData: Record<string, { inflow: number; outflow: number }> = {};
    
    transactions.forEach(tx => {
      const date = tx.date.split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { inflow: 0, outflow: 0 };
      }
      
      if (tx.amount > 0) {
        dailyData[date].inflow += tx.amount;
      } else {
        dailyData[date].outflow += Math.abs(tx.amount);
      }
    });

    const totals = Object.values(dailyData).reduce(
      (acc, day) => ({
        inflow: acc.inflow + day.inflow,
        outflow: acc.outflow + day.outflow
      }),
      { inflow: 0, outflow: 0 }
    );

    const days = Object.keys(dailyData).length;
    return {
      inflows: days > 0 ? totals.inflow / days :0,
      outflows: days > 0 ? totals.outflow / days : 0
    };
  },

  /**
   * 🔮 Generate Future Predictions
   */
  generatePredictions(averages: { inflows: number; outflows: number }, days: number) {
    const dates: string[] = [];
    const inflows: number[] = [];
    const outflows: number[] = [];
    const netFlow: number[] = [];

    for (let i = 0; i < days; i++) {
      const date = dayjs().add(i, 'day').format('YYYY-MM-DD');
      const noiseFactor = 0.8 + Math.random() * 0.4; // Add some realistic variation
      
      dates.push(date);
      inflows.push(averages.inflows * noiseFactor);
      outflows.push(averages.outflows * noiseFactor);
      netFlow.push((averages.inflows * noiseFactor) - (averages.outflows * noiseFactor));
    }

    return { dates, inflows, outflows, netFlow };
  }
};
