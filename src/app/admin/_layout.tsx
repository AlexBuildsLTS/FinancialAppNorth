// src/app/admin/_layout.tsx

import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';

export default function AdminStackLayout() {
  const { session, isLoading } = useAuth();
  const { colors } = useTheme();

  // Wait for session to be initialized
  if (isLoading) {
    return null;
  }
  // Protect the entire route group
  if (session?.user?.role !== 'Administrator') {
    return <Redirect href="/(tabs)" />;
  }

  // Use a Stack navigator for the admin section
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Admin Dashboard' }}
      />
      <Stack.Screen
        name="manage-users"
        options={{ title: 'User Management' }}
      />
    </Stack>
  );
}