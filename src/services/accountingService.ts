// src/services/accountingService.ts

import { supabase } from '@/lib/supabase';
import {
  JournalEntry,
  ChartOfAccounts,
  FinancialStatement,
  TaxCategory,
  AuditTrail,
} from '@/types/accounting';

/**
 * Fetches the chart of accounts for the currently logged-in user or a specific client.
 * @param userId - The ID of the user whose chart of accounts to fetch.
 */
export const getChartOfAccounts = async (userId: string): Promise<ChartOfAccounts[]> => {
  const { data, error } = await supabase
    .from('chart_of_accounts')
    .select('*')
    .eq('user_id', userId)
    .order('code', { ascending: true });

  if (error) {
    console.error('Error fetching chart of accounts:', error);
    throw error;
  }
  return data;
};

/**
 * Creates a new journal entry and its associated line items in the database.
 * This is wrapped in a transaction to ensure data integrity.
 * @param entry - The journal entry data to be created.
 */
export const createJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'createdAt'>): Promise<JournalEntry> => {
    // This should be done in a Supabase Edge Function (RPC call) to ensure atomicity (all or nothing)
    const { data, error } = await supabase.rpc('create_journal_entry', {
        entry_data: entry
    });

    if (error) {
        console.error('Error creating journal entry:', error);
        throw error;
    }
    return data as JournalEntry;
};

/**
 * Fetches all journal entries for a specific client.
 * @param clientId - The ID of the client.
 */
export const getJournalEntries = async (clientId: string): Promise<JournalEntry[]> => {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*, entries:journal_entry_lines(*)')
    .eq('clientId', clientId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching journal entries:', error);
    throw error;
  }
  return data as JournalEntry[];
};

/**
 * Generates a financial statement by aggregating data from the chart of accounts.
 * This logic should ideally be handled by a Supabase Edge Function for performance and security.
 * @param type - The type of statement to generate.
 * @param clientId - The ID of the client.
 * @param periodStart - The start date for the report period.
 * @param periodEnd - The end date for the report period.
 */
export const generateFinancialStatement = async (
  type: 'profit_loss' | 'balance_sheet',
  clientId: string,
  periodStart: string,
  periodEnd: string,
  userId: string // Add userId as a parameter
): Promise<FinancialStatement> => {
    // Calling an RPC function in Supabase that handles the complex aggregation logic
    const { data, error } = await supabase.rpc('generate_financial_statement', {
        statement_type: type,
        client_id: clientId,
        start_date: periodStart,
        end_date: periodEnd,
    });

    if (error) {
        console.error(`Error generating ${type} statement:`, error);
        throw error;
    }

    const statement: FinancialStatement = {
        id: `fs_${Date.now()}`,
        type,
        clientId,
        periodStart,
        periodEnd,
        data,
        generatedAt: new Date().toISOString(),
        generatedBy: userId || 'system', // Use the passed userId
    };

    return statement;
};


/**
 * Fetches all tax categories relevant to a user.
 * @param userId - The ID of the user.
 */
export const getTaxCategories = async (userId: string): Promise<TaxCategory[]> => {
    const { data, error } = await supabase
        .from('tax_categories')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching tax categories:', error);
        throw error;
    }
    return data;
};

/**
 * Creates a record in the audit trail for tracking user actions.
 * @param trail - The audit trail data to be logged.
 */
export const createAuditTrail = async (trail: Omit<AuditTrail, 'id' | 'timestamp'>): Promise<void> => {
  const { error } = await supabase.from('audit_trails').insert(trail);

  if (error) {
    console.error('Error creating audit trail:', error);
    // In a real app, you might have a fallback logging mechanism here.
    // We don't throw an error to avoid breaking user-facing flows for a logging failure.
  }
};