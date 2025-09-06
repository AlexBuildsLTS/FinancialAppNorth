// Minimal budget service stub for development. Replace with real API logic.

export type Budget = {
  id?: string;
  name: string;
  amount: number;
  period?: string;
  [key: string]: any;
};

export async function createBudget(payload: Partial<Budget>): Promise<{ success: true; budget: Budget } | { success: false; error: string }> {
  if (!payload || !payload.name) {
    return { success: false, error: 'Invalid payload' };
  }
  // TODO: replace with real server call
  const budget: Budget = {
    id: String(Date.now()),
    name: payload.name as string,
    amount: payload.amount ?? 0,
    period: payload.period ?? 'monthly',
    ...payload,
  };
  return { success: true, budget };
}

const budgetService = { createBudget };
export default budgetService;
