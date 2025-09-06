import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { getRoleDisplayName } from '@/utils/roleUtils';
import Animated, { FadeInUp } from 'react-native-reanimated';

export function DashboardHeader() {
  const { colors } = useTheme();
  const { profile } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Animated.View entering={FadeInUp.delay(100).springify()}>
      <View style={styles.container}>
        <Text style={[styles.greeting, { color: colors.textSecondary }]}>
          {getGreeting()},
        </Text>
        <Text style={[styles.name, { color: colors.text }]}>
          {profile?.display_name || 'User'}
        </Text>
        <Text style={[styles.role, { color: colors.primary }]}>
          {profile ? getRoleDisplayName(profile.role) : 'Member'}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
    marginTop: 4,
  },
  role: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 2,
  },
});