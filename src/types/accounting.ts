// src/types/accounting.ts

// UUID type alias for better type hinting
type UUID = string;

/**
 * Standard Chart of Accounts entry
 * Maps to database table public.chart_of_accounts
 */
export interface ChartOfAccounts {
  id: UUID;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'cost_of_goods_sold';
  is_active: boolean; // Changed to snake_case to match DB convention
  balance: number;
  normal_balance: 'debit' | 'credit'; // Changed to snake_case
  tax_reporting_category?: string; // Changed to snake_case
  user_id: UUID; // Belongs to a specific user/entity
  parent_id?: UUID; // For hierarchical charts of accounts
  created_at?: string; // ISO timestamp
  updated_at?: string; // ISO timestamp
}

/**
 * Line item in a journal entry
 */
export interface JournalEntryLine {
  id?: UUID; // Optional for new entries
  journal_entry_id?: UUID; // Reference to parent
  account_id: UUID; 
  account_name: string;
  account_code: string;
  description?: string;
  debit_amount: number; // Changed to snake_case
  credit_amount: number; // Changed to snake_case
  memo?: string;
  order?: number; // For maintaining line order
}

/**
 * Complete journal entry with balanced debits and credits
 * Maps to database table public.journal_entries
 */
export interface JournalEntry {
  id: UUID;
  date: string; // ISO 8601 format
  reference?: string;
  description: string;
  client_id: UUID; // The user ID this entry belongs to
  entries: JournalEntryLine[];
  total_debit: number; // Changed to snake_case
  total_credit: number; // Changed to snake_case
  status: 'draft' | 'posted' | 'void';
  created_by: UUID; // User ID of creator (e.g., the CPA)
  created_at: string;
  updated_at?: string;
  posted_at?: string;
  voided_at?: string;
  voided_by?: UUID;
  period_id?: UUID; // Optional link to accounting period
}

/**
 * Financial statement data
 * Maps to database table public.financial_statements
 */
export interface FinancialStatement {
  id: UUID;
  type: 'profit_loss' | 'balance_sheet' | 'cash_flow' | 'trial_balance';
  client_id: UUID;
  period_start: string; // ISO date
  period_end: string; // ISO date
  data: FinancialStatementData; // Typed properly
  generated_at: string; // Changed to snake_case
  generated_by: UUID; // Changed to snake_case
  is_draft: boolean;
  version: number; // For tracking revisions
}

/**
 * Financial statement data structure
 * Different for each statement type
 */
export type FinancialStatementData = 
  | ProfitLossData 
  | BalanceSheetData 
  | CashFlowData 
  | TrialBalanceData;

export interface ProfitLossData {
  revenue: LineItem[];
  expenses: LineItem[];
  net_income: number;
  gross_profit: number;
  total_revenue: number;
  total_expenses: number;
}

export interface BalanceSheetData {
  assets: LineItem[];
  liabilities: LineItem[];
  equity: LineItem[];
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
}

export interface CashFlowData {
  operating: LineItem[];
  investing: LineItem[];
  financing: LineItem[];
  net_change: number;
  beginning_balance: number;
  ending_balance: number;
}

export interface TrialBalanceData {
  accounts: TrialBalanceAccount[];
  total_debits: number;
  total_credits: number;
}

export interface TrialBalanceAccount {
  id: UUID;
  code: string;
  name: string;
  debit_balance: number;
  credit_balance: number;
}

export interface LineItem {
  id: UUID;
  name: string;
  amount: number;
  percentage?: number;
  sub_items?: LineItem[];
}

/**
 * Tax category for accounts
 * Maps to database table public.tax_categories
 */
export interface TaxCategory {
  id: UUID;
  name: string;
  code: string;
  description: string;
  form_line: string; // Changed to snake_case
  is_deductible: boolean; // Changed to snake_case
  user_id: UUID;
  created_at?: string;
  updated_at?: string;
}

/**
 * Audit trail for accounting actions
 * Maps to database table public.audit_log
 */
export interface AuditTrail {
  id?: UUID;
  user_id: UUID; // User who performed the action
  target_entity: string; // e.g., 'journal_entry', 'user_role'
  target_id: UUID; // ID of the entity that was changed
  action: 'create' | 'update' | 'delete' | 'view';
  details: Record<string, any>; // JSONB field for what was changed
  timestamp?: string;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Accounting Period 
 * Maps to database table public.accounting_periods
 */
export interface AccountingPeriod {
  id: UUID;
  name: string;
  start_date: string; // ISO date
  end_date: string; // ISO date
  status: 'open' | 'closed' | 'locked';
  client_id: UUID;
  created_at?: string;
  closed_at?: string;
  closed_by?: UUID;
}

/**
 * Reconciliation
 * Maps to database table public.reconciliations
 */
export interface Reconciliation {
  id: UUID;
  account_id: UUID;
  statement_date: string;
  statement_balance: number;
  reconciled_balance: number;
  status: 'in_progress' | 'completed';
  client_id: UUID;
  created_by: UUID;
  created_at: string;
  completed_at?: string;
  items: ReconciliationItem[];
}

export interface ReconciliationItem {
  id?: UUID;
  reconciliation_id: UUID;
  transaction_id: UUID;
  transaction_type: 'journal_entry' | 'direct';
  amount: number;
  date: string;
  description: string;
  is_reconciled: boolean;
}