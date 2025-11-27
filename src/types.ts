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
export interface Transaction {
  id: string;
  user_id: string;
  account_id?: string;
  date: string;
  description: string;
  amount: number;
  // DB uses category_id, UI uses category (name)
  category_id?: string; 
  category?: string; 
  status: 'pending' | 'completed' | 'failed' | 'cleared';
  type: 'income' | 'expense';
  created_at?: string;
}

export interface DocumentItem {
  id: string;
  user_id: string;
  // DB columns
  file_name: string;
  file_path: string;
  size_bytes?: number;
  // UI helpers
  name: string; 
  type: 'receipt' | 'invoice' | 'contract' | 'other';
  url: string;
  date: string;
  size: string | number;
  tags?: string[];
}

// --- Chat & AI ---
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content_encrypted: string;
  is_system_message: boolean;
  created_at: string;
}

export interface ChatbotMessage {
  id: string;
  user_id: string;
  sender: 'user' | 'ai';
  text: string;
  created_at: string;
}

// --- Professional & Support ---
export interface CpaClient {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'pending';
  last_audit: string;
}