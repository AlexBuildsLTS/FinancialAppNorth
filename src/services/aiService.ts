import { supabase } from '../lib/supabase';
import { ChatbotMessage, ParsedVoiceCommand } from '../types';
// ✅ FIXED: Correctly importing from the robust geminiService
import { generateContent } from './geminiService';

/**
 * 🛡️ CORE AI GENERATION WRAPPER
 * Delegates to the robust geminiService which handles Edge Function communication and errors.
 */
const generateContentWithHistory = async (userText: string, userId?: string, imgBase64?: string): Promise<string> => {
  // Validate input
  if (!userText || typeof userText !== 'string' || !userText.trim()) {
    console.warn('[AI Service] Invalid prompt received');
    return "Please provide a valid question or prompt.";
  }
  
  const trimmedText = userText.trim();
  
  // Direct delegation to the robust service
  // geminiService.ts now handles all try/catch, logging, and error parsing internally.
  return await generateContent(trimmedText, userId, imgBase64);
};

// ==========================================
// 1. CHAT HISTORY & PERSISTENCE
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
  // Self-Healing: Ensure profile exists to prevent FK errors before inserting message
  if (sender === 'user') {
     const { data: profile } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
     if (!profile) {
         // If missing, auto-create a basic member profile so the chat doesn't crash
         console.log(`[AI Service] Auto-creating missing profile for ${userId}`);
         await supabase.from('profiles').insert({ 
             id: userId, 
             email: 'user@placeholder.com', 
             first_name: 'Member',
             role: 'member',
             currency: 'USD',
             updated_at: new Date().toISOString()
         });
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
// 2. UNIFIED CHAT FUNCTION (The Main Hook)
// ==========================================

export const sendUserMessageToAI = async (userId: string, text: string): Promise<string> => {
  try {
    // 1. Save User Message to DB
    await addChatbotMessage(userId, 'user', text);

    // 2. Call AI (Delegated to robust service)
    const aiResponseText = await generateContentWithHistory(text, userId);

    // 3. Save AI Response to DB
    await addChatbotMessage(userId, 'ai', aiResponseText);

    return aiResponseText;
  } catch (error: any) {
    console.error("AI Conversation Failed:", error);
    const errorMessage = error.message || "I'm having trouble connecting right now.";
    
    // Add a system error message to the chat so the user sees it naturally
    await addChatbotMessage(userId, 'ai', `System Notice: ${errorMessage}`);
    throw error;
  }
};

// ==========================================
// 3. DASHBOARD INSIGHTS (Titan 2)
// ==========================================

export const generateFinancialInsight = async (userId: string, transactions: any[]): Promise<string> => {
  try {
    if (!userId || typeof userId !== 'string') {
      return "Unable to generate insight: invalid user.";
    }
    
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return "No recent transactions to analyze.";
    }

    // Filter valid transactions and limit to 10 for prompt efficiency
    const validTransactions = transactions
      .filter(t => t && (t.date || t.description || t.amount))
      .slice(0, 10);
    
    if (validTransactions.length === 0) {
      return "No valid transaction data available.";
    }

    // Format transaction history for the AI
    const summary = validTransactions
      .map(t => {
        const date = t.date ? new Date(t.date).toLocaleDateString() : 'Unknown';
        const desc = t.description || 'Unknown Merchant';
        const amount = t.amount ? `$${Math.abs(Number(t.amount)).toFixed(2)}` : '$0.00';
        return `- ${date}: ${desc} (${amount})`;
      })
      .join('\n');

    const prompt = `
      Analyze these recent financial transactions:
      ${summary}
      
      Provide a single, concise (1-sentence) friendly insight or tip about these spending habits. 
      Focus on patterns or encouragement.
    `.trim();

    return await generateContentWithHistory(prompt, userId);

  } catch (e: any) {
    console.error('[AI Service] Insight generation failed:', e);
    return "Financial insight currently unavailable.";
  }
};

// ==========================================
// 4. VOICE COMMAND PARSING (Smart Ledger)
// ==========================================

/**
 * Parses voice/text commands to extract transaction data.
 * This is a hybrid approach: Regex/Rules first (fast), AI second (accurate).
 * Currently implemented with Logic-based fallback for speed/offline capability.
 */
export const parseVoiceCommand = async (voiceText: string): Promise<ParsedVoiceCommand> => {
  const lowerText = voiceText.toLowerCase();

  // 1. Extract Amount (Currency regex)
  // Matches "$10.50", "10.50", "10"
  const amountMatch = voiceText.match(/\$?(\d+(?:\.\d{2})?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

  // 2. Extract Merchant (Common patterns)
  // "Spent $10 at Starbucks" -> "Starbucks"
  let merchant = 'Unknown';
  const merchantPatterns = [
    /(?:at|from|with)\s+([A-Za-z\s]+?)(?:\s+(?:for|and|with|$))/i, // "at Starbucks for coffee"
    /([A-Za-z\s]+?)(?:\s+\$?\d+)/ // "Starbucks $10"
  ];

  for (const pattern of merchantPatterns) {
    const match = voiceText.match(pattern);
    if (match && match[1]) {
      merchant = match[1].trim();
      break;
    }
  }

  // 3. Determine Category (Keyword Matching)
  let category = 'Other';
  const categoryKeywords: Record<string, string[]> = {
    'Food': ['restaurant', 'food', 'lunch', 'dinner', 'coffee', 'starbucks', 'mcdonald', 'burger', 'pizza'],
    'Transportation': ['gas', 'fuel', 'uber', 'lyft', 'taxi', 'parking', 'bus', 'train', 'flight'],
    'Entertainment': ['movie', 'cinema', 'game', 'netflix', 'spotify', 'hulu', 'ticket'],
    'Shopping': ['amazon', 'target', 'walmart', 'store', 'mall', 'clothes', 'shoes'],
    'Utilities': ['electric', 'water', 'internet', 'phone', 'bill', 'rent'],
    'Healthcare': ['doctor', 'pharmacy', 'meds', 'hospital', 'dentist']
  };

  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(k => lowerText.includes(k))) {
      category = cat;
      break;
    }
  }

  // 4. Determine Tax Deductibility (Titan 1 Feature)
  const businessKeywords = ['office', 'business', 'work', 'professional', 'client', 'software', 'hosting'];
  const isTaxDeductible = businessKeywords.some(k => lowerText.includes(k));

  // 5. Calculate Confidence Score (0.0 - 1.0)
  let confidence = 0.5;
  if (amount > 0) confidence += 0.2;
  if (merchant !== 'Unknown') confidence += 0.2;
  if (category !== 'Other') confidence += 0.1;

  // Generate description
  const description = merchant !== 'Unknown' 
    ? `${merchant} - ${category}`
    : voiceText.length > 50 
      ? voiceText.substring(0, 50) + '...'
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
 * Used by the Smart Ledger and Auto-Tagger.
 */
export const analyzeTaxDeductibility = async (merchantName: string, transactionAmount: number): Promise<boolean> => {
  const lowerMerchant = merchantName.toLowerCase();

  // Business expense indicators (Deductible)
  const businessIndicators = [
    'office', 'supply', 'depot', 'staples', 'quickbooks', 'xero', 'adobe',
    'advertising', 'marketing', 'software', 'consulting', 'aws', 'google cloud',
    'equipment', 'tools', 'machinery', 'vehicle', 'gas', 'fuel',
    'travel', 'hotel', 'flight', 'taxi', 'mileage', 'uber', 'lyft',
    'internet', 'phone', 'utilities', 'rent', 'lease', 'insurance',
    'professional', 'legal', 'accounting', 'tax', 'audit'
  ];

  // Personal expense indicators (Non-Deductible - Overrides business)
  const personalIndicators = [
    'mcdonald', 'starbucks', 'netflix', 'spotify', 'amazon prime', 'hulu', 'disney',
    'grocery', 'supermarket', 'restaurant', 'bar', 'pub', 'cinema',
    'clothing', 'shopping', 'mall', 'gift', 'personal', 'gym'
  ];

  const isBusiness = businessIndicators.some(indicator => lowerMerchant.includes(indicator));
  const isPersonal = personalIndicators.some(indicator => lowerMerchant.includes(indicator));

  // Heuristic: High-value transactions (> $500) without personal keywords are flagged for review/deduction
  const highValueBusiness = transactionAmount > 500;

  if (isPersonal) return false;
  if (isBusiness || (highValueBusiness && !isPersonal)) return true;

  return false;
};