/**
 * src/services/taxAgentService.ts
 * ROLE: The "DeductAI" Intelligence & Access Hub.
 * PURPOSE: Manages autonomous tax deduction detection and secure auditor access.
 */

import { supabase } from '../lib/supabase';
import { Transaction } from '../types';
import * as Haptics from 'expo-haptics';

export class TaxAgentService {
  /**
   * 🤖 AUTONOMOUS AUDIT ENGINE (AI Agent)
   * Analyzes transactions via Gemini to identify and "defend" tax deductions.
   */
  static async processDeductionAgent(transactionId: string) {
    try {
      const { data: tx, error } = await supabase
        .from('transactions')
        .select(`*, documents(*)`)
        .eq('id', transactionId)
        .single();

      if (error || !tx) throw new Error('Transaction not found.');

      // Invoke Gemini Smart Ledger for deduction validation
      const response = await supabase.functions.invoke('smart-ledger', {
        body: {
          merchant: tx.merchant,
          amount: tx.amount,
          date: tx.date,
          raw_ocr_text: tx.documents?.[0]?.extracted_data,
        },
      });

      const analysis = response.data;

      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          is_tax_deductible: analysis.confidence > 0.8,
          tax_category: analysis.suggestedCategory,
          ai_metadata: {
            reasoning: analysis.reasoning,
            irs_code_reference: analysis.irsReference,
            audit_confidence: analysis.confidence,
          },
        })
        .eq('id', transactionId);

      if (updateError) throw updateError;
      return analysis;
    } catch (error) {
      console.error('[TaxAgent] AI Analysis failed:', error);
      throw error;
    }
  }

  /**
   * 💰 LIVE SAVINGS TRACKER
   * Calculates real-time tax liability reduction for the user dashboard.
   */
  static async getLiveSavings(userId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('is_tax_deductible', true);

    if (error) return { totalDeductions: 0, estimatedTaxSavings: 0 };

    const totalDeductions = data.reduce(
      (acc, val) => acc + Math.abs(val.amount || 0),
      0
    );

    return {
      totalDeductions,
      estimatedTaxSavings: totalDeductions * 0.25, // Assuming standard 25% bracket
      deductionCount: data.length,
    };
  }

  /**
   * 🛡️ AUDITOR ACCESS (Human Agent)
   * Generates time-limited, read-only access for a Tax Agent or Auditor.
   */
  static async grantTemporaryAccess(
    memberId: string,
    agentEmail: string,
    expiresInDays: number = 7
  ) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const { data, error } = await supabase
      .from('cpa_client_access')
      .insert({
        member_id: memberId,
        cpa_email: agentEmail,
        access_level: 'read_only',
        expires_at: expiresAt.toISOString(),
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Log for high-level security audit trail
    await supabase.from('audit_logs').insert({
      user_id: memberId,
      action: 'GRANT_AGENT_ACCESS',
      metadata: { agentEmail, expiresAt },
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return data;
  }

  /**
   * 🚫 ACCESS TERMINATION
   * Instantly kills a session to maintain data sovereignty.
   */
  static async revokeAccess(accessId: string) {
    const { error } = await supabase
      .from('cpa_client_access')
      .delete()
      .eq('id', accessId);

    if (error) throw error;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }
}
