import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useNotifications } from '@/hooks/useNotifications';
import { fetchNotifications, markNotificationAsRead } from '@/services/notificationService';
import { Bell, X, Check } from 'lucide-react-native';

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

const NotificationDropdown: React.FC = () => {
  const { colors } = useTheme();
  const { unreadCount } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (isVisible) {
      loadNotifications();
    }
  }, [isVisible]);

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(notifications.map(notification => 
        notification.id === id ? {...notification, is_read: true} : notification
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      for (const notification of notifications) {
        if (!notification.is_read) {
          await markNotificationAsRead(notification.id);
        }
      }
      setNotifications(notifications.map(notification => ({...notification, is_read: true})));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsVisible(true)}
        style={[styles.iconButton, { backgroundColor: colors.surface }]}
      >
        <Bell color={colors.text} size={24} />
        {unreadCount > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.error }]}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <Pressable 
          style={styles.overlay}
          onPress={() => setIsVisible(false)}
        >
          <Pressable 
            style={[styles.dropdown, { backgroundColor: colors.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Notifications
              </Text>
              <View style={styles.headerActions}>
                {notifications.some(n => !n.is_read) && (
                  <TouchableOpacity onPress={markAllAsRead}>
                    <Check color={colors.primary} size={20} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setIsVisible(false)}>
                  <X color={colors.text} size={20} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.notificationsContainer}>
              {notifications.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No notifications
                  </Text>
                </View>
              ) : (
                notifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    style={[
                      styles.notificationItem,
                      !notification.is_read && styles.unreadNotification,
                      { borderBottomColor: colors.border }
                    ]}
                    onPress={() => markAsRead(notification.id)}
                  >
                    <View style={styles.notificationContent}>
                      <Text style={[styles.notificationTitle, { color: colors.text }]}>
                        {notification.title}
                      </Text>
                      <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>
                        {notification.message}
                      </Text>
                    </View>
                    <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
                      {formatTime(notification.created_at)}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    padding: 12,
    borderRadius: 25,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 50,
    paddingRight: 16,
  },
  dropdown: {
    width: 300,
    maxHeight: 400,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  notificationsContainer: {
    maxHeight: 300,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  unreadNotification: {
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  notificationContent: {
    flex: 1,
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 12,
  },
  notificationTime: {
    fontSize: 10,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});

export default NotificationDropdown;