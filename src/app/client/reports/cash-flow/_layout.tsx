import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';

export default function ClientCashFlowLayout() {
  const { colors } = useTheme();
  return (<Stack screenOptions={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text, headerTitleStyle: { fontWeight: 'bold' } }} />);
}