import React, { useEffect } from 'react';
import { Slot, SplashScreen } from 'expo-router';
import { ThemeProvider } from '@/context/ThemeProvider';
import { StatusBar } from 'expo-status-bar';

// NOTE: The custom font loader has been temporarily disabled to get the app running.
// You can add the fonts later by following the "Permanent Fix" instructions.

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Since we are not loading fonts, we can hide the splash screen immediately.
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider>
      <StatusBar style="light" />
      <Slot />
    </ThemeProvider>
  );
}