// src/components/dashboard/DashboardHeader.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Bell, Mail } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import Avatar from '../common/Avatar';
import NotificationDropdown from '../common/NotificationDropdown';
import { useRouter } from 'expo-router';

const DashboardHeader = () => {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);

  const displayName = profile?.display_name || 'User';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View>
          <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>Welcome back,</Text>
          <Text style={[styles.userName, { color: colors.text }]}>{displayName}!</Text>
        </View>

        <View style={styles.iconContainer}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setShowNotifications(prev => !prev)}
          >
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>2</Text>
            </View>
            <Bell color={colors.textSecondary} size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Mail color={colors.textSecondary} size={24} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <Avatar profile={profile} size={40} />
          </TouchableOpacity>
        </View>
      </View>
      {showNotifications && <NotificationDropdown onClose={() => setShowNotifications(false)} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    zIndex: 1, // Ensure header is above content
  },
  welcomeText: {
    fontSize: 14,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  iconButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default DashboardHeader;