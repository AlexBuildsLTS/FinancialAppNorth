import { Stack, Redirect } from 'expo-router';
import React from 'react';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

export default function ClientLayout() {
  const { colors } = useTheme();
  const { user, initialized } = useAuth(); // Use useAuth

  // Redirect if not initialized or not a professional/admin
  if (
    initialized &&
    !(
      user?.role === 'Professional Accountant' || user?.role === 'Administrator'
    )
  ) {
    return <Redirect href="/(tabs)" />; // Corrected path to dashboard group
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
      <Stack.Screen name="reports" options={{ headerShown: false }} />
      <Stack.Screen name="transactions" options={{ headerShown: false }} />
    </Stack>
  );
}
