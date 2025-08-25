// Consolidated type definitions with consistent typing
export interface BaseModel {
  id: string; // Consistently use string for IDs
  description?: string; // Make optional with consistent type
}

// Example of a more robust type definition
export interface Integration extends BaseModel {
  name: string;
  type: 'banking' | 'accounting' | 'payroll' | 'tax';
  provider: string;
}

// Use consistent typing across interfaces
export interface Client extends BaseModel {
  name: string;
  email: string;
  status: Status;
  companyName: string;
  avatarUrl: string;
  netWorth: number;
  uncategorized: number;
}

// Resolve union type and literal type warnings by being more specific
export type Status = 'Active' | 'Inactive' | 'active' | 'inactive' | 'pending' | 'completed' | 'failed';
export type UserRole = 'Member' | 'Premium Member' | 'Professional Accountant' | 'Professional (CPA)' | 'Support' | 'Administrator' | 'Customer' | 'Moderator';
export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'property' | 'equipment' | 'vehicle' | 'credit_card' | 'loan' | 'other';
export type TransactionType = 'income' | 'expense';
export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';
export type Priority = 'high' | 'medium' | 'low';
export type DocumentStatus = 'pending' | 'processed' | 'error';
export type GoalCategory = string; // Consider making this more specific if there's a defined set of categories

export interface Profile extends BaseModel {
  display_name: string;
  avatar_url: string;
  email: string;
  role: UserRole;
  assignment_status?: string; // Optional status from the join
  profession?: string; // Added profession field
}

export interface UserProfile extends BaseModel {
  display_name: string;
  email: string;
  role: UserRole;
  status: Status;
  avatar_url?: string;
  profession?: string; // Added profession field
}

export interface Conversation extends BaseModel {
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

export interface Message extends BaseModel {
  conversation_id: string;
  user_id: string;
  text: string;
  created_at: string;
  sender: { display_name: string }; // From the join
}

export interface User extends BaseModel {
  email?: string;
  user_metadata?: {
    avatar_url?: string;
    display_name?: string;
    role?: string;
  };
  app_metadata?: {
    provider?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface Account extends BaseModel {
  name: string;
  type: AccountType;
  balance: number;
  currency: 'USD' | 'EUR' | 'GBP';
  lastUpdated: string;
}

export interface DashboardHeaderProps {
  userName: string;
  avatarUrl?: string;
  onPressProfile: () => void;
  onPressSettings: () => void;
  onPressMessages: () => void;
}

export interface Transaction extends BaseModel {
  user_id: string; // Added user_id to link transaction to the user
  clientId: string;
  accountId?: string;
  title: string;
  description?: string;
  category: string;
  amount: number;
  date: string;
  time?: string;
  type: TransactionType;
  status: Status;
  tags?: string[];
  location?: string;
}

export interface Budget extends BaseModel {
  category: string;
  allocated: number;
  spent: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
}

export interface Goal extends BaseModel {
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: GoalCategory;
  priority: Priority;
}

export interface Investment extends BaseModel {
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

export interface ScannedDocument extends BaseModel {
  clientId: string;
  fileName: string;
  filePath: string;
  extractedText: string;
  aiProcessedData?: any;
  createdAt: string;
  processedAt?: string;
  status: DocumentStatus;
}

export interface AIProvider extends BaseModel {
  name: string;
  apiEndpoint: string;
  requiresApiKey: boolean;
  supportedFormats: string[];
}

export interface UserRoleDefinition extends BaseModel {
  name: UserRole;
  permissions: string[];
}

export interface FixedAsset extends BaseModel {
  clientId: string;
  name: string;
  value: number;
  type: 'property' | 'equipment' | 'vehicle';
}

export interface Liability extends BaseModel {
  clientId: string;
  name: string;
  type: 'credit_card' | 'loan' | 'other';
  balance: number;
}

export interface Notification extends BaseModel {
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ClientDashboardData {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  profile: UserProfile;
  recentTransactions: Transaction[];
}

export interface MetricItem {
  label: string;
  value: string;
}
