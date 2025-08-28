import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSegments, Stack, Redirect } from 'expo-router';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeProvider';
import { ToastProvider } from '@/context/ToastProvider';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Component to handle authentication-based redirection
const AuthRedirector = () => {
  const { session, initialized } = useAuth();
  const segments = useSegments();

  // If the app is not initialized, we don't want to render anything.
  if (!initialized) {
    return null; // or a loading spinner
  }

  const inAuthGroup = segments[0] === '(auth)';

  if (session?.user && inAuthGroup) {
    // Redirect authenticated users from auth pages to the main app
    // Using 'replace' to prevent user from going back to auth screens.
    return <Redirect href="/(tabs)" />;
  } else if (!session?.user && !inAuthGroup) {
    // Redirect unauthenticated users from main app pages to the login page
    return <Redirect href="/(auth)/login" />;
  }

  // If the user is in the correct group, render the stack.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
      <Stack.Screen name="chat" options={{ headerShown: false }} />
      <Stack.Screen name="process-document" options={{ headerShown: false }} />
      <Stack.Screen name="client-support" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
};

export default function RootLayout() {
  
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
