import { Transaction, Account, Budget, Goal, Investment, Client, FixedAsset, Liability } from '@/types';

// --- MOCK DATA ARRAYS ---
export const mockAccounts: Account[] = [
  { id: '1', name: 'Primary Checking', type: 'checking', balance: 12450.75, currency: 'USD', lastUpdated: '2025-01-15T10:30:00Z' },
  { id: '2', name: 'High Yield Savings', type: 'savings', balance: 45200.00, currency: 'USD', lastUpdated: '2025-01-15T10:30:00Z' },
  { id: '3', name: 'Investment Portfolio', type: 'investment', balance: 87650.25, currency: 'USD', lastUpdated: '2025-01-15T10:30:00Z' },
];

export let mockClients: Client[] = [ // Changed to let
  { id: 'cli1', name: 'John Doe', companyName: 'Doe Construction', email: 'john.doe@construction.com', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', status: 'active', netWorth: 1250000, uncategorized: 5, },
  { id: 'cli2', name: 'Jane Smith', companyName: 'Smith & Co. Bakery', email: 'jane.smith@bakery.com', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705e', status: 'active', netWorth: 480000, uncategorized: 2, },
  { id: 'cli3', name: 'Sam Wilson', companyName: 'Wilson Tech Solutions', email: 'sam.wilson@tech.com', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026706f', status: 'pending', netWorth: 2300000, uncategorized: 12, },
];

export let mockTransactions: Transaction[] = [
  { id: '1', clientId: 'cli1', accountId: '1', title: 'Whole Foods Market', description: 'Weekly grocery shopping', category: 'Groceries', amount: -156.50, date: '2025-01-15', time: '14:30', type: 'expense', status: 'completed', tags: ['food', 'weekly'], location: 'Austin, TX', },
  { id: '2', clientId: 'cli1', accountId: '1', title: 'Monthly Salary', description: 'Software Engineer Salary', category: 'Salary', amount: 5200.00, date: '2025-01-15', time: '09:00', type: 'income', status: 'completed', tags: ['salary', 'monthly'], },
];

export const mockBudgets: Budget[] = [];
export const mockGoals: Goal[] = [];
export const mockInvestments: Investment[] = [];
export const mockFixedAssets: FixedAsset[] = [];
export const mockLiabilities: Liability[] = [];

// --- SERVICE FUNCTIONS ---
export async function getAccounts(): Promise<Account[]> { return new Promise((r) => setTimeout(() => r(mockAccounts), 300)); }
export async function getTransactions(clientId: string): Promise<Transaction[]> { return new Promise((r) => setTimeout(() => r(mockTransactions.filter(t => t.clientId === clientId)), 500)); }
export async function getBudgets(): Promise<Budget[]> { return new Promise((r) => setTimeout(() => r(mockBudgets), 400)); }
export async function getGoals(): Promise<Goal[]> { return new Promise((r) => setTimeout(() => r(mockGoals), 350)); }
export async function getInvestments(): Promise<Investment[]> { return new Promise((r) => setTimeout(() => r(mockInvestments), 450)); }
export async function createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> { return new Promise((r) => { const newTx = { ...transaction, id: Date.now().toString() }; mockTransactions.unshift(newTx); r(newTx); }); }
export async function updateBudget(budgetId: string, updates: Partial<Budget>): Promise<Budget> { return new Promise((resolve, reject) => { /* implementation */ }); }
export async function getClients(): Promise<Client[]> { return new Promise((r) => setTimeout(() => r(mockClients), 500)); }
export async function getClientById(id: string): Promise<Client | undefined> { return new Promise((r) => setTimeout(() => r(mockClients.find(c => c.id === id)), 300)); }
export async function getBalanceSheetData(clientId: string): Promise<{ accounts: Account[], assets: FixedAsset[], liabilities: Liability[] }> { return new Promise((r) => { const d = { accounts: mockAccounts, assets: mockFixedAssets.filter(a => a.clientId === clientId), liabilities: mockLiabilities.filter(l => l.clientId === clientId) }; r(d); }); }

// NEW FUNCTION to add a client
export async function createClient(clientData: Omit<Client, 'id'|'avatarUrl'>): Promise<Client> {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newClient: Client = {
                ...clientData,
                id: `cli_${Date.now()}`,
                avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
            };
            mockClients.unshift(newClient);
            resolve(newClient);
        }, 300);
    });
}