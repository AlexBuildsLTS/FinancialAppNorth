// src/types/index.ts

import { LucideProps } from 'lucide-react-native';
import React from 'react';

// --- AUTH & USERS ---
export enum UserRole {
  MEMBER = 'Member',
  PREMIUM_MEMBER = 'Premium Member',
  CPA = 'Professional (CPA)',
  SUPPORT = 'Support',
  ADMIN = 'Administrator',
}

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  email: string;
  role: UserRole;
}

// --- FINANCIAL ---
export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'SEK';
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  transaction_date: string;
  category: string;
  status: 'pending' | 'cleared' | 'cancelled';
  created_at: string;
  tags?: string[];
  location?: string;
  client_id?: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  allocated_amount: number;
  spent_amount: number;
  start_date: string;
  end_date: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  name: string;
  avatar: string | null;
  lastMessage: string;
  timestamp: string;
  unread: number;
}