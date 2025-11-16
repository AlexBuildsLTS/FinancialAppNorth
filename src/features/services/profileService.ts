import { supabase } from "@/lib/supabase";
import { Profile } from "@/types";

export const profileService = {
  /**
   * Fetches a user profile by their user ID.
   * @param userId The ID of the user whose profile to fetch.
   * @returns An object containing the profile data or an error.
   */
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles") // Assuming your user profiles are stored in a table named 'profiles'
      .select("*")
      .eq("id", userId)
      .single(); // Expecting a single profile for a given user ID

    if (error) {
      console.error("Error fetching profile:", error.message);
      return { data: null, error };
    }

    // Cast the data to Profile type, assuming the table structure matches
    return { data: data as Profile, error: null };
  },

  // Add other profile-related methods here as needed (e.g., updateProfile)
};
