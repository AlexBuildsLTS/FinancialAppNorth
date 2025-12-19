import { Database } from './lib/database.types';

// --- 1. SUPABASE HELPERS ---
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// --- 2. CORE ENUMS ---
export enum UserRoleEnum {
  ADMIN = 'admin',
  CPA = 'cpa',
  PREMIUM = 'premium',
  MEMBER = 'member',
  SUPPORT = 'support'
}
export type UserRole = UserRoleEnum | 'owner' | 'viewer';
export type UserStatus = 'active' | 'banned' | 'suspended' | 'deactivated';

// --- 3. AUTH & USER ---
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  currency?: string;
  country?: string;
  suspended_until?: string; 
}

// ✅ APP SETTINGS
export interface AppSettings {
  id?: string;
  user_id?: string;
  currency: string;
  country: string;
  theme?: 'dark' | 'light' | 'system';
  notifications?: boolean;
  language?: string;
}

// --- 4. FINANCIAL CORE ---

export enum TaxCategory {
  MARKETING = 'Marketing',
  TRAVEL = 'Travel',
  EQUIPMENT = 'Equipment',
  OFFICE_SUPPLIES = 'Office Supplies',
  PROFESSIONAL_SERVICES = 'Professional Services',
  MEALS = 'Meals',
  OTHER = 'Other'
}

// Transaction: Hybrid of DB row + Frontend UI fields
export interface Transaction extends Omit<Tables<'transactions'>, 'category' | 'is_tax_deductible' | 'tax_category'> {
  merchant?: string | null;
  merchant_name?: string | null;
  category?: { id: string; name: string; icon?: string; color?: string } | string | null;
  is_tax_deductible?: boolean; 
  tax_category?: string | null;
}

export type Budget = Tables<'budgets'>;

export interface BudgetWithSpent extends Budget {
  category_name: string;
  category_color?: string;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface FinancialSummary {
  balance: number;
  income: number;
  expense: number;
  savings_rate?: number; // Optional to prevent crash on empty states
  trend: { date: string; value: number; label?: string }[];
}

// --- 5. TITAN 2: INTELLIGENCE ---

export interface DetectedSubscription {
  id: string;
  merchant: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'yearly';
  status: 'stable' | 'price_hike' | 'cancelled';
  next_billing_date: string; 
  yearly_waste: number;
  confidence: number;
  
  // UI Fields (Added to fix 'Property does not exist' errors)
  name?: string; 
  next_due?: string; 
  
  // Database fields made optional for AI-generated items
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  previous_amount?: number | null;
  anomaly_detected_at?: string | null;
}

export interface ParsedVoiceCommand {
  commandType: any;
  parameters: Record<string, any>;
  amount: number;
  description: string;
  category?: string;
  date?: Date;
  merchant?: string;
  is_tax_deductible?: boolean;
  confidence?: number;
  raw_text?: string;
}

// --- 6. TITAN 3: PROFESSIONAL PORTAL ---

export interface CpaClient {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'pending' | 'rejected';
  last_audit?: string;
  permissions?: Record<string, boolean>;
  
  // Database fields made optional for UI-mapped objects
  cpa_id?: string;
  client_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TaxReportSummary {
  user_id: string; // ✅ Fixed: Added user_id
  generated_at: string;
  total_deductible_amount: number;
  transaction_count: number;
  tax_categories_breakdown: Record<string, number>;
  potential_savings: number;
  evidence_files: string[];
  transactions: any[];
  
  // Optional extras
  total_non_deductible_amount?: number;
}

// --- 7. ENTERPRISE & ORGANIZATION ---

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

export interface ExpenseRequest extends Tables<'expense_requests'> {
  requester?: {
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
}

// --- 8. MESSAGING & NOTIFICATIONS ---

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content_encrypted: string;
  created_at: string;
  is_system_message: boolean;
  attachment_url?: string;
  attachment_type?: string;
  
  // UI Helper
  sender?: {
    name: string;
    avatar?: string;
  };
  text?: string; 
  timestamp?: string | Date; 
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'ticket' | 'cpa' | 'message' | 'system' | string | null;
  is_read: boolean;
  created_at: string;
  related_id?: string;
  created_by?: string;
  data?: any;
}

export interface ChatbotMessage {
  id: string;
  user_id: string;
  sender: 'user' | 'ai';
  text: string;
  created_at: string | null;
}

// --- 9. DOCUMENTS ---
export interface DocumentItem {
  // Base document fields from DB
  id: string;
  user_id: string;
  transaction_id: string | null;
  file_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  status: 'scanning' | 'processed' | 'failed' | 'verified' | null;
  created_at: string | null;
  // Make extracted_data optional (DB has it as Json | null, we make it optional)
  extracted_data?: any;
  // UI helper fields
  name: string;
  formattedSize: string;
  date: string;
  type: 'receipt' | 'invoice' | 'contract' | 'other';
  url: string | null;
}

// --- 10. EXTRAS ---
export interface SafeSpendMetrics {
  safeToSpend: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  emergencyFund: number;
  daysUntilPayday: number;
  daily_limit?: number; // Alternative name for safeToSpend
  days_until_payday?: number; // Alternative name for daysUntilPayday
  total_recurring_bills?: number;
  average_daily_spending?: number;
  risk_level?: 'low' | 'medium' | 'high';
  next_payday?: string;
}

export interface CashFlowPoint {
  date: string;
  value: number;
  label?: string;
  is_forecast?: boolean;
}
