import { supabase } from '../lib/supabase';
import { ChatbotMessage, ParsedVoiceCommand, UserRoleEnum } from '../types';
import { generateContent } from './geminiService';
import { FinancialBrain } from './financialBrain';
import { dataService } from './dataService';
import { BudgetService } from './budgetService';

export const aiService = {
  /**
   * 🤖 Enhanced AI Message Processing
   */
  async sendMessage(text: string, userId: string, image?: string): Promise<string> {
    try {
      // 1. Log User Message
      await this.logMessage(userId, 'user', text);
      
      let response: string;
      
      // 2. Intelligent Routing
      if (this.isFinancialQuery(text) && !image) {
        // High-context financial analysis using RAG (FinancialBrain)
        response = await FinancialBrain.askAdvisor(userId, text);
      } else if (image) {
        // Image-based analysis (Receipts/Documents)
        response = await this.handleImageQuery(text, userId, image);
      } else {
        // General conversational/assistant logic
        response = await generateContent(text, userId);
      }
      
      // 3. Log AI Response
      await this.logMessage(userId, 'ai', response);
      
      // 4. Proactive Insights (Background)
      if (this.isFinancialQuery(text)) {
        this.generateProactiveInsights(userId).catch(e => console.warn('Insight failed:', e));
      }
      
      return response;
    } catch (error: any) {
      const fallback = this.generateErrorFallback(error);
      await this.logMessage(userId, 'ai', fallback);
      return fallback;
    }
  },

  /**
   * 🎯 Determine if the query needs access to the user's ledger
   */
  isFinancialQuery(text: string): boolean {
    const financialKeywords = [
      'budget', 'spend', 'expense', 'income', 'save', 'invest', 
      'cash flow', 'forecast', 'predict', 'subscription', 'bill',
      'tax', 'deductible', 'risk', 'emergency', 'loan', 'debt',
      'balance', 'transaction', 'category', 'money', 'afford'
    ];
    
    const lowerText = text.toLowerCase();
    return financialKeywords.some(keyword => lowerText.includes(keyword));
  },

  /**
   * 🖼️ Handle Image-Based Queries
   */
  async handleImageQuery(text: string, userId: string, image: string): Promise<string> {
    try {
      const enhancedPrompt = `
        DOCUMENT ANALYSIS REQUEST: "${text || 'Please analyze this document'}"
        
        Task:
        1. Classify the document (Receipt, Invoice, Statement, etc.)
        2. Extract: Date, Total Amount, Merchant/Vendor, and Currency.
        3. Suggest a financial category.
        4. Identify potential tax-deductible items.
      `;
      
      return await generateContent(enhancedPrompt, userId, image);
    } catch (error) {
      console.error('[aiService] Image query failed:', error);
      return "I couldn't process that image. Please ensure the text is clear and well-lit.";
    }
  },
  /**
   * 🎤 Process Voice Commands
   */
  async processVoiceCommand(command: ParsedVoiceCommand, userId: string): Promise<string> {
    try {
      await this.logMessage(userId, 'user', `Voice Command: ${command.commandType} - ${JSON.stringify(command.parameters)}`);

      switch (command.commandType) {
        case 'add_expense':
          return await dataService.createTransaction({
            amount: -Math.abs(command.parameters.amount || 0),
            description: command.parameters.description || 'Voice Command Expense',
            category: command.parameters.category || 'Uncategorized',
            date: command.parameters.date || new Date().toISOString().split('T')[0],
            type: 'expense'
          }, userId);
        case 'get_balance':
          const summary = await dataService.getFinancialSummary(userId);
          return `Your current balance is $${summary.balance.toFixed(2)} with monthly income of $${summary.income.toFixed(2)} and expenses of $${summary.expense.toFixed(2)}.`;
        case 'get_spending_summary':
          const spendingSummary = await dataService.getFinancialSummary(userId);
          const budgets = await dataService.getBudgets(userId);
          const budgetStatus = budgets.map(b => `${b.category_name}: $${b.spent.toFixed(2)} spent${b.amount ? ` of $${b.amount.toFixed(2)} budget` : ''}`).join(', ');
          return `Spending Summary: You've spent $${spendingSummary.expense.toFixed(2)} this month. Budget status: ${budgetStatus || 'No budgets set'}.`;
        case 'set_budget':
          return await BudgetService.createBudget(
            userId, 
            command.parameters.category || 'Uncategorized', 
            command.parameters.amount || 0,
            command.parameters.period || 'monthly'
          );
        case 'general_query':
          return await generateContent(command.parameters.query, userId);
        default:
          return "I'm not sure how to handle that voice command yet.";
      }
    } catch (error) {
      console.error('[aiService] Voice command processing failed:', error);
      return this.generateErrorFallback(error);
    }
  },
  /**
   * 💡 Generate Proactive Financial Insights
   */
  async generateProactiveInsights(userId: string): Promise<void> {
    try {
      const insights = await FinancialBrain.generateProactiveInsights(userId);
      if (insights && insights.length > 0) {
        const insightsText = `💡 Quick Insight: ${insights[0]}`;
        await this.logMessage(userId, 'ai', insightsText, { type: 'proactive' });
      }
    } catch (error) {
      console.warn('[aiService] Proactive insights failed:', error);
    }
  },

  /**
   * 📝 Log Interaction to Supabase
   */
  async logMessage(userId: string, sender: 'user' | 'ai' | 'system', text: string, metadata?: any) {
    try {
      return await supabase.from('chatbot_messages').insert([{ 
        user_id: userId, 
        sender, 
        text,
        metadata: metadata || null,
        created_at: new Date().toISOString() 
      }]);
    } catch (error) {
      console.error('[aiService] Logging failed:', error);
    }
  },

  /**
   * 🛡️ Contextual Error Fallbacks
   */
  generateErrorFallback(error: any): string {
    const msg = error.message?.toLowerCase() || "";
    if (msg.includes('rate limit')) return "I'm thinking a bit too fast! Please wait a moment.";
    if (msg.includes('connection')) return "I'm having trouble connecting to the NorthFinance servers.";
    return "I'm experiencing a temporary brain fog. Could you try asking that again?";
  }
};
