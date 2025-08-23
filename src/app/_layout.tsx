// src/app/_layout.tsx
import React, { useEffect } from 'react';
import { SplashScreen, Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeProvider';

// This is the main layout component that wraps the entire app.
const InitialLayout = () => {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    // If the user is not signed in and not in the auth group, redirect to login.
    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
    // If the user is signed in and in the auth group, redirect to the main app.
    else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  // The splash screen is hidden once loading is complete.
  // Return null to avoid rendering anything until the redirect logic has run.
  if (loading) {
    return null;
  }

  // Render the current route
  return <Slot />;
};

// This is the root component that provides the AuthContext to the app.
export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <InitialLayout />
      </ThemeProvider>
    </AuthProvider>
  );
}