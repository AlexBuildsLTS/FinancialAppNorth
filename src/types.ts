import { Database } from './types/supabase';

// --- Supabase Helpers ---
// Convenience types for accessing table definitions
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// --- Enums ---
enum UserRoleEnum {
  ADMIN = 'admin',
  CPA = 'cpa',
  PREMIUM = 'premium',
  MEMBER = 'member',
  SUPPORT = 'support'
}

export type UserRole = UserRoleEnum | 'owner' | 'viewer'; // Merged from Organization types

export type UserStatus = 'active' | 'banned' | 'suspended' | 'deactivated';

// --- Auth & User ---
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  suspended_until?: string; // NEW FIELD
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
  is_tax_deductible?: boolean;
  tax_category?: TaxCategory;
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

// --- Feature: Subscription Detection ---
export interface DetectedSubscription {
  id: string;
  merchant: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'yearly';
  next_due: string;
  yearly_waste: number;
  confidence: number; // 0-1
  status: 'stable' | 'price_hike' | 'cancelled';
  previous_amount?: number;
  anomaly_detected_at?: string;
}

// --- Feature: Cash Flow Forecast ---
export interface CashFlowPoint {
  date: string;
  balance: number;
  is_forecast: boolean;
}


// --- Feature: Tax Report Summary ---
export interface TaxReportSummary {
  user_id: string;
  generated_at: string;
  total_deductible_amount: number;
  transaction_count: number;
  tax_categories_breakdown: Record<TaxCategory, number>;
  potential_savings: number;
  evidence_files: string[];
  transactions: any[]; // Loosely typed to avoid circular dep issues
} 




// --- Feature: Safe-to-Spend Metrics ---
export interface SafeSpendMetrics {
  daily_limit: number;
  days_until_payday: number;
  total_recurring_bills: number;
  average_daily_spending: number;
  risk_level: 'low' | 'medium' | 'high';
  next_payday: string;
}

// --- Feature: Voice Command Parsing ---
export interface ParsedVoiceCommand {
  amount: number;
  merchant: string;
  category: string;
  is_tax_deductible: boolean;
  confidence: number;
  raw_text: string;
}

// ==========================================
// 🏢 ENTERPRISE & ORGANIZATION TYPES
// ==========================================

export interface Organization {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  logo_url?: string;
}

export interface OrgMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joined_at: string;
}

export interface ExpenseRequest {
  id: string;
  organization_id: string;
  requester_id: string;
  amount: number;
  merchant: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  receipt_url?: string;
}

// ==========================================
// 🦅 INTELLIGENCE & TAX TYPES
// ==========================================

export interface DetectedSubscription {
  id: string;
  merchant: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'yearly'; // Corrected type
  status: 'stable' | 'price_hike' | 'cancelled'; // Corrected type
  next_due: string;
  yearly_waste: number;
  confidence: number;
  previous_amount?: number;
  anomaly_detected_at?: string;
}

export enum TaxCategory {
  MARKETING = 'Marketing',
  TRAVEL = 'Travel',
  EQUIPMENT = 'Equipment',
  OFFICE_SUPPLIES = 'Office Supplies',
  PROFESSIONAL_SERVICES = 'Professional Services',
  MEALS = 'Meals',
  OTHER = 'Other'
}

export interface TaxReportSummary {
  user_id: string;
  generated_at: string;
  total_deductible_amount: number;
  transaction_count: number;
  tax_categories_breakdown: Record<TaxCategory, number>;
  potential_savings: number;
  evidence_files: string[];
  transactions: any[]; // Loosely typed to avoid circular dep issues
}