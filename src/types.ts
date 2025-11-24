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
  currency: 'USD' | 'GBP' | 'EUR' | 'SEK';
  country: string;
  theme: 'dark' | 'light';
  notifications: boolean;
}

// --- Features ---
export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  status: 'pending' | 'completed' | 'failed';
  type: 'income' | 'expense'; // Critical for dashboard calculations
}

export interface DocumentItem {
  id: string;
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
  chat_id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

export interface Chat {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ChatbotMessage {
  id: string;
  user_id: string;
  sender: 'user' | 'ai';
  text: string;
  created_at: string;
}

export interface AiResponse {
  id: string;
  message: string;
  created_at: string;
}

// --- Professional & Support ---
export interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'closed' | 'pending';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface CpaClient {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'pending';
  last_audit: string;
}