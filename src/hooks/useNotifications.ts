import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchUnreadCount } from '@/services/notificationService';
import { useAuth } from '@/context/AuthContext';

export const useNotifications = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const getCount = useCallback(async () => {
    const count = await fetchUnreadCount();
    setUnreadCount(count);
  }, []);

  useEffect(() => {
    if (user) {
      // Fetch initial count
      getCount();

      // Listen for real-time changes to the notifications table
      const channel = supabase
        .channel('public:notifications')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            // When a change occurs, re-fetch the count
            getCount();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, getCount]);

  return { unreadCount };
};