import { Database } from './lib/database.types';

// Supabase Helpers
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

// --- CORE ENUMS ---
export enum UserRoleEnum {
  ADMIN = 'admin',
  CPA = 'cpa',
  PREMIUM = 'premium',
  MEMBER = 'member',
  SUPPORT = 'support'
}
export type UserRole = UserRoleEnum | 'owner' | 'viewer';
export type UserStatus = 'active' | 'banned' | 'suspended' | 'deactivated';

// --- AUTH ---
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

// --- TRANSACTIONS (FIXED) ---
// 1. We OMIT all fields that we want to redefine or make optional to prevent conflicts.
// 2. Added 'tax_category' to this list to fix your specific error.
export interface Transaction extends Omit<Tables<'transactions'>, 'category' | 'is_tax_deductible' | 'tax_category'> {
  merchant?: string | null;
  merchant_name?: string | null;
  
  // Allow category to be an object (frontend) or string (DB ID)
  category?: { id: string; name: string; icon?: string; color?: string } | string | null;
  
  // Safely optional booleans
  is_tax_deductible?: boolean; 
  
  // Safely optional strings (Fixes "Type 'undefined' is not assignable to 'string | null'")
  tax_category?: string | null;
}

// --- BUDGETS ---
export interface Budget {
  id: string;
  user_id: string;
  category: string;
  limit_amount: number;
  spent_amount: number;
  period: 'monthly' | 'weekly';
}

// --- TITAN 1: TAX ---
export enum TaxCategory {
  MARKETING = 'Marketing',
  TRAVEL = 'Travel',
  EQUIPMENT = 'Equipment',
  OFFICE_SUPPLIES = 'Office Supplies',
  PROFESSIONAL_SERVICES = 'Professional Services',
  MEALS = 'Meals',
  OTHER = 'Other'
}

// --- FINANCIAL SUMMARY ---
export interface FinancialSummary {
  balance: number;
  income: number;
  expense: number;
  savings_rate: number;
  trend: { date: string; value: number; label?: string }[];
}

// --- CHAT & AI ---
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string | Date;
}


export interface AppSettings {
  // Database fields
  id?: string;
  user_id?: string;
  
  // Preferences
  currency: 'USD' | 'GBP' | 'EUR' | 'SEK' | 'JPY' | string; // Stricter for better autocomplete
  country: string;
  language?: string;
  
  // UI Preferences (Good to have ready)
  theme?: 'dark' | 'light' | 'system';
  notifications?: boolean;
}