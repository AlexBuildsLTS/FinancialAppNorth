// src/app/(auth)/_layout.tsx

import React from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { View, StyleSheet } from 'react-native';
import ScreenContainer from '@/components/ScreenContainer';
import AnimatedThemeIcon from '@/components/common/AnimatedThemeIcon';

export default function AuthLayout() {
  const { isLoading } = useAuth();
  
  // The redirect is now handled by the root layout.
  // We just wait here until the auth state is ready before showing anything.
  if (isLoading) {
    return null;
  }

  return (
    <ScreenContainer>
      <View style={styles.themeToggleContainer}>
        <AnimatedThemeIcon />
      </View>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
    themeToggleContainer: { 
        position: 'absolute', 
        top: 60, 
        right: 24, 
        zIndex: 1 
    },
});