import React from 'react';
import type { LucideProps } from 'lucide-react-native';

// --- UTILITY TYPES ---
type UUID = string;

// Union type for supported currencies to prevent typos
type Currency = 'USD' | 'EUR' | 'GBP' | 'SEK';

// Standardized date type to avoid confusion (ISO string format)
type ISODateString = string;

// --- AUTH & USERS ---

// REFACTORED: Use programmatic keys for logic. This is more robust and aligns with database values.
export enum UserRole {
  MEMBER = 'member',
  PREMIUM_MEMBER = 'premium',
  CPA = 'cpa',
  SUPPORT = 'support',
  ADMIN = 'admin',
  CLIENT = 'client', // Assuming this is also a role
}

// NEW: A mapping to get human-readable names for UI display.
export const UserRoleDisplayNames: { [key in UserRole]: string } = {
  [UserRole.MEMBER]: 'Member',
  [UserRole.PREMIUM_MEMBER]: 'Premium Member',
  [UserRole.CPA]: 'Professional (CPA)',
  [UserRole.SUPPORT]: 'Support',
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.CLIENT]: 'Client',
};

// Base status type for reusability
type UserStatus = 'active' | 'suspended' | 'banned';

export interface Profile {
  full_name: string;
  status?: UserStatus; // Made optional with explicit type, handle undefined explicitly in code
  id: UUID; // This is the user's UUID from auth.users
  display_name: string; // Kept original naming to match database schema
  first_name?: string; // Added first_name
  last_name?: string; // Added last_name
  avatar_url: string | null; // Kept original naming to match database schema
  email?: string; // Email is often retrieved from the session user, can be optional here
  role: UserRole; // Uses our robust enum
}

export type User = Profile;

// --- FINANCIAL & ACCOUNTING ---

export interface Account {
  code: string; // Replaced 'any' with string, assuming account code is alphanumeric
  id: UUID;
  user_id: UUID; // Kept original naming to match database schema
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: Currency; // Use defined union type
}

export interface Transaction {
  category: string;
  date: ISODateString; // Standardized  
  id: UUID;
  user_id: UUID;
  account_id: UUID;
  category_id?: UUID;
  document_id?: UUID;
  description?: string;
  amount: number;
  type: 'income' | 'expense';
  transaction_date: ISODateString;
  status: 'pending' | 'cleared' | 'cancelled';
  created_at: ISODateString;
}

export interface Budget {
  amount: any;
  spent: any;
  id: UUID;
  user_id: UUID; // Kept original naming
  category: string;
  allocated_amount: number; // Removed redundant 'amount: any', use this field
  spent_amount: number; // Removed redundant 'spent: any', use this field
  start_date: ISODateString; // Standardized
  end_date: ISODateString;
}

export interface JournalEntryLine {
  id?: UUID;
  account_id: UUID; // Kept original naming
  description?: string;
  debit_amount: number; // Kept original naming
  credit_amount: number;
}

export interface JournalEntry {
  id: UUID;
  date: ISODateString; // Standardized
  description: string;
  client_id: UUID;
  entries: JournalEntryLine[];
  status: 'draft' | 'posted' | 'void';
  created_by: UUID; // Standardized
  // Removed 'TOTAL: any' and 'total_credit: any' as they seem like computed fields not part of the interface
}

export interface LineItem {
  category: string;
  amount: number;
}

export interface FinancialStatement {
  id: string;
  type: 'profit_loss' | 'balance_sheet';
  clientId: string; // Already camelCase, kept consistent
  periodStart: ISODateString; // Standardized
  periodEnd: ISODateString;
  data: LineItem[];
  generatedAt: ISODateString; // Standardized
  generatedBy: string;
}

export interface TaxCategory {
  id: UUID;
  user_id: UUID; // Kept original naming
  name: string;
  rate: number;
}

export interface AuditTrail {
  id: UUID;
  user_id: UUID; // Kept original naming
  action: string;
  details: Record<string, any>; // Kept as is, but consider more specific typing if possible
  timestamp: ISODateString; // Standardized
}

// --- DASHBOARD ---
export interface DashboardMetricItem {
  title: string;
  value: string;
  change?: number;
  Icon: React.ComponentType<LucideProps>; // Kept React import since it's used
  changeType?: 'positive' | 'negative';
}

// --- APP-SPECIFIC ---
export interface Notification {
  id: string;
  user_id: string; // Kept original naming
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  is_read: boolean; // Kept original naming
  created_at: ISODateString; // Standardized
}

export interface Conversation {
  id: string;
  name: string;
  avatar_url: string | null; // Kept original naming
  lastMessage: string;
  timestamp: ISODateString; // Standardized
  unread: number;
}

export interface Message {
  id: string;
  conversation_id: string; // Kept original naming
  user_id: string;
  text: string;
  created_at: ISODateString; // Standardized
  sender: { display_name: string; avatar_url: string | null }; // Kept original naming
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
  avatarUrl: string | null; // Inconsistent with database, but kept as-is for compatibility
  last_activity: ISODateString; // Standardized
}

export interface CPAProfile extends Profile {
  // Inherits all fields from Profile, role is already CPA
}

export interface ClientProfile extends Profile {
  // Inherits all fields from Profile, role is already CLIENT
}

export interface SupportTicket {
  id: UUID;
  user_id: UUID; // Kept original naming
  title: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: ISODateString; // Standardized
  updated_at: ISODateString;
  assigned_to_id: UUID | null; // Standardized
}

export interface SupportMessage {
  id: UUID;
  ticket_id: UUID; // Kept original naming
  user_id: UUID;
  message: string;
  created_at: ISODateString; // Standardized
  internal: boolean; // True if it's an internal note, false if it's a message to the client
}

export interface Document {
  id: UUID;
  user_id: UUID; // Kept original naming
  file_name: string; // Standardized
  storage_path: string; // Standardized
  mime_type: string | null; // Standardized
  file_size: number | null;
  status: 'processing' | 'processed' | 'error';
  processed_data: Record<string, any> | null; // Kept as is, consider more specific typing
  created_at: ISODateString; // Standardized
}

// Removed erroneous 'export default Document;' as Document is an interface, not a default export
