import React from 'react';
import { Stack } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeProvider';
import { ToastProvider } from '@/context/ToastProvider';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>;
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="admin" options={{ presentation: 'modal' }} />
            <Stack.Screen name="chat" options={{ presentation: 'modal' }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}