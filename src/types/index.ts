import React from 'react';
import { LucideProps } from 'lucide-react-native';

// --- CORE ENTITIES ---

// The single, definitive source of truth for a user's profile information.
export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  email: string;
  role: 'Member' | 'Premium Member' | 'Professional (CPA)' | 'Support' | 'Administrator';
  storage_limit_mb?: number;
  api_keys?: { [key: string]: string };
}

// Represents a financial account.
export interface Account {
  id: string; user_id: string; name: string; type: 'checking' | 'savings' | 'credit' | 'investment'; balance: number; currency: 'USD' | 'EUR' | 'GBP' | 'SEK';
}

// Represents a single financial transaction.
export interface Transaction {
  id: string; user_id: string; account_id: string; description: string; amount: number; type: 'income' | 'expense'; transaction_date: string; category: string; status: 'pending' | 'cleared' | 'cancelled'; created_at: string;
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