import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';

export default function ProfileStackLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="edit" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="api-keys" options={{ title: 'AI Provider Keys' }} />
      <Stack.Screen name="security" options={{ headerShown: false }} />
    </Stack>
  );
}