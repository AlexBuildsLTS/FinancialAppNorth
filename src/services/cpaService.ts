import { supabase } from '@/lib/supabase';
import { Profile } from '@/types'; // We'll add this to types next

// Fetches all clients assigned to the currently logged-in CPA
export const fetchAssignedClients = async (): Promise<Profile[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("No user is logged in.");
  }

  // This query joins the client_assignments table with the profiles table
  // to get the full profile details for each assigned client.
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
    .eq('cpa_id', user.id);

  if (error) {
    console.error("Error fetching assigned clients:", error);
    throw error;
  }

  // The query returns a nested structure, so we flatten it for easier use in the app
  const clients = (data || []).map(item => ({
    ...item.client,
    assignment_status: item.status
  }));

  return clients as unknown as Profile[];
};

export const requestClientAccess = async (clientEmail: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No user is logged in.");

  // Find client by email
  const { data: client, error: clientError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', clientEmail)
    .single();

  if (clientError || !client) {
    throw new Error('Client not found with that email address.');
  }

  // Create assignment request
  const { error } = await supabase
    .from('client_assignments')
    .insert({
      cpa_id: user.id,
      client_id: client.id,
      status: 'pending',
      assigned_by: user.id,
    });

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('You already have a request pending for this client.');
    }
    throw error;
  }
};