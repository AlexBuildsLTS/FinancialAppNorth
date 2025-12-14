import { GoogleGenerativeAI } from "@google/generative-ai";
import { dataService } from '../../services/dataService';

// Fallback is dangerous in production, but okay for dev if you don't have DB keys yet.
// Ideally, always rely on dataService.getGeminiKey
const DEFAULT_API_KEY = ""; 

export const generateContent = async (prompt: string, userId: string, financialContext?: any) => {
  try {
    // 1. Retrieve the User's API Key securely from the database
    let apiKey = await dataService.getGeminiKey(userId);
    
    // Fallback logic (optional, remove if you want strict security)
    if (!apiKey) {
      if (DEFAULT_API_KEY) {
        console.warn("[Gemini] Using hardcoded fallback key.");
        apiKey = DEFAULT_API_KEY;
      } else {
        console.warn("[Gemini] No API key found.");
        throw new Error("Please save your Gemini API Key in Settings > AI Keys first.");
      }
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // 2. Construct a System Prompt with Financial Context (if provided)
    let finalPrompt = prompt;
    
    if (financialContext) {
      const { balance, expense, income, recentTransactions, budgets } = financialContext;
      
      const contextString = `
        [SYSTEM ROLE: You are NorthFinance AI, an elite financial advisor. Be concise, professional, and encouraging.]
        [USER DATA SNAPSHOT]
        - Current Balance: ${balance}
        - Monthly Income: ${income}
        - Monthly Expenses: ${expense}
        - Active Budgets: ${JSON.stringify(budgets)}
        - Recent 5 Transactions: ${JSON.stringify(recentTransactions)}
        
        [INSTRUCTION]
        Answer the user's question based strictly on this data. If they ask to perform an action (like adding a transaction), confirm you understand but explain you are currently in "Analysis Mode".
      `;
      
      finalPrompt = `${contextString}\n\nUser Query: ${prompt}`;
    }

    // 3. Generate Response
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    return response.text();

  } catch (error: any) {
    console.error("[Gemini Service] Error:", error.message);
    throw new Error(error.message || "AI Service unavailable.");
  }
};

/**
 * Auto-generates a monthly financial report/insight summary
 */
export const generateFinancialInsights = async (userId: string) => {
    const summary = await dataService.getFinancialSummary(userId);
    const prompt = `Analyze this financial summary: Income ${summary.income}, Expense ${summary.expense}. Give me 3 bullet points on how to save money next month.`;
    return await generateContent(prompt, userId);
};