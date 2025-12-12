import { Database } from './types/supabase';

// --- Supabase Helpers ---
// Convenience types for accessing table definitions
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// --- Enums ---
export enum UserRole {
  ADMIN = 'admin',
  CPA = 'cpa',
  PREMIUM = 'premium',
  MEMBER = 'member',
  SUPPORT = 'support'
}

export type UserStatus = 'active' | 'banned' | 'deactivated';

// --- Auth & User ---
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  currency?: string;
  country?: string;
  last_login?: string;
}

export interface AppSettings {
  currency: 'USD' | 'GBP' | 'EUR' | 'SEK' | 'JPY';
  country: string;
  theme: 'dark' | 'light';
  notifications: boolean;
  language?: string;
}

// --- Feature: Transactions ---
export interface Transaction extends Tables<'transactions'> {
  category?: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  } | null;
}

// --- Feature: Documents ---
export interface DocumentItem extends Tables<'documents'> {
  name: string;
  type: 'receipt' | 'invoice' | 'contract' | 'other';
  url: string;
  date: string;
  formattedSize: string;
}

// --- Feature: Chat & AI ---
export interface Message extends Tables<'messages'> {
  sender?: {
    name: string;
    avatar?: string;
  };
}

export interface ChatbotMessage extends Tables<'chatbot_messages'> {}

// --- Feature: Professional & Support ---
export interface CpaClient {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'pending';
  last_audit: string;
  permissions?: Record<string, boolean>;
}

// --- Feature: Budgets ---
export interface BudgetWithSpent extends Tables<'budgets'> {
  category_name: string;
  category_color?: string;
  spent: number;
  remaining: number;
  percentage: number;
}

// --- Feature: Financial Summary ---
export interface FinancialSummary {
  balance: number;
  income: number;
  expense: number;
  savings_rate?: number;
  trend: { 
    date: string; 
    value: number;
    label?: string;
  }[];
}

// --- Feature: Notifications ---
export interface NotificationItem {
  id: string;
  user_id: string;
  created_by?: string;
  title: string;
  message: string;
  type: 'ticket' | 'cpa' | 'message' | 'system';
  is_read: boolean;
  created_at: string;
  related_id?: string;
}