import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Notification } from '@/types/index'; // Assuming Notification type exists

export function useNotifications() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!profile) return;
    const { data, error, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) console.error("Error fetching notifications:", error);
    else {
      setNotifications(data || []);
      const unread = (data as Notification[] | undefined)?.filter((n: Notification) => !n.is_read).length || 0;
      setUnreadCount(unread);
    }
  }, [profile]);

  useEffect(() => {
    fetchNotifications();
    const channel = supabase
      .channel('public:notifications')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload: { new?: Notification }) => {
      fetchNotifications();
    })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  return { notifications, unreadCount, refreshNotifications: fetchNotifications };
}
