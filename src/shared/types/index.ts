import React from 'react';
import type { LucideProps } from 'lucide-react-native';

// --- UTILITY TYPES ---
type UUID = string;

// Union type for supported currencies
export type Currency = 'USD' | 'EUR' | 'GBP' | 'SEK';

// Standardized date type
type ISODateString = string;

// --- AUTH & USERS ---

// 1. UserRole: Kept your string union approach (Best for Supabase)
export type UserRole = 'member' | 'premium' | 'cpa' | 'support' | 'admin' | 'client';

export const UserRoleDisplayNames: Record<UserRole, string> = {
  member: 'Member',
  premium: 'Premium Member',
  cpa: 'Professional (CPA)',
  support: 'Support',
  admin: 'Administrator',
  client: 'Client',
};

export type UserStatus = 'active' | 'suspended' | 'banned';

// 2. Profile: The Source of Truth (Matches Database Schema + Generated Column)
export interface Profile {
  id: UUID;
  email: string; // Made required (Supabase users always have email)
  full_name?: string; // Generated column
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_url: string | null;
  role: UserRole;
  status?: UserStatus;
  created_at?: string;
  updated_at?: string;
}

// Legacy alias support
export type User = Profile;

export interface ThemeColors {
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  error: string;
  warning: string;
  success: string;
  border: string;
}

// --- FINANCIAL & ACCOUNTING ---

export interface Account {
  code?: string;
  id: UUID;
  user_id: UUID;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: Currency;
}

// 3. Transaction: Merged your strict definition with the Dashboard requirements
export interface Transaction {
  id: UUID;
  user_id: UUID;
  account_id: UUID;
  category_id?: UUID;
  document_id?: UUID;
  description?: string;
  amount: number;
  type: 'income' | 'expense';
  date: ISODateString; // UI uses this
  transaction_date: ISODateString; // Database uses this
  status: 'pending' | 'cleared' | 'cancelled' | 'reconciled';
  category: string; // Join result (category name)
  created_at: ISODateString;
}

export interface Budget {
  id: UUID;
  user_id: UUID;
  category: string;
  allocated_amount: number;
  spent_amount: number;
  start_date: ISODateString;
  end_date: ISODateString;
}

export interface JournalEntryLine {
  id?: UUID;
  account_id: UUID;
  description?: string;
  debit_amount: number;
  credit_amount: number;
}

export interface JournalEntry {
  id: UUID;
  date: ISODateString;
  description: string;
  client_id: UUID;
  entries: JournalEntryLine[];
  status: 'draft' | 'posted' | 'void';
  created_by: UUID;
}

export interface LineItem {
  category: string;
  amount: number;
}

export interface FinancialStatement {
  id: string;
  type: 'profit_loss' | 'balance_sheet';
  clientId: string;
  periodStart: ISODateString;
  periodEnd: ISODateString;
  data: LineItem[];
  generatedAt: ISODateString;
  generatedBy: string;
}

export interface TaxCategory {
  id: UUID;
  user_id: UUID;
  name: string;
  rate: number;
}

export interface AuditTrail {
  id: UUID;
  user_id: UUID;
  action: string;
  details: Record<string, unknown>;
  timestamp: ISODateString;
}

// --- DASHBOARD (UPDATED FOR CHARTS) ---

export interface DashboardMetricItem {
  id: string;
  label: string;
  value: number;
  icon: React.ReactElement<LucideProps>;
  format: (value: number | null | undefined, locale?: string, currency?: string) => string;
}

// 4. DashboardMetrics: Added the Chart Data types you were missing
export interface DashboardMetrics {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsGoal?: number;
  currentBudget?: number;
  totalBudget?: number;
  
  // Chart Data Arrays (Required for the new Glass Dashboard)
  incomeChartData: { value: number; label: string }[];
  expenseChartData: { value: number; label: string }[];
  budgetAllocation: { value: number; color: string; text: string; category: string; amount: number }[];
  
  recentTransactions: Transaction[];
  budgets: any[]; // Flexible to prevent crash if backend sends different shape
}

export interface BudgetItemData {
  category: string;
  spent: number;
  budget: number;
}

// --- APP-SPECIFIC ---

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  is_read: boolean;
  created_at: ISODateString;
}

export interface Category {
  id: UUID;
  user_id: UUID;
  name: string;
  type: 'income' | 'expense';
}

export interface Conversation {
  id: string;
  name: string;
  avatar_url: string | null;
  lastMessage: string;
  timestamp: ISODateString;
  unread: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  text: string;
  created_at: ISODateString;
  sender: {
    display_name: string;
    avatar_url: string | null;
  };
}

// --- CPA & CLIENT-SPECIFIC ---

export interface ClientDashboardData {
  profile: Profile;
  metrics: {
    totalBalance: number;
    totalIncome: number;
    totalExpenses: number;
  };
  recentTransactions: Transaction[];
}

export interface ClientListItem {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  last_activity: ISODateString;
}

export interface CPAProfile extends Profile {
  // CPA specific fields
}

export interface ClientProfile extends Profile {
  // Client specific fields
}

export interface SupportTicket {
  id: UUID;
  user_id: UUID;
  title: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: ISODateString;
  updated_at: ISODateString;
  assigned_to_id: UUID | null;
}

export interface SupportMessage {
  id: UUID;
  ticket_id: UUID;
  user_id: UUID;
  message: string;
  created_at: ISODateString;
  internal: boolean;
}

export interface Document {
  id: UUID;
  user_id: UUID;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  file_size: number | null;
  status: 'processing' | 'processed' | 'error';
  processed_data: Record<string, unknown> | null;
  created_at: ISODateString;
}