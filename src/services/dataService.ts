import { Transaction, Account, Budget, Goal, Investment } from '@/types';

// Mock data for development
export const mockAccounts: Account[] = [
  {
    id: '1',
    name: 'Primary Checking',
    type: 'checking',
    balance: 12450.75,
    currency: 'USD',
    lastUpdated: '2025-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'High Yield Savings',
    type: 'savings',
    balance: 45200.00,
    currency: 'USD',
    lastUpdated: '2025-01-15T10:30:00Z',
  },
  {
    id: '3',
    name: 'Investment Portfolio',
    type: 'investment',
    balance: 87650.25,
    currency: 'USD',
    lastUpdated: '2025-01-15T10:30:00Z',
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    accountId: '1',
    title: 'Whole Foods Market',
    description: 'Weekly grocery shopping',
    category: 'Groceries',
    amount: -156.50,
    date: '2025-01-15',
    time: '14:30',
    type: 'expense',
    status: 'completed',
    tags: ['food', 'weekly'],
    location: 'Austin, TX',
  },
  {
    id: '2',
    accountId: '1',
    title: 'Monthly Salary',
    description: 'Software Engineer Salary',
    category: 'Salary',
    amount: 5200.00,
    date: '2025-01-15',
    time: '09:00',
    type: 'income',
    status: 'completed',
    tags: ['salary', 'monthly'],
  },
  {
    id: '3',
    accountId: '1',
    title: 'Shell Gas Station',
    description: 'Fuel for commute',
    category: 'Transportation',
    amount: -45.20,
    date: '2025-01-14',
    time: '18:45',
    type: 'expense',
    status: 'completed',
    tags: ['gas', 'commute'],
    location: 'Austin, TX',
  },
  {
    id: '4',
    accountId: '1',
    title: 'Starbucks Coffee',
    description: 'Morning coffee',
    category: 'Food & Dining',
    amount: -12.75,
    date: '2025-01-14',
    time: '08:15',
    type: 'expense',
    status: 'pending',
    tags: ['coffee', 'morning'],
    location: 'Austin, TX',
  },
  {
    id: '5',
    accountId: '1',
    title: 'Apartment Rent',
    description: 'Monthly rent payment',
    category: 'Housing',
    amount: -1200.00,
    date: '2025-01-01',
    time: '12:00',
    type: 'expense',
    status: 'completed',
    tags: ['rent', 'monthly', 'housing'],
  },
];

export const mockBudgets: Budget[] = [
  {
    id: '1',
    category: 'Groceries',
    allocated: 600,
    spent: 456.50,
    period: 'monthly',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
  },
  {
    id: '2',
    category: 'Transportation',
    allocated: 300,
    spent: 245.20,
    period: 'monthly',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
  },
  {
    id: '3',
    category: 'Entertainment',
    allocated: 200,
    spent: 125.75,
    period: 'monthly',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
  },
];

export const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Emergency Fund',
    description: 'Build 6 months of expenses',
    targetAmount: 30000,
    currentAmount: 18500,
    targetDate: '2025-12-31',
    category: 'savings',
    priority: 'high',
  },
  {
    id: '2',
    title: 'Vacation Fund',
    description: 'European vacation savings',
    targetAmount: 8000,
    currentAmount: 3200,
    targetDate: '2025-08-15',
    category: 'travel',
    priority: 'medium',
  },
];

export const mockInvestments: Investment[] = [
  {
    id: '1',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    shares: 25,
    currentPrice: 185.50,
    totalValue: 4637.50,
    dayChange: 125.25,
    dayChangePercent: 2.77,
    purchasePrice: 150.00,
    purchaseDate: '2024-06-15',
  },
  {
    id: '2',
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    shares: 15,
    currentPrice: 420.75,
    totalValue: 6311.25,
    dayChange: -45.50,
    dayChangePercent: -0.72,
    purchasePrice: 380.00,
    purchaseDate: '2024-08-20',
  },
];

// Service functions
export async function getAccounts(): Promise<Account[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockAccounts), 300);
  });
}

export async function getTransactions(accountId?: string): Promise<Transaction[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = accountId 
        ? mockTransactions.filter(t => t.accountId === accountId)
        : mockTransactions;
      resolve(filtered);
    }, 500);
  });
}

export async function getBudgets(): Promise<Budget[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockBudgets), 400);
  });
}

export async function getGoals(): Promise<Goal[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockGoals), 350);
  });
}

export async function getInvestments(): Promise<Investment[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockInvestments), 450);
  });
}

export async function createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newTransaction: Transaction = {
        ...transaction,
        id: Date.now().toString(),
      };
      mockTransactions.unshift(newTransaction);
      resolve(newTransaction);
    }, 300);
  });
}

export async function updateBudget(budgetId: string, updates: Partial<Budget>): Promise<Budget> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const budgetIndex = mockBudgets.findIndex(b => b.id === budgetId);
      if (budgetIndex === -1) {
        reject(new Error('Budget not found'));
        return;
      }
      
      mockBudgets[budgetIndex] = { ...mockBudgets[budgetIndex], ...updates };
      resolve(mockBudgets[budgetIndex]);
    }, 300);
  });
}