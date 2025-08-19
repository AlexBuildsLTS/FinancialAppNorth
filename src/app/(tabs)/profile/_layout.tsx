import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';

export default function ProfileLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontFamily: 'Inter-Bold',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Profile & Settings',
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: 'Edit Profile',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="security"
        options={{
          headerShown: false,
        }}
      />
       <Stack.Screen
        name="api-keys"
        options={{
          title: 'API Key Management',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}