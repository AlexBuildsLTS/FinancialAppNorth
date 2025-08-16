export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: 'free' | 'premium' | 'professional';
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: string;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  title: string;
  description?: string;
  category: string;
  amount: number;
  date: string;
  time: string;
  type: 'income' | 'expense' | 'transfer';
  status: 'completed' | 'pending' | 'failed';
  tags?: string[];
  location?: string;
  receipt?: string;
}

export interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Investment {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  currentPrice: number;
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  purchasePrice: number;
  purchaseDate: string;
}

export interface Report {
  id: string;
  title: string;
  type: 'profit-loss' | 'balance-sheet' | 'cash-flow' | 'expense-analysis';
  period: string;
  generatedAt: string;
  data: any;
}