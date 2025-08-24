// src/types/accounting.ts

export interface ChartOfAccounts {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'cost_of_goods_sold';
  isActive: boolean;
  balance: number;
  normalBalance: 'debit' | 'credit';
  taxReportingCategory?: string;
  user_id: string; // Belongs to a specific user/entity
}

export interface JournalEntryLine {
  id?: string; // Optional for new entries
  accountId: string;
  accountName: string;
  accountCode: string;
  description?: string;
  debitAmount: number;
  creditAmount: number;
}

export interface JournalEntry {
  id: string;
  date: string; // ISO 8601 format
  reference?: string;
  description: string;
  clientId: string; // The user ID this entry belongs to
  entries: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  status: 'draft' | 'posted' | 'void';
  createdBy: string; // User ID of creator (e.g., the CPA)
  createdAt: string;
}

export interface FinancialStatement {
  id: string;
  type: 'profit_loss' | 'balance_sheet' | 'cash_flow';
  clientId: string;
  periodStart: string;
  periodEnd: string;
  data: any; // This will be structured based on the statement type
  generatedAt: string;
  generatedBy: string;
}

export interface TaxCategory {
    id: string;
    name: string;
    code: string;
    description: string;
    formLine: string;
    isDeductible: boolean;
    user_id: string;
}

export interface AuditTrail {
    id?: string;
    user_id: string; // User who performed the action
    target_entity: string; // e.g., 'Journal Entry', 'User Role'
    target_id: string; // ID of the entity that was changed
    action: 'create' | 'update' | 'delete' | 'view';
    details: object; // JSONB field for what was changed
    timestamp?: string;
}