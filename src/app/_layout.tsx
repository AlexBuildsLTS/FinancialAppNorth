import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SplashScreen, Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { ThemeProvider, useTheme } from '@/context/ThemeProvider';

const InitialLayout = () => {
  const { session, loading } = useAuth();
  const router = useRouter();
  const { colors } = useTheme(); // Get colors here

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace('/(auth)/login');
    } else {
      router.replace('/(tabs)');
    }
  }, [session, loading]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface, // Use surface instead of card
          },
          headerTintColor: colors.text,
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
};

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InitialLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}