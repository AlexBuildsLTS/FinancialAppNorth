import { supabase } from '@/lib/supabase';
import { Profile } from '@/types'; // We'll add this to types next

// Define the shape of a Client, which includes their profile and assignment status
export interface Client extends Profile {
  assignment_status: string;
}

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
      profiles:client_id (
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
  const clients = data.map(item => ({
    ...item.profiles,
    assignment_status: item.status
  }));

  return clients as unknown as Profile[];
};