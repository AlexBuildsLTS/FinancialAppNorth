import { 
  JournalEntry, 
  ChartOfAccounts, 
  FinancialStatement, 
  BankReconciliation,
  TaxCategory,
  AuditTrail 
} from '@/types/accounting';
import { Transaction, Client } from '@/types';

// Mock Chart of Accounts
export const mockChartOfAccounts: ChartOfAccounts[] = [
  // Assets
  { id: '1000', code: '1000', name: 'Cash and Cash Equivalents', type: 'asset', isActive: true, balance: 25000, normalBalance: 'debit' },
  { id: '1100', code: '1100', name: 'Accounts Receivable', type: 'asset', isActive: true, balance: 15000, normalBalance: 'debit' },
  { id: '1200', code: '1200', name: 'Inventory', type: 'asset', isActive: true, balance: 8000, normalBalance: 'debit' },
  { id: '1500', code: '1500', name: 'Equipment', type: 'asset', isActive: true, balance: 50000, normalBalance: 'debit' },
  { id: '1600', code: '1600', name: 'Accumulated Depreciation - Equipment', type: 'asset', isActive: true, balance: -10000, normalBalance: 'credit' },
  
  // Liabilities
  { id: '2000', code: '2000', name: 'Accounts Payable', type: 'liability', isActive: true, balance: 8000, normalBalance: 'credit' },
  { id: '2100', code: '2100', name: 'Accrued Expenses', type: 'liability', isActive: true, balance: 3000, normalBalance: 'credit' },
  { id: '2500', code: '2500', name: 'Long-term Debt', type: 'liability', isActive: true, balance: 25000, normalBalance: 'credit' },
  
  // Equity
  { id: '3000', code: '3000', name: 'Owner\'s Equity', type: 'equity', isActive: true, balance: 50000, normalBalance: 'credit' },
  { id: '3100', code: '3100', name: 'Retained Earnings', type: 'equity', isActive: true, balance: 15000, normalBalance: 'credit' },
  
  // Revenue
  { id: '4000', code: '4000', name: 'Service Revenue', type: 'revenue', isActive: true, balance: 75000, normalBalance: 'credit', taxReportingCategory: 'business_income' },
  { id: '4100', code: '4100', name: 'Product Sales', type: 'revenue', isActive: true, balance: 45000, normalBalance: 'credit', taxReportingCategory: 'business_income' },
  
  // Expenses
  { id: '5000', code: '5000', name: 'Cost of Goods Sold', type: 'cost_of_goods_sold', isActive: true, balance: 20000, normalBalance: 'debit', taxReportingCategory: 'cost_of_goods_sold' },
  { id: '6000', code: '6000', name: 'Salaries and Wages', type: 'expense', isActive: true, balance: 35000, normalBalance: 'debit', taxReportingCategory: 'wages' },
  { id: '6100', code: '6100', name: 'Rent Expense', type: 'expense', isActive: true, balance: 12000, normalBalance: 'debit', taxReportingCategory: 'rent' },
  { id: '6200', code: '6200', name: 'Utilities Expense', type: 'expense', isActive: true, balance: 3600, normalBalance: 'debit', taxReportingCategory: 'utilities' },
  { id: '6300', code: '6300', name: 'Office Supplies', type: 'expense', isActive: true, balance: 2400, normalBalance: 'debit', taxReportingCategory: 'office_supplies' },
  { id: '6400', code: '6400', name: 'Professional Services', type: 'expense', isActive: true, balance: 5000, normalBalance: 'debit', taxReportingCategory: 'professional_fees' },
  { id: '6500', code: '6500', name: 'Depreciation Expense', type: 'expense', isActive: true, balance: 5000, normalBalance: 'debit', taxReportingCategory: 'depreciation' },
];

