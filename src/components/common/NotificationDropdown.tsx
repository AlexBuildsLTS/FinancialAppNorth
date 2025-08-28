// src/components/common/NotificationDropdown.tsx

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { Notification } from '@/types';

// Mock Data - Replace with a fetch call
const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', user_id: 'mock_user_id_1', title: 'New Event Invitation', message: 'You have been invited to Team Meeting', type: 'event_invite', is_read: false, created_at: new Date().toISOString() },
  { id: '2', user_id: 'mock_user_id_1', title: 'New Message', message: 'You have a new message from Sigma Technology', type: 'info', is_read: false, created_at: new Date().toISOString() },
  { id: '3', user_id: 'mock_user_id_1', title: 'System Maintenance', message: 'Scheduled maintenance planned for tomorrow.', type: 'warning', is_read: true, created_at: new Date().toISOString() },
];

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { colors } = useTheme();

  const renderItem = ({ item }: { item: Notification }) => (
    <View style={[styles.itemContainer, { borderBottomColor: colors.border }]}>
      {!item.is_read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
      <View style={{ flex: 1 }}>
        <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.itemMessage, { color: colors.textSecondary }]}>{item.message}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <TouchableOpacity>
          <Text style={[styles.markAsRead, { color: colors.primary }]}>Mark all as read</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={MOCK_NOTIFICATIONS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 80,
    right: 24,
    width: 320,
    maxHeight: 400,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  markAsRead: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemMessage: {
    fontSize: 14,
  },
});

export default NotificationDropdown;
