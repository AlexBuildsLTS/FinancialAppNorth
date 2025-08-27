import React from 'react';
import { LucideProps } from 'lucide-react-native';

// --- CORE ENTITIES ---

// The single, definitive source of truth for a user's profile information.
export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  email: string;
  role: 'Member' | 'Premium Member' | 'Professional (CPA)' | 'Support' | 'Administrator' | 'Customer';
  storage_limit_mb?: number;
  api_keys?: { [key: string]: string };
}

// Represents a financial account.
export interface Account {
  id: string; user_id: string; name: string; type: 'checking' | 'savings' | 'credit' | 'investment'; balance: number; currency: 'USD' | 'EUR' | 'GBP' | 'SEK';
}

// Represents a single financial transaction.
export interface Transaction {
  id: string;
  user_id: string;
  account_id: string; // Changed from accountId to account_id
  title: string; // Added title
  description: string;
  amount: number;
  type: 'income' | 'expense';
  transaction_date: string;
  category: string;
  status: 'pending' | 'cleared' | 'cancelled';
  created_at: string;
  clientId?: string; // Added clientId, made optional as it might not always be present
  date: string; // Added date
  time: string; // Added time
  tags: string[]; // Added tags
  location: string; // Added location
}

// --- DATA STRUCTURES FOR FEATURES ---

export interface DashboardMetricItem {
  title: string;
  value: string;
  change: number;
  Icon: React.FC<LucideProps>;
  changeType: 'positive' | 'negative';
}

export interface DashboardMetrics {
    totalBalance: any;
    totalIncome: any;
    totalExpenses: any;
  totalRevenue: number; netProfit: number; expenses: number; cashBalance: number; revenueChange: number; profitChange: number;
}

export interface ClientDashboardData {
  profile: Profile; metrics: DashboardMetrics; recentTransactions: Transaction[];
}

export interface ClientListItem {
    id: string; name: string; email: string; avatarUrl: string; last_activity: string;
}

export interface DashboardHeaderProps {
  userName?: string;
  avatarUrl?: string | null;
  onPressProfile?: () => void;
  onPressMessages?: () => void;
  onPressSettings?: () => void;
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  is_read: boolean;
  created_at: string;
}

export interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  period: string;
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
  priority: string;
}

export interface Investment {
  id: string;
  name: string;
  type: string;
  value: number;
}

export interface Client {
  id: string;
  name: string;
  companyName: string;
  email: string;
  avatarUrl: string;
  status: string;
  netWorth: number;
  uncategorized: number;
}

export interface FixedAsset {
  id: string;
  name: string;
  value: number;
  purchaseDate: string;
  depreciationRate: number;
}

export interface Liability {
  id: string;
  name: string;
  amount: number;
  type: string;
  dueDate: string;
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
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  role: 'Member' | 'Premium Member' | 'Professional (CPA)' | 'Support' | 'Administrator' | 'Customer';
  status: 'Active' | 'Inactive';
}
