import { supabase } from '../lib/supabase';
import { Transaction, TablesInsert, TablesUpdate } from '../types';

export class TransactionService {
  /**
   * Get all transactions for a user with category names
   */
  static async getTransactions(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, categories(name)')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }

    return data.map((t: any) => ({
      ...t,
      category: t.categories?.name || 'Uncategorized'
    }));
  }

  /**
   * Create a new transaction
   */
  static async createTransaction(transaction: Partial<Transaction>, userId: string) {
    try {
      // Ensure Account Exists
      const accountId = await this.getDefaultAccountId(userId);

      // Resolve Category ID
      let categoryId = transaction.category_id;
      if (!categoryId && transaction.category) {
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .eq('name', transaction.category)
          .limit(1)
          .maybeSingle();

        if (cat) {
          categoryId = cat.id;
        } else {
          // Create category if missing
          const { data: newCat } = await supabase
            .from('categories')
            .insert({ name: transaction.category, type: 'expense', user_id: userId, icon: 'tag' })
            .select()
            .single();
          if (newCat) categoryId = newCat.id;
        }
      }

      let finalAmount = Number(transaction.amount || 0);
      if (transaction.type === 'expense') {
        finalAmount = -Math.abs(finalAmount);
      } else {
        finalAmount = Math.abs(finalAmount);
      }

      const insertData: TablesInsert<'transactions'> = {
        user_id: userId,
        account_id: accountId,
        category_id: categoryId,
        amount: finalAmount,
        date: transaction.date || new Date().toISOString().split('T')[0],
        description: transaction.description,
        payee: transaction.payee,
        status: transaction.status || 'cleared',
        type: transaction.type || (finalAmount >= 0 ? 'income' : 'expense'),
        metadata: transaction.metadata || {}
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error("Create Transaction Error:", err.message);
      throw err;
    }
  }

  /**
   * Update an existing transaction
   */
  static async updateTransaction(id: string, updates: TablesUpdate<'transactions'>) {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a transaction
   */
  static async deleteTransaction(id: string) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Get transactions with pagination and filtering
   */
  static async getTransactionsPaginated(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      categoryId?: string;
      dateFrom?: string;
      dateTo?: string;
      type?: 'income' | 'expense' | 'transfer';
      search?: string;
    } = {}
  ) {
    let query = supabase
      .from('transactions')
      .select('*, categories(name)', { count: 'exact' })
      .eq('user_id', userId);

    if (options.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }

    if (options.dateFrom) {
      query = query.gte('date', options.dateFrom);
    }

    if (options.dateTo) {
      query = query.lte('date', options.dateTo);
    }

    if (options.type) {
      query = query.eq('type', options.type);
    }

    if (options.search) {
      query = query.or(`description.ilike.%${options.search}%,payee.ilike.%${options.search}%`);
    }

    query = query
      .order('date', { ascending: false })
      .range(options.offset || 0, (options.offset || 0) + (options.limit || 50) - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      transactions: data.map((t: any) => ({
        ...t,
        category: t.categories?.name || 'Uncategorized'
      })),
      total: count || 0
    };
  }

  /**
   * Get default account ID for user, creating one if needed
   */
  private static async getDefaultAccountId(userId: string): Promise<string> {
    try {
      const { data: accounts } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (accounts && accounts.length > 0) {
        return accounts[0].id;
      }

      // Create default account if none exists
      const { data: newAccount, error } = await supabase
        .from('accounts')
        .insert([{
          user_id: userId,
          name: 'Main Wallet',
          type: 'cash',
          currency: 'USD',
          balance: 0
        }])
        .select()
        .single();

      if (error) throw error;
      return newAccount.id;
    } catch (e: any) {
      console.error("Account Init Error:", e.message);
      throw e;
    }
  }
}