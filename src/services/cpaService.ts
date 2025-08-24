import { supabase } from '@/lib/supabase';
import { UserProfile, Transaction, Client as TypesClient } from '@/types';

// Represents a client assigned to a CPA
export interface Client extends UserProfile {
  last_activity: string; // Could be a timestamp of last login or transaction
}

// Mapping function to convert cpaService Client to types/index.ts Client
export const mapCpaClientToTypesClient = (cpaClient: Client): TypesClient => {
  return {
    id: cpaClient.id,
    name: cpaClient.display_name,
    email: cpaClient.email,
    status: cpaClient.status as 'active' | 'inactive', // Type assertion to match expected type
    companyName: cpaClient.display_name, // Using display name as company name
    avatarUrl: cpaClient.avatar_url || `https://i.pravatar.cc/150?u=${cpaClient.id}`,
    netWorth: 0, // Default value, could be updated if this data is available
    uncategorized: 0, // Default value, could be updated if this data is available
    };
};

/**
 * Sends a request for client access to a specific email address.
 * This assumes a 'client_access_requests' table exists.
 * @param email The email address of the client to request access for.
 */
export const requestClientAccess = async (email: string): Promise<void> => {
  const { error } = await supabase
    .from('client_access_requests')
    .insert([{ email, status: 'pending' }]); // Assuming 'status' defaults to 'pending'

  if (error) {
    console.error('Error sending client access request:', error);
    throw error;
  }
};

// Represents the full financial overview for a single client
export interface ClientDashboardData {
  profile: UserProfile;
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  recentTransactions: Transaction[];
}

/**
 * Fetches a list of all clients assigned to a specific CPA.
 * This assumes a 'cpa_client_assignments' table exists linking professionals to their clients.
 * @param cpaId The UUID of the Professional (CPA) user.
 */
export const getAssignedClients = async (cpaId: string): Promise<TypesClient[]> => {
  const { data, error } = await supabase
    .from('client_assignments')
    .select('client:profiles(*)')
    .eq('cpa_id', cpaId);

  if (error) {
    console.error('Error fetching assigned clients:', error);
    throw error;
  }

  // Map the data to the Client type
  return data.map(item => {
    const clientWithActivity: any = {
      ...item.client,
      last_activity: '2025-08-24T10:00:00Z', // Placeholder activity
    };
    
    return mapCpaClientToTypesClient(clientWithActivity as Client);
  });
};

/**
 * Fetches all necessary data for a single client's dashboard view.
 * This is the secure data fetch for when a CPA enters a client's workspace.
 * @param clientId The UUID of the client being viewed.
 */
export const getClientDashboardData = async (clientId: string): Promise<ClientDashboardData> => {
    // 1. Fetch Client Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', clientId)
        .single();
    
    if (profileError) throw profileError;

    // 2. Fetch Client Transactions
    const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', clientId)
        .order('date', { ascending: false });

    if (transactionsError) throw transactionsError;

    // 3. Calculate Financials
    const totalIncome = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0;
    const totalExpenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;
    const totalBalance = totalIncome - totalExpenses;
    
    return {
        profile,
        totalBalance,
        totalIncome,
        totalExpenses,
        recentTransactions: transactions?.slice(0, 5) || [],
    };
};
