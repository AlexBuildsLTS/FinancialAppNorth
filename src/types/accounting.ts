export interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  clientId: string;
  entries: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  status: 'draft' | 'posted' | 'reversed';
  createdBy: string;
  createdAt: string;
  attachments?: string[];
}

export interface JournalEntryLine {
  id: string;
  accountId: string;
  accountName: string;
  accountCode: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
}

export interface ChartOfAccounts {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  parentId?: string;
  isActive: boolean;
  balance: number;
  normalBalance: 'debit' | 'credit';
  taxReportingCategory?: string;
}

export type AccountType = 
  | 'asset' 
  | 'liability' 
  | 'equity' 
  | 'revenue' 
  | 'expense' 
  | 'cost_of_goods_sold';

export interface FinancialStatement {
  id: string;
  type: 'profit_loss' | 'balance_sheet' | 'cash_flow';
  clientId: string;
  periodStart: string;
  periodEnd: string;
  data: any;
  generatedAt: string;
  generatedBy: string;
}

export interface BankReconciliation {
  id: string;
  accountId: string;
  clientId: string;
  statementDate: string;
  beginningBalance: number;
  endingBalance: number;
  reconciledTransactions: string[];
  unreconciledTransactions: string[];
  adjustments: ReconciliationAdjustment[];
  status: 'in_progress' | 'completed' | 'reviewed';
}

export interface ReconciliationAdjustment {
  id: string;
  description: string;
  amount: number;
  type: 'bank_charge' | 'interest' | 'error_correction' | 'other';
}

export interface TaxCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  formLine?: string;
  isDeductible: boolean;
}

export interface AuditTrail {
  id: string;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'view';
  userId: string;
  timestamp: string;
  changes?: any;
  ipAddress?: string;
}