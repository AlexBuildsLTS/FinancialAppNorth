// src/app/(tabs)/admin/_layout.tsx

import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

export default function AdminStackLayout() {
  const { colors } = useTheme();
  const { profile, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null; // let the parent layout show a loader

  if (!isAuthenticated || !profile) {
    return <Redirect href="/login" />;
  }

  if (profile.role !== UserRole.ADMIN) {
    // non-admins should not land here
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      // STOP rendering a second header here — rely on the parent Tabs header
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}