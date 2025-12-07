import { Database } from './types/supabase';

// Re-export common types from Supabase
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Legacy enums for backward compatibility
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
}

export interface AppSettings {
  currency: 'USD' | 'GBP' | 'EUR' | 'SEK' | 'JPY';
  country: string;
  theme: 'dark' | 'light';
  notifications: boolean;
}

// --- Features ---
export interface Transaction extends Tables<'transactions'> {
  category?: string; // UI helper
}

export interface DocumentItem extends Tables<'documents'> {
  // UI helpers
  name: string;
  type: 'receipt' | 'invoice' | 'contract' | 'other';
  url: string;
  date: string;
  size: string | number;
  tags?: string[];
}

// --- Chat & AI ---
export interface Message extends Tables<'messages'> {}

export interface ChatbotMessage extends Tables<'chatbot_messages'> {}

// --- Professional & Support ---
export interface CpaClient {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'pending';
  last_audit: string;
}

// --- Budget with computed fields ---
export interface BudgetWithSpent extends Tables<'budgets'> {
  category_name: string;
  spent: number;
}

// --- Financial Summary ---
export interface FinancialSummary {
  balance: number;
  income: number;
  expense: number;
  trend: { value: number }[];
}