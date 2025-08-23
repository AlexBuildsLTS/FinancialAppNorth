// src/app/_layout.tsx
import React, { useEffect } from 'react';
import { SplashScreen, Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';

// This is the main layout component that wraps the entire app.
const InitialLayout = () => {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Wait until the session is loaded
    if (loading) return;

    const inTabsGroup = segments[0] === '(tabs)';

    // If the user is not signed in and the initial segment is not the auth group,
    // redirect them to the sign-in page.
    if (!session && !inTabsGroup) {
      router.replace('/(auth)/login');
    } 
    // If the user is signed in and the initial segment is in the auth group,
    // redirect them to the main tabs screen.
    else if (session && inTabsGroup) {
      router.replace('/(tabs)');
    }
    
    // Hide the splash screen once we're done
    SplashScreen.hideAsync();

  }, [session, loading, segments, router]);

  // Render the current route
  return <Slot />;
};

// This is the root component that provides the AuthContext to the app.
export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}