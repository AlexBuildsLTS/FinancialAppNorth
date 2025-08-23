// src/app/(tabs)/index.tsx
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useTheme } from "@/context/ThemeProvider";
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricsGrid from "@/components/dashboard/MetricsGrid";
import { ChartSection } from '@/components/dashboard/ChartSection';
import QuickActions from "@/components/dashboard/QuickActions";
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { user, profile } = useAuth(); // Destructure profile from the context
  const router = useRouter();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      <DashboardHeader
        // Use the profile's username, with the user's email as a fallback
        username={profile?.username || user?.email || 'User'}
        // Use the profile's avatar_url
        avatarUrl={profile?.avatar_url || ''}
        onPressProfile={() => router.push('/(tabs)/profile')}
        onPressSettings={() => {}}
      />

      <MetricsGrid />
      <ChartSection />
      <QuickActions onAddTransaction={() => {
        console.log("Add transaction pressed");
      }} />
      <RecentTransactions />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});