export const mockTaxCategories: TaxCategory[] = [
  { id: 'tc1', name: 'Business Income', code: 'BI', description: 'Revenue from business operations', formLine: 'Schedule C Line 1', isDeductible: false },
  { id: 'tc2', name: 'Cost of Goods Sold', code: 'COGS', description: 'Direct costs of producing goods', formLine: 'Schedule C Line 4', isDeductible: true },
  { id: 'tc3', name: 'Wages', code: 'WAGES', description: 'Employee compensation', formLine: 'Schedule C Line 26', isDeductible: true },
  { id: 'tc4', name: 'Rent', code: 'RENT', description: 'Office and equipment rental', formLine: 'Schedule C Line 20a', isDeductible: true },
  { id: 'tc5', name: 'Utilities', code: 'UTIL', description: 'Electricity, gas, water, phone', formLine: 'Schedule C Line 25', isDeductible: true },
  { id: 'tc6', name: 'Office Supplies', code: 'SUPPLIES', description: 'Office materials and supplies', formLine: 'Schedule C Line 18', isDeductible: true },
  { id: 'tc7', name: 'Professional Fees', code: 'PROF', description: 'Legal and professional services', formLine: 'Schedule C Line 17', isDeductible: true },
  { id: 'tc8', name: 'Depreciation', code: 'DEPR', description: 'Asset depreciation', formLine: 'Schedule C Line 13', isDeductible: true },
];

let mockJournalEntries: JournalEntry[] = [
  {
    id: 'je1',
    date: '2025-01-15',
    reference: 'JE-001',
    description: 'Record service revenue for January',
    clientId: 'cli1',
    entries: [
      { id: 'jel1', accountId: '1000', accountName: 'Cash and Cash Equivalents', accountCode: '1000', description: 'Cash received', debitAmount: 5000, creditAmount: 0 },
      { id: 'jel2', accountId: '4000', accountName: 'Service Revenue', accountCode: '4000', description: 'Service revenue earned', debitAmount: 0, creditAmount: 5000 }
    ],
    totalDebit: 5000,
    totalCredit: 5000,
    status: 'posted',
    createdBy: 'user1',
    createdAt: '2025-01-15T10:00:00Z'
  }
];

// Service Functions
export async function getChartOfAccounts(): Promise<ChartOfAccounts[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockChartOfAccounts), 300);
  });
}

export async function createJournalEntry(entry: Omit<JournalEntry, 'id' | 'createdAt'>): Promise<JournalEntry> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newEntry: JournalEntry = {
        ...entry,
        id: `je_${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      mockJournalEntries.unshift(newEntry);
      resolve(newEntry);
    }, 500);
  });
}

export async function getJournalEntries(clientId?: string): Promise<JournalEntry[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = clientId 
        ? mockJournalEntries.filter(je => je.clientId === clientId)
        : mockJournalEntries;
      resolve(filtered);
    }, 400);
  });
}

export async function generateFinancialStatement(
  type: 'profit_loss' | 'balance_sheet' | 'cash_flow',
  clientId: string,
  periodStart: string,
  periodEnd: string
): Promise<FinancialStatement> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let data: any = {};
      
      if (type === 'profit_loss') {
        const revenues = mockChartOfAccounts.filter(acc => acc.type === 'revenue');
        const expenses = mockChartOfAccounts.filter(acc => acc.type === 'expense' || acc.type === 'cost_of_goods_sold');
        const totalRevenue = revenues.reduce((sum, acc) => sum + acc.balance, 0);
        const totalExpenses = expenses.reduce((sum, acc) => sum + acc.balance, 0);
        
        data = {
          revenues,
          expenses,
          totalRevenue,
          totalExpenses,
          netIncome: totalRevenue - totalExpenses
        };
      } else if (type === 'balance_sheet') {
        const assets = mockChartOfAccounts.filter(acc => acc.type === 'asset');
        const liabilities = mockChartOfAccounts.filter(acc => acc.type === 'liability');
        const equity = mockChartOfAccounts.filter(acc => acc.type === 'equity');
        
        data = {
          assets,
          liabilities,
          equity,
          totalAssets: assets.reduce((sum, acc) => sum + Math.abs(acc.balance), 0),
          totalLiabilities: liabilities.reduce((sum, acc) => sum + acc.balance, 0),
          totalEquity: equity.reduce((sum, acc) => sum + acc.balance, 0)
        };
      }
      
      const statement: FinancialStatement = {
        id: `fs_${Date.now()}`,
        type,
        clientId,
        periodStart,
        periodEnd,
        data,
        generatedAt: new Date().toISOString(),
        generatedBy: 'user1'
      };
      
      resolve(statement);
    }, 800);
  });
}

export async function getTaxCategories(): Promise<TaxCategory[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockTaxCategories), 200);
  });
}

export async function createAuditTrail(trail: Omit<AuditTrail, 'id' | 'timestamp'>): Promise<void> {
  // In a real app, this would save to a secure audit log
  console.log('Audit Trail Created:', {
    ...trail,
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString()
  });
}