import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';

export default function ChatLayout() {
  const { colors } = useTheme();

  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Chat',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }}
      />
    </Stack>
  );
}