import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Notification } from '@/types'; // Assuming Notification type exists

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data, error, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) console.error("Error fetching notifications:", error);
    else {
      setNotifications(data || []);
      const unread = data?.filter(n => !n.is_read).length || 0;
      setUnreadCount(unread);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
          fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  return { notifications, unreadCount, refreshNotifications: fetchNotifications };
}