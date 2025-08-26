import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter, useSegments, Stack } from 'expo-router';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeProvider';
import { ToastProvider } from '@/context/ToastProvider';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Component to handle authentication-based redirection
const AuthRedirector = () => {
  const { user, initialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (user && inAuthGroup) {
      // Redirect authenticated users from auth pages to the main app
      router.replace('/(tabs)');
    } else if (!user && !inAuthGroup) {
      // Redirect unauthenticated users from main app pages to the login page
      router.replace('/(auth)/login');
    }
  }, [user, initialized, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
      <Stack.Screen name="chat" options={{ headerShown: false }} />
      <Stack.Screen name="process-document" options={{ headerShown: false }} />
      <Stack.Screen name="client-support" options={{ headerShown: false }} />
      <Stack.Screen name="client-dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
};

export default function RootLayout() {
  useFrameworkReady();
  
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': require('../assets/Inter/Inter-VariableFont_opsz,wght.ttf'),
    'Inter-Bold': require('../assets/Inter/static/Inter_18pt-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AuthRedirector />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
