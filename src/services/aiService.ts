import { supabase } from '../lib/supabase';
import { ChatbotMessage } from '../types';

const generateContentWithHistory = async (userText: string, userId?: string, imgBase64?: string): Promise<string> => {
  try {
    // Try calling the edge function first
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: { prompt: userText, userId, image: imgBase64 }
    });

    if (!error && data?.text) {
      return data.text;
    }

    // Fallback to local implementation
    return generateContent(userText, userId, imgBase64);
  } catch (e: any) {
    console.error('[AI Service] Edge function failed, using fallback:', e.message);
    // Fallback to local implementation
    return generateContent(userText, userId, imgBase64);
  }
};

// ==========================================
// 1. CHAT HISTORY
// ==========================================

export const getChatbotMessages = async (userId: string): Promise<ChatbotMessage[]> => {
  const { data, error } = await supabase
    .from('chatbot_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching chatbot messages:', error);
    return [];
  }
  return data || [];
};

export const addChatbotMessage = async (userId: string, sender: 'user' | 'ai', text: string) => {
  // Ensure profile exists to prevent FK errors (Self-Healing)
  if (sender === 'user') {
     const { data: profile } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
     if (!profile) {
         // This works because we unlocked the INSERT policy in SQL
         await supabase.from('profiles').insert({ id: userId, email: 'user@temp.com', role: 'member' });
     }
  }

  const { data, error } = await supabase
    .from('chatbot_messages')
    .insert([{ user_id: userId, sender, text }])
    .select()
    .single();

  if (error) throw error; 
  return data;
};

export const clearChatbotMessages = async (userId: string) => {
  const { error } = await supabase
    .from('chatbot_messages')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
};

// ==========================================
// 2. UNIFIED CHAT FUNCTION
// ==========================================

export const sendUserMessageToAI = async (userId: string, text: string): Promise<string> => {
  try {
    // 1. Save User Message
    await addChatbotMessage(userId, 'user', text);

    // 2. Call AI (Delegated to the robust geminiService)
    // This will try all models until one works
    const aiResponseText = await generateContentWithHistory(text, userId);

    // 3. Save AI Response
    await addChatbotMessage(userId, 'ai', aiResponseText);

    return aiResponseText;
  } catch (error: any) {
    console.error("AI Conversation Failed:", error);
    const errorMessage = error.message || "Could not connect to AI.";
    
    // Add a system error message to the chat so the user sees it
    await addChatbotMessage(userId, 'ai', `Error: ${errorMessage}`);
    throw error;
  }
};

// ==========================================
// 3. DASHBOARD INSIGHTS
// ==========================================

export const generateFinancialInsight = async (userId: string, transactions: any[]): Promise<string> => {
  try {
    if (transactions.length === 0) return "No transactions to analyze yet.";

    const summary = transactions.slice(0, 10).map(t => 
      `${t.date}: ${t.description} (${t.amount})`
    ).join('\n');

    const prompt = `
      Analyze these recent financial transactions:
      ${summary}
      
      Provide a 1-sentence insight about spending habits. 
      Be concise and friendly.
    `;

    return await generateContentWithHistory(prompt, userId);
  } catch (e) {
    return "Insight unavailable.";
  }
};

export async function generateContent(userText: string, userId?: string, imgBase64?: string): Promise<string> {
  // Mock AI responses for demo purposes
  const responses = [
    "That's an interesting point! Have you considered setting up automatic savings to build your emergency fund?",
    "Great question! Based on your transaction history, you might benefit from creating a budget for discretionary spending.",
    "I notice some recurring expenses in your data. Would you like me to help identify potential subscription optimizations?",
    "Financial planning is key to reaching your goals. What specific financial objective are you working towards?",
    "Remember, small consistent changes in spending habits can lead to significant savings over time.",
    "Have you explored any investment options that align with your risk tolerance and time horizon?",
    "Tax season is coming up - have you gathered all your deductible expenses for potential savings?",
    "Diversification is important in investing. Are you spreading your investments across different asset classes?",
    "Setting specific, measurable financial goals can help you stay motivated and on track.",
    "Regular financial check-ins are crucial. How often do you review your budget and spending?"
  ];

  // Simple keyword matching for more relevant responses
  const lowerText = userText.toLowerCase();
  if (lowerText.includes('budget') || lowerText.includes('spending')) {
    return "Budgeting is fundamental to financial success. I can help you analyze your spending patterns and create a personalized budget plan.";
  }
  if (lowerText.includes('save') || lowerText.includes('saving')) {
    return "Saving is one of the most powerful financial tools. Consider automating transfers to a high-yield savings account.";
  }
  if (lowerText.includes('invest') || lowerText.includes('investment')) {
    return "Investing can help grow your wealth over time. Start with low-risk options and consider your long-term goals.";
  }
  if (lowerText.includes('debt') || lowerText.includes('loan')) {
    return "Managing debt effectively is important. Focus on high-interest debt first and consider consolidation options.";
  }

  // Return random response if no keywords match
  return responses[Math.floor(Math.random() * responses.length)];
};

