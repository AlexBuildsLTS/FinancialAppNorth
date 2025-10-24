// This is the root layout for the entire application. It loads necessary fonts and wraps all routes with essential context providers.
import React , { useEffect } from 'react' ;
import { Slot, SplashScreen } from 'expo-router';
import { AuthProvider } from '@/shared/context/AuthContext';
import { ThemeProvider } from '@/shared/context/ThemeProvider';
import { ToastProvider } from '@/shared/context/ToastProvider';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { router } from 'expo-router';
// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen after the fonts have loaded (or an error was returned)
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Prevent rendering until the font has loaded or an error was returned
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <Slot />
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}