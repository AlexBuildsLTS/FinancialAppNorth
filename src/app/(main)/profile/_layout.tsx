import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '@/shared/context/ThemeProvider';

export default function ProfileStackLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false, // This is correct
        headerBackTitle: '', // Use headerBackTitle instead of headerBackTitleVisible
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="edit" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="api-keys" options={{ title: 'API Keys' }} />
      <Stack.Screen name="security" options={{ headerShown: false, title: 'Security' }} />
    </Stack>
  );
}