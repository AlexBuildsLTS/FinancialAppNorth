// src/app/_layout.tsx
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SplashScreen, Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { ThemeProvider } from '@/context/ThemeProvider'; // <-- IMPORT THEME PROVIDER

const InitialLayout = () => {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace('/(auth)/login');
    } else {
      router.replace('/(tabs)');
    }
  }, [session, loading]);

  return (
    <View style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
};

export default function RootLayout() {
  return (
    // WRAP EVERYTHING IN THE THEME PROVIDER
    <ThemeProvider>
      <AuthProvider>
        <InitialLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}