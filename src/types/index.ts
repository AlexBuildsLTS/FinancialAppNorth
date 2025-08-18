export interface Client {
  id: string;
  name: string;
  companyName: string;
  email: string;
  avatarUrl: string;
  status: 'active' | 'pending' | 'inactive';
  netWorth: number;
  uncategorized: number;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: 'USD' | 'EUR' | 'GBP';
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  clientId: string;
  accountId?: string;
  title: string;
  description?: string;
  category: string;
  amount: number;
  date: string;
  time?: string;
  type: 'income' | 'expense';
  status: 'completed' | 'pending' | 'failed';
  tags?: string[];
  location?: string;
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
  priority: 'high' | 'medium' | 'low';
}

export interface Investment {
  id:string;
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

export interface ScannedDocument {
  id: string;
  clientId: string;
  fileName: string;
  filePath: string;
  extractedText: string;
  aiProcessedData?: any;
  createdAt: string;
  processedAt?: string;
  status: 'pending' | 'processed' | 'error';
}

export interface AIProvider {
  id: string;
  name: string;
  apiEndpoint: string;
  requiresApiKey: boolean;
  supportedFormats: string[];
}

export interface UserRole {
  id: string;
  name: 'Customer' | 'Support' | 'Accountant' | 'Administrator' | 'Moderator';
  permissions: string[];
}
export interface FixedAsset {
  id: string;
  clientId: string;
  name: string;
  value: number;
  type: 'property' | 'equipment' | 'vehicle';
}

export interface Liability {
  id: string;
  clientId: string;
  name: string;
  type: 'credit_card' | 'loan' | 'other';
  balance: number;
}