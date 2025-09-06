// src/types/index.ts

import type { ReactNode, ComponentType } from 'react';
import type { LucideProps } from 'lucide-react-native';

// --- COMMON TYPES ---
export type UUID = string;

// --- USER & AUTH ---

export enum UserRole {
  MEMBER = 'member',
  PREMIUM_MEMBER = 'premium',
  CPA = 'cpa', // internal value used in DB; display name is "CPA"
  SUPPORT = 'support',
  ADMIN = 'admin',
  CLIENT = 'client',
}

export const UserRoleDisplayNames: Record<string, string> = {
  [UserRole.MEMBER]: 'Member',
  [UserRole.PREMIUM_MEMBER]: 'Premium Member',
  [UserRole.CPA]: 'CPA',
  [UserRole.SUPPORT]: 'Support',
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.CLIENT]: 'Client',
};

export interface Profile {
  id: string;
  email?: string | null;
  display_name?: string | null;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  role: UserRole;
  is_admin?: boolean;
  country?: string | null;
  currency?: string | null;
  phone?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type User = Profile;

export interface UserRoleMeta {
  role: UserRole;
  displayName: string;
  description: string;
  keyPermissions: string[];
}

export const UserRolesMeta: UserRoleMeta[] = [
  {
    role: UserRole.MEMBER,
    displayName: UserRoleDisplayNames[UserRole.MEMBER],
    description: 'The default role for all new users. Designed for personal use.',
    keyPermissions: [
      'Manage own financial data',
      'Access core bookkeeping & budgeting',
      'Use camera scanning & AI assistant for personal data',
      'Initiate CPA connection requests',
    ],
  },
  {
    role: UserRole.PREMIUM_MEMBER,
    displayName: UserRoleDisplayNames[UserRole.PREMIUM_MEMBER],
    description: 'An upgraded role for users who need more powerful tools.',
    keyPermissions: [
      'All Member permissions',
      'In-depth analytics & multi-year forecasting',
      'Advanced tax preparation summaries',
      'Export data to CSV/PDF',
      'Create custom categorization rules',
      'Set up scheduled reporting',
    ],
  },
  {
    role: UserRole.CPA,
    displayName: UserRoleDisplayNames[UserRole.CPA],
    description: 'A distinct account for accountants managing multiple clients.',
    keyPermissions: [
      'Access a dashboard of assigned clients',
      'Full financial management within segregated client workspaces',
      'Generate professional, brandable reports for clients',
      'Use secure messaging with clients',
    ],
  },
  {
    role: UserRole.SUPPORT,
    displayName: UserRoleDisplayNames[UserRole.SUPPORT],
    description: 'An internal role for troubleshooting and user assistance.',
    keyPermissions: [
      'Read-only access to specific user data (with explicit user consent)',
      'View transaction logs and system diagnostics',
      'Cannot modify any financial data',
    ],
  },
  {
    role: UserRole.ADMIN,
    displayName: UserRoleDisplayNames[UserRole.ADMIN],
    description: 'The highest-level internal role with full system oversight.',
    keyPermissions: [
      'Full access to the Admin Panel',
      'Manage all users and assign roles',
      'Access system health dashboards',
      'Manage feature flags',
      'Perform system-wide auditing',
      'Oversee all CPA-client connections',
    ],
  },
  {
    role: UserRole.CLIENT,
    displayName: UserRoleDisplayNames[UserRole.CLIENT],
    description: 'A client account managed by a CPA.',
    keyPermissions: [
      'View own financial data',
      'Interact with assigned CPA',
      'Receive professional reports',
      'Access secure messaging with CPA',
    ],
  },
];

// --- ACCOUNTS & FINANCIAL ---

export type AccountType = 'checking' | 'savings' | 'credit' | 'investment';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'SEK';

export interface Account {
  id: UUID;
  user_id: UUID;
  code?: string | number;
  name: string;
  type: AccountType;
  balance: number;
  currency: Currency;
}

// --- TRANSACTIONS ---

export type TransactionCategory =
  | 'income'
  | 'expense'
  | 'transfer'
  | 'investment'
  | 'tax'
  | 'refund'
  | 'fee'
  | 'other';

export type TransactionStatus = 'pending' | 'cleared' | 'cancelled' | 'scheduled';

export interface TransactionLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface Transaction {
  id: UUID;
  user_id: UUID;
  account_id: UUID;
  date: string; // ISO 8601
  // Backwards-compatible date fields sometimes returned by RPCs or legacy APIs
  transaction_date?: string;
  transactionDate?: string;
  description: string;
  amount: number;
  type: TransactionCategory;
  status: TransactionStatus;
  category?: string; // friendly category name used in UI
  category_id?: UUID | null;
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at?: string;
  merchant?: string;
  receipt_url?: string | null;
  location?: TransactionLocation | null;
  client_id?: UUID | null;
}

export type NewTransaction = Omit<Transaction, 'id' | 'created_at' | 'updated_at'>;

// --- PAGINATION ---

export interface PaginatedResponse<T> {
  data: T[];
  count: number | null;
  error: Error | null;
  page: number;
  pageSize: number;
  totalPages: number;
}

// --- BUDGETING ---

export interface Budget {
  id: UUID;
  user_id: UUID;
  category: string;
  allocated_amount: number;
  spent_amount: number;
  start_date: string;
  end_date: string;
}

// --- JOURNAL ENTRIES ---

export interface JournalEntryLine {
  id?: UUID;
  account_id: UUID;
  description?: string;
  debit_amount: number;
  credit_amount: number;
}

export type JournalEntryStatus = 'draft' | 'posted' | 'void';

export interface JournalEntry {
  id: UUID;
  date: string;
  description: string;
  client_id: UUID;
  entries: JournalEntryLine[];
  status: JournalEntryStatus;
  created_by: UUID;
  total_credit?: number;
  total_debit?: number;
  // Some UI code expects a legacy TOTAL object (e.g., TOTAL.DEBIT)
  TOTAL?: {
    DEBIT: number;
    CREDIT?: number;
  };
}

// --- FINANCIAL STATEMENTS ---

export interface LineItem {
  category: string;
  amount: number;
}

export type FinancialStatementType = 'profit_loss' | 'balance_sheet';

export interface FinancialStatement {
  id: UUID;
  type: FinancialStatementType;
  clientId: UUID;
  periodStart: string;
  periodEnd: string;
  // Data shape varies by statement type (profit_loss vs balance_sheet). Keep flexible.
  data: any;
  generatedAt: string;
  generatedBy: UUID;
}

// --- TAX ---

export interface TaxCategory {
  id: UUID;
  user_id: UUID;
  name: string;
  rate: number;
}

// --- AUDIT ---

export interface AuditTrail {
  id: UUID;
  user_id: UUID;
  action: string;
  details: Record<string, unknown>;
  timestamp: string;
}

// --- DASHBOARD ---

export type DashboardChangeType = 'positive' | 'negative';

export interface DashboardMetricItem {
  title: string;
  value: string;
  change: number;
  Icon: ComponentType<LucideProps>;
  changeType: DashboardChangeType;
}

// --- NOTIFICATIONS ---

export type NotificationType = 'info' | 'warning' | 'error' | 'success';

export interface Notification {
  id: UUID;
  user_id: UUID;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

// --- MESSAGING ---

export interface Conversation {
  id: UUID;
  name: string;
  avatar_url: string | null;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

export interface Message {
  id: UUID;
  conversation_id: UUID;
  user_id: UUID;
  text: string;
  created_at: string;
  sender: {
    display_name: string;
    avatar_url: string | null;
  };
}

// --- CPA & CLIENT DASHBOARD ---

export interface ClientDashboardMetrics {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
}

export interface ClientDashboardData {
  profile: Profile;
  metrics: ClientDashboardMetrics;
  recentTransactions: Transaction[];
}

export interface ClientListItem {
  id: UUID;
  name: string;
  email: string;
  avatarUrl: string | null;
  last_activity: string;
}
