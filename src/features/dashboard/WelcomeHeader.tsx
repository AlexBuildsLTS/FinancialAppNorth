import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';

export const WelcomeHeader = () => {
  const { theme: { colors } } = useTheme();
  const { profile } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome Back, {profile?.first_name || 'User'}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Here's your financial overview for today</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
});
