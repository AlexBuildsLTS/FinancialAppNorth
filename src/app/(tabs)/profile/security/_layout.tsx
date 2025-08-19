import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';

export default function SecurityLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: 'Inter-Bold' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Security' }} />
      <Stack.Screen name="change-password" options={{ title: 'Change Password' }} />
    </Stack>
  );
}