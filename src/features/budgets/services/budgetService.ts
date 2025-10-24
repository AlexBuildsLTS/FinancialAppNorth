import { supabase } from '@/shared/lib/supabase';

interface CreateBudgetPayload {
  user_id: string;
  category: string;
  allocated: number;
  period: string;
}

export const createBudget = async (payload: CreateBudgetPayload) => {
  const { data, error } = await supabase
    .from('budgets')
    .insert([payload])
    .select();

  if (error) {
    throw error;
  }
  return data;
};

export const getCategories = async (userId: string) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
  return data;
};


export const getBudgets = async (userId: string) => {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
  return data;
};
