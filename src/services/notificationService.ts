import { supabase } from '@/lib/supabase';

/**
 * Fetches the count of unread notifications for the current user.
 * This is a highly efficient query that only returns the count, not the full data.
 */
export const fetchUnreadCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);

  if (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }

  return count || 0;
};