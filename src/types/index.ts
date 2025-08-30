import React from 'react';
import { LucideProps } from 'lucide-react-native';
// src/types/index.ts


// --- AUTH & USERS ---
export enum UserRole {
    MEMBER = 'Member',
    PREMIUM_MEMBER = 'Premium Member',
    CPA = 'Professional (CPA)',
    SUPPORT = 'Support',
    ADMIN = 'Administrator',
    CLIENT = "CLIENT",
}

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  email: string;
  role: UserRole;
}

// --- FINANCIAL & ACCOUNTING ---
type UUID = string;

export interface Account {
  code: any;
  id: UUID;
  user_id: UUID;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'SEK';
}

export interface Transaction {
  date: string | number | Date;
  id: UUID;
  user_id: UUID;
  account_id: UUID;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  transaction_date: string;
  category: string;
  status: 'pending' | 'cleared' | 'cancelled';
  created_at: string;
  tags?: string[];
  location?: string;
  client_id?: UUID;
}

export interface Budget {
  amount: any;
  spent: any;
  id: UUID;
  user_id: UUID;
  category: string;
  allocated_amount: number;
  spent_amount: number;
  start_date: string;
  end_date: string;
}

export interface JournalEntryLine {
  id?: UUID;
  account_id: UUID;
  description?: string;
  debit_amount: number;
  credit_amount: number;
}

export interface JournalEntry {
  TOTAL: any;
  total_credit: any;
  id: UUID;
  date: string;
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
  periodStart: string;
  periodEnd: string;
  data: LineItem[];
  generatedAt: string;
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
    details: Record<string, any>;
    timestamp: string;
}

// --- DASHBOARD ---
export interface DashboardMetricItem {
  title: string;
  value: string;
  change: number;
  Icon: React.ComponentType<LucideProps>;
  changeType: 'positive' | 'negative';
}

// --- APP-SPECIFIC ---
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  name: string;
  avatar: string | null;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  text: string;
  created_at: string;
  sender: { display_name: string };
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
  last_activity: string;
}