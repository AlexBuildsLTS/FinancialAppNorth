import { supabase } from '../lib/supabase';
import { BudgetWithSpent, TablesInsert, TablesUpdate } from '../types';

export class BudgetService {
  /**
   * Get all budgets for a user with spent amounts
   */
  static async getBudgets(userId: string): Promise<BudgetWithSpent[]> {
    const { data: budgets, error } = await supabase
      .from('budgets')
      .select('*, categories(name)')
      .eq('user_id', userId);

    if (error) {
      console.error("Get Budgets Error:", error);
      throw error;
    }

    // Get transactions for spent calculation
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, category_id')
      .eq('user_id', userId)
      .lt('amount', 0); // Only expenses

    return budgets.map((b: any) => {
      const categoryName = b.categories?.name || 'Unknown';
      const spent = transactions
        ?.filter((t: any) => t.category_id === b.category_id)
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0) || 0;

      return {
        ...b,
        category_name: categoryName,
        spent
      };
    });
  }

  /**
   * Create a new budget
   */
  static async createBudget(
    userId: string,
    categoryName: string,
    amount: number,
    period: string = 'monthly',
    startDate?: string
  ) {
    let categoryId: string | undefined;

    // Find existing category
    const { data: existingCats } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .or(`user_id.eq.${userId},user_id.is.null`)
      .limit(1);

    if (existingCats && existingCats.length > 0) {
      categoryId = existingCats[0].id;
    } else {
      // Create category if missing
      const { data: newCat, error: catError } = await supabase
        .from('categories')
        .insert({ name: categoryName, type: 'expense', user_id: userId, icon: 'tag' })
        .select()
        .single();

      if (catError) throw new Error(`Category creation failed: ${catError.message}`);
      categoryId = newCat.id;
    }

    const insertData: TablesInsert<'budgets'> = {
      user_id: userId,
      category_id: categoryId,
      amount,
      period,
      start_date: startDate || new Date().toISOString().split('T')[0],
      rollover: false
    };

    const { data, error } = await supabase
      .from('budgets')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update an existing budget
   */
  static async updateBudget(id: string, updates: TablesUpdate<'budgets'>) {
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a budget
   */
  static async deleteBudget(id: string) {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Get budget progress with real-time updates
   */
  static async getBudgetProgress(userId: string, budgetId: string) {
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .select('*, categories(name)')
      .eq('id', budgetId)
      .eq('user_id', userId)
      .single();

    if (budgetError) throw budgetError;

    // Calculate spent amount for current period
    const startDate = new Date(budget.start_date);
    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date;

    if (budget.period === 'monthly') {
      periodStart = new Date(now.getFullYear(), now.getMonth(), startDate.getDate());
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, startDate.getDate() - 1);
    } else if (budget.period === 'weekly') {
      const dayOfWeek = startDate.getDay();
      periodStart = new Date(now);
      periodStart.setDate(now.getDate() - now.getDay() + dayOfWeek);
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodStart.getDate() + 6);
    } else {
      // yearly or custom
      periodStart = startDate;
      periodEnd = new Date(now.getFullYear() + 1, startDate.getMonth(), startDate.getDate() - 1);
    }

    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('category_id', budget.category_id)
      .lt('amount', 0)
      .gte('date', periodStart.toISOString().split('T')[0])
      .lte('date', periodEnd.toISOString().split('T')[0]);

    const spent = transactions?.reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;
    const remaining = budget.amount - spent;
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

    return {
      ...budget,
      category_name: budget.categories?.name || 'Unknown',
      spent,
      remaining,
      percentage: Math.min(percentage, 100),
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      is_over_budget: spent > budget.amount
    };
  }
}