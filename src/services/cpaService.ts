import { supabase } from '../lib/supabase';
import { Profile, ClientDashboardData, ClientListItem, } from '../types';

/**
 * Fetches all necessary data for a single client's dashboard.
 */
export const getClientDashboardData = async (  clientId: string,): Promise<ClientDashboardData> => {
    if (!clientId) throw new Error("Client ID must be provided.");

    try {
        const [profileRes, metricsRes, transactionsRes] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', clientId).single(),
            supabase.rpc('get_dashboard_metrics', { client_id: clientId }),
            supabase.from('transactions').select('*, category:categories(name)').eq('user_id', clientId).order('transaction_date', { ascending: false }).limit(5)
        ]);

        if (profileRes.error) throw new Error(`Profile fetch failed: ${profileRes.error.message}`);
        if (metricsRes.error) throw new Error(`Metrics RPC failed: ${metricsRes.error.message}`);
        if (transactionsRes.error) throw new Error(`Transactions fetch failed: ${transactionsRes.error.message}`);
        if (!profileRes.data) throw new Error('Client profile not found.');
        if (!metricsRes.data) throw new Error('Could not calculate client metrics.');

        const formattedTransactions = transactionsRes.data?.map((t: any) => ({
            ...t,
            category: t.categories?.name || 'Uncategorized',
        })) || [];

        return {
            profile: profileRes.data,
            metrics: metricsRes.data,
            recentTransactions: formattedTransactions,
        };
    } catch (error) {
        console.error("Critical error in getClientDashboardData:", error);
        throw error;
    }
};

/**
 * Fetches a list of all active clients assigned to a specific CPA.
 */
export const getAssignedClients = async (cpaId: string): Promise<ClientListItem[]> => {
    const { data, error } = await supabase
        .from('cpa_client_assignments')
        .select('client:profiles!inner(id, display_name, email, avatar_url)')
        .eq('cpa_user_id', cpaId)
        .eq('status', 'active');

    if (error) {
        console.error('Error fetching assigned clients:', error);
        throw error;
    }

    return (data || [])
        .map(item => {
            const clientProfile = Array.isArray(item.client) ? item.client[0] : item.client;
            if (!clientProfile) {
                return null;
            }
            return {
                id: clientProfile.id,
                name: clientProfile.display_name,
                email: clientProfile.email,
                avatarUrl: clientProfile.avatar_url || `https://avatar.vercel.sh/${clientProfile.id}`,
                last_activity: 'Just now', // Placeholder
            };
        })
        .filter((item): item is ClientListItem => item !== null);
};

/**
 * Sends a request for client access to the specified email.
 * This is a placeholder function. In a real application, this would
 * involve more complex logic, e.g., sending an invitation email,
 * creating a pending assignment in the database, etc.
 */
export const requestClientAccess = async (clientEmail: string): Promise<void> => {
    console.log(`Requesting client access for email: ${clientEmail}`);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In a real scenario, you would interact with your backend/database here.
    // For example:
    // const { data, error } = await supabase.from('pending_client_invitations').insert([{ email: clientEmail, status: 'pending' }]);
    // if (error) throw new Error(error.message);
    console.log(`Client access request sent for ${clientEmail}`);
};
