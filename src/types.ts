import { Database } from './types/supabase';

// --- Supabase Helpers ---
// Convenience types for accessing table definitions
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// --- Enums ---
// Aligned with Database['public']['Enums']['user_role']
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
  // Metadata from profiles table
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
// Extends the raw DB row to include joined data (e.g. Category Name instead of just ID)
export interface Transaction extends Tables<'transactions'> {
  category?: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  } | null;
  // UI Helper: formatted amounts or dates can be added here if needed
}

// --- Feature: Documents ---
// Extends raw DB row with UI specific fields
export interface DocumentItem extends Tables<'documents'> {
  // Mapped fields for UI consistency
  name: string; // Mapped from file_name
  type: 'receipt' | 'invoice' | 'contract' | 'other'; // Derived from mime_type or categorization
  url: string; // Signed URL from storage
  date: string; // formatted created_at
  formattedSize: string; // e.g. "1.2 MB"
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
  spent: number; // Calculated field from transactions
  remaining: number; // Calculated
  percentage: number; // Calculated
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