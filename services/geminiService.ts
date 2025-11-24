import { GoogleGenerativeAI } from '@google/generative-ai';


const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("EXPO_PUBLIC_GEMINI_API_KEY is not set.");
}


export const getFinancialAdvice = async (question: string): Promise<string> => {
    try {
        const ai = new GoogleGenerativeAI(API_KEY);
        
        const response = await ai.getGenerativeModel({ model: 'gemini-1.5-flash' }).generateContent({
            contents: [{
                role: 'user',
                parts: [{ text: question }],
            }], 
            generationConfig: {
                // The systemInstruction is now part of the generationConfig
                // or passed directly to the getGenerativeModel method in some SDK versions.
                // For gemini-1.5-flash, it's typically set at the model level or in the prompt.
            }
        });

        return response.response.text() || "I couldn't generate a response at this time.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Sorry, I'm having trouble connecting to the financial brain right now. Please try again.";
    }
};