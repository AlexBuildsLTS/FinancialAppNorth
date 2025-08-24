import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, MessageCircle, Settings, User } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import NotificationDropdown from '@/components/common/NotificationDropdown';
import { DashboardHeaderProps } from '@/types';

export default function DashboardHeader({
  userName,
  avatarUrl,
  onPressProfile,
  onPressMessages,
  onPressSettings,
}: DashboardHeaderProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View>
        <Text style={[styles.greeting, { color: colors.textSecondary }]}>
          Welcome back,
        </Text>
        <Text style={[styles.userName, { color: colors.text }]}>
          {userName || 'User'}
        </Text>
      </View>
      <View style={styles.iconsContainer}>
        <NotificationDropdown />
        <TouchableOpacity onPress={onPressMessages} style={styles.iconButton}>
          <MessageCircle color={colors.textSecondary} size={24} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(tabs)/settings')} style={styles.iconButton}>
          <Settings color={colors.textSecondary} size={24} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={styles.iconButton}>
          <User color={colors.textSecondary} size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 20, // Extra padding for status bar area
  },
  greeting: {
    fontSize: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
    padding: 4,
  },
});
