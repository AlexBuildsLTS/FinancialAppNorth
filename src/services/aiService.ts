import { supabase } from '../lib/supabase';

export const aiService = {
  /**
   * Sends a message to the AI and saves the interaction
   */
  async askFinancialAdvisor(userId: string, question: string) {
    // 1. Save user message to the chatbot_messages table
    const { error: msgError } = await supabase
      .from('chatbot_messages')
      .insert([{ user_id: userId, sender: 'user', text: question }]);

    if (msgError) throw msgError;

    // 2. Call your Supabase Edge Function
    // This function will query Gemini and return a data-driven insight
    const { data, error: edgeError } = await supabase.functions.invoke(
      'financial-advisor',
      {
        body: { prompt: question, userId: userId },
      }
    );

    if (edgeError) throw edgeError;

    // 3. Save AI response back to your table
    await supabase
      .from('chatbot_messages')
      .insert([{ user_id: userId, sender: 'ai', text: data.answer }]);

    // 4. Record the interaction for the "Active CFO" history
    await supabase.from('ai_interactions').insert([
      {
        user_id: userId,
        question,
        response: data.answer,
        analysis_type: 'general_advisory',
      },
    ]);

    return data.answer;
  },
};
