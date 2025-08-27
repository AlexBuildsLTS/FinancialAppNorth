import { supabase } from '@/lib/supabase';
import { Transaction, Account, Budget, Goal, Investment, Client, FixedAsset, Liability } from '@/types';

// Real service functions using Supabase
export async function getAccounts(): Promise<Account[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching accounts:', error);
    return [];
  }

  return (data || []).map(account => ({
    id: account.id,
    user_id: account.user_id,
    name: account.name,
    type: account.type,
    balance: parseFloat(account.balance),
    currency: account.currency,
  }));
}

export async function getTransactions(userId?: string): Promise<Transaction[]> {
  const { data: { user } } = await supabase.auth.getUser();
  const targetUserId = userId || user?.id;
  if (!targetUserId) return [];

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', targetUserId)
    .order('transaction_date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return (data || []).map(tx => ({
    id: tx.id,
    user_id: tx.user_id,
    account_id: tx.account_id,
    title: tx.title,
    description: tx.description,
    category: tx.category,
    amount: parseFloat(tx.amount),
    transaction_date: tx.transaction_date,
    type: tx.type,
    status: tx.status,
    created_at: tx.created_at,
    clientId: tx.user_id,
    date: tx.transaction_date,
    time: tx.transaction_time,
    tags: tx.tags,
    location: tx.location,
  }));
}

export async function getBudgets(): Promise<Budget[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching budgets:', error);
    return [];
  }

  return (data || []).map(budget => ({
    id: budget.id,
    category: budget.category,
    allocated: parseFloat(budget.allocated_amount),
    spent: parseFloat(budget.spent_amount),
    period: budget.period,
    startDate: budget.start_date,
    endDate: budget.end_date,
  }));
}

export async function getGoals(): Promise<Goal[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching goals:', error);
    return [];
  }

  return (data || []).map(goal => ({
    id: goal.id,
    title: goal.title,
    description: goal.description,
    targetAmount: parseFloat(goal.target_amount),
    currentAmount: parseFloat(goal.current_amount),
    targetDate: goal.target_date,
    category: goal.category,
    priority: goal.priority,
  }));
}

export async function getInvestments(): Promise<Investment[]> {
  // This would be implemented when investment tracking is added
  return [];
}

export async function createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      account_id: transaction.account_id,
      title: transaction.title,
      description: transaction.description,
      category: transaction.category,
      amount: transaction.amount,
      transaction_date: transaction.date,
      transaction_time: transaction.time,
      type: transaction.type,
      status: transaction.status,
      tags: transaction.tags,
      location: transaction.location,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    user_id: data.user_id,
    account_id: data.account_id,
    title: data.title,
    description: data.description,
    category: data.category,
    amount: parseFloat(data.amount),
    transaction_date: data.transaction_date,
    type: data.type,
    status: data.status,
    created_at: data.created_at,
    clientId: data.user_id,
    date: data.transaction_date,
    time: data.transaction_time,
    tags: data.tags,
    location: data.location,
  };
}

export async function updateBudget(budgetId: string, updates: Partial<Budget>): Promise<Budget> {
  const { data, error } = await supabase
    .from('budgets')
    .update({
      category: updates.category,
      allocated_amount: updates.allocated,
      spent_amount: updates.spent,
      period: updates.period,
      start_date: updates.startDate,
      end_date: updates.endDate,
    })
    .eq('id', budgetId)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    category: data.category,
    allocated: parseFloat(data.allocated_amount),
    spent: parseFloat(data.spent_amount),
    period: data.period,
    startDate: data.start_date,
    endDate: data.end_date,
  };
}

// Client management functions (for CPAs)
export async function getClients(): Promise<Client[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get assigned clients for CPAs
  const { data, error } = await supabase
    .from('client_assignments')
    .select(`
      status,
      client:profiles!client_assignments_client_id_fkey (
        id,
        display_name,
        avatar_url,
        email,
        role
      )
    `)
    .eq('cpa_id', user.id)
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching clients:', error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.client?.[0]?.id || '', // Safely access id, provide default empty string
    name: item.client?.[0]?.display_name || '', // Safely access display_name, provide default empty string
    companyName: item.client?.[0]?.display_name || '', // Using display name as company name, provide default empty string
    email: item.client?.[0]?.email || '', // Safely access email, provide default empty string
    avatarUrl: item.client?.[0]?.avatar_url || `https://i.pravatar.cc/150?u=${item.client?.[0]?.id || ''}`, // Safely access avatar_url, provide default empty string
    status: item.status,
    netWorth: 0, // This would be calculated from actual financial data
    uncategorized: 0, // This would be calculated from uncategorized transactions
  }));
}

export async function getClientById(id: string): Promise<Client | undefined> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching client:', error);
    return undefined;
  }

  return {
    id: data.id,
    name: data.display_name,
    companyName: data.display_name,
    email: data.email,
    avatarUrl: data.avatar_url || `https://i.pravatar.cc/150?u=${data.id}`,
    status: 'active',
    netWorth: 0,
    uncategorized: 0,
  };
}

export async function getBalanceSheetData(clientId: string): Promise<{ accounts: Account[], assets: FixedAsset[], liabilities: Liability[] }> {
  const accounts = await getAccounts();
  // For now, return empty arrays for assets and liabilities
  // These would be implemented when the full accounting system is built
  return {
    accounts,
    assets: [],
    liabilities: [],
  };
}

export async function createClient(clientData: Omit<Client, 'id'|'avatarUrl'>): Promise<Client> {
  // This would typically be handled through user registration
  // For now, return a mock implementation
  throw new Error('Client creation should be handled through user registration');
}
