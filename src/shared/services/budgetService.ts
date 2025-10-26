// src/src/shared/services/budgetService.ts
import { supabase } from '@/shared/lib/supabase';


export interface CreateBudgetPayload {
  user_id: string;
  name: string;
  amount: number;
  currency?: string;
  period: string;
}

export const createBudget = async (payload: CreateBudgetPayload) => {
  const { data, error } = await supabase
    .from('budgets')
    .insert([{
      user_id: payload.user_id,
      name: payload.name,
      amount: payload.amount,
      currency: payload.currency ?? 'USD',
      period: payload.period,
    }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to create budget');
  }
  return data;
};

export const getBudgets = async (userId: string) => {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Failed to fetch budgets');
  }
  return data;
};

export const getCategories = async (userId: string) => {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message || 'Failed to fetch categories');
  }
  return data || [];
};  