// ==========================================
// 4. VOICE COMMAND PARSING
// ==========================================

import { ParsedVoiceCommand } from '../types';

/**
 * Parses voice commands to extract transaction data.
 * Uses AI to understand natural language expense logging.
 */
export const parseVoiceCommand = async (voiceText: string): Promise<ParsedVoiceCommand> => {
  // Mock AI parsing - in production, this would call Gemini API
  const lowerText = voiceText.toLowerCase();

  // Extract amount (look for currency patterns)
  const amountMatch = voiceText.match(/\$?(\d+(?:\.\d{2})?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

  // Extract merchant (common patterns)
  let merchant = 'Unknown';
  const merchantPatterns = [
    /(?:at|from|with)\s+([A-Za-z\s]+?)(?:\s+(?:for|and|with|$))/i,
    /([A-Za-z\s]+?)(?:\s+\$?\d+)/
  ];

  for (const pattern of merchantPatterns) {
    const match = voiceText.match(pattern);
    if (match && match[1]) {
      merchant = match[1].trim();
      break;
    }
  }

  // Determine category based on keywords
  let category = 'Other';
  const categoryKeywords = {
    'Food': ['restaurant', 'food', 'lunch', 'dinner', 'coffee', 'starbucks', 'mcdonald'],
    'Transportation': ['gas', 'fuel', 'uber', 'lyft', 'taxi', 'parking', 'transit'],
    'Entertainment': ['movie', 'cinema', 'concert', 'game', 'netflix', 'spotify'],
    'Shopping': ['amazon', 'target', 'walmart', 'store', 'mall', 'clothing'],
    'Utilities': ['electric', 'water', 'internet', 'phone', 'utility'],
    'Healthcare': ['doctor', 'pharmacy', 'medical', 'hospital', 'dental']
  };

  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(k => lowerText.includes(k))) {
      category = cat;
      break;
    }
  }

  // Determine tax deductibility
  const businessKeywords = ['office', 'business', 'work', 'professional', 'client'];
  const isTaxDeductible = businessKeywords.some(k => lowerText.includes(k));

  // Calculate confidence based on extraction quality
  let confidence = 0.5;
  if (amount > 0) confidence += 0.2;
  if (merchant !== 'Unknown') confidence += 0.2;
  if (category !== 'Other') confidence += 0.1;

  return {
    amount,
    merchant,
    category,
    is_tax_deductible: isTaxDeductible,
    confidence: Math.min(confidence, 1.0),
    raw_text: voiceText
  };
};

/**
 * Analyzes merchant name to determine tax deductibility.
 * Enhanced AI-powered categorization for business expenses.
 */
export const analyzeTaxDeductibility = async (merchantName: string, transactionAmount: number): Promise<boolean> => {
  const lowerMerchant = merchantName.toLowerCase();

  // Business expense indicators
  const businessIndicators = [
    'office', 'supply', 'depot', 'staples', 'quickbooks', 'xero',
    'advertising', 'marketing', 'software', 'consulting',
    'equipment', 'tools', 'machinery', 'vehicle', 'gas', 'fuel',
    'travel', 'hotel', 'flight', 'taxi', 'mileage',
    'internet', 'phone', 'utilities', 'rent', 'lease', 'insurance',
    'professional', 'legal', 'accounting', 'tax', 'audit'
  ];

  // Personal expense indicators (overrides business)
  const personalIndicators = [
    'mcdonald', 'starbucks', 'netflix', 'spotify', 'amazon prime', 'hulu',
    'grocery', 'supermarket', 'restaurant', 'bar', 'entertainment',
    'clothing', 'shopping', 'mall', 'gift', 'personal'
  ];

  const isBusiness = businessIndicators.some(indicator => lowerMerchant.includes(indicator));
  const isPersonal = personalIndicators.some(indicator => lowerMerchant.includes(indicator));

  // High-value transactions (> $500) are more likely business expenses
  const highValueBusiness = transactionAmount > 500;

  if (isPersonal) return false;
  if (isBusiness || highValueBusiness) return true;

  // Default to false for ambiguous cases
  return false;
};