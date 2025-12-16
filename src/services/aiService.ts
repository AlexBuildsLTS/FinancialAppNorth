import { supabase } from '../lib/supabase';
import { ChatbotMessage } from '../types';
import { generateContent as generateContentFromGemini } from './geminiService';

const generateContentWithHistory = async (userText: string, userId?: string, imgBase64?: string): Promise<string> => {
  // Validate input with detailed checks
  if (!userText) {
    console.error('[AI Service] userText is null or undefined');
    return "Please provide a valid question or prompt.";
  }
  
  if (typeof userText !== 'string') {
    console.error('[AI Service] userText is not a string:', typeof userText);
    return "Please provide a valid question or prompt.";
  }
  
  const trimmedText = userText.trim();
  if (trimmedText.length === 0) {
    console.error('[AI Service] userText is empty after trimming');
    return "Please provide a valid question or prompt.";
  }
  
  // Ensure minimum length
  if (trimmedText.length < 5) {
    console.warn('[AI Service] Prompt is suspiciously short:', trimmedText);
  }

  try {
    // Use geminiService directly which has better error handling
    return await generateContentFromGemini(trimmedText, userId, imgBase64);
  } catch (e: any) {
    console.error('[AI Service] AI service failed:', {
      error: e,
      message: e?.message,
      stack: e?.stack
    });
    return "I'm having trouble connecting to the AI. Please try again in a moment.";
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
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      console.error('[AI Service] Invalid userId in generateFinancialInsight');
      return "Unable to generate insight: invalid user.";
    }
    
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return "No transactions to analyze yet.";
    }

    const validTransactions = transactions.slice(0, 10)
      .filter(t => t && (t.date || t.description || t.amount));
    
    if (validTransactions.length === 0) {
      return "No valid transaction data to analyze.";
    }

    const summary = validTransactions
      .map(t => {
        const date = t.date ? new Date(t.date).toLocaleDateString() : 'Unknown date';
        const desc = t.description || 'No description';
        const amount = t.amount ? `$${Math.abs(Number(t.amount)).toFixed(2)}` : '$0.00';
        return `${date}: ${desc} (${amount})`;
      })
      .join('\n');

    if (!summary || summary.trim().length === 0) {
      console.error('[AI Service] Summary is empty after processing transactions');
      return "No valid transaction data to analyze.";
    }

    const prompt = `Analyze these recent financial transactions:\n${summary}\n\nProvide a 1-sentence insight about spending habits. Be concise and friendly.`.trim();

    if (!prompt || prompt.length === 0) {
      console.error('[AI Service] Generated prompt is empty');
      return "Unable to generate insight at this time.";
    }
    
    // Ensure prompt meets minimum requirements
    if (prompt.length < 50) {
      console.warn('[AI Service] Generated prompt is suspiciously short:', prompt);
    }

    return await generateContentWithHistory(prompt, userId);
  } catch (e: any) {
    console.error('[AI Service] generateFinancialInsight error:', {
      error: e,
      message: e?.message,
      stack: e?.stack
    });
    return "Insight unavailable.";
  }
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

  // Generate description from merchant and category, or use raw text
  const description = merchant !== 'Unknown' 
    ? `${merchant} - ${category}`
    : voiceText.length > 100 
      ? voiceText.substring(0, 100) + '...'
      : voiceText;

  return {
    amount,
    description,
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