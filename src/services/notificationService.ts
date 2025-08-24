import { supabase } from '@/lib/supabase';

/**
 * Marks a specific notification as read.
 * @param notificationId The ID of the notification.
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
    
    if (error) {
        console.error("Error marking notification as read:", error);
        throw error;
    }
};

/**
 * Marks all notifications for a user as read.
 * @param userId The user's ID.
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error) {
        console.error("Error marking all notifications as read:", error);
        throw error;
    }
};