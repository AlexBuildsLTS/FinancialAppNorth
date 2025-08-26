import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { View, StyleSheet } from 'react-native';
import ScreenContainer from '@/components/ScreenContainer';
import AnimatedThemeIcon from '@/components/common/AnimatedThemeIcon'; // Import the new component

export default function AuthLayout() {
  const { session, initialized } = useAuth();

  // If the session is initialized and the user is logged in,
  // redirect them away from the auth screens to the main app.
  if (initialized && session) {
    return <Redirect href="/(tabs)" />;
  }

  // Otherwise, show the login/register screens within a container
  // that has the shared animated theme icon.
  return (
    <ScreenContainer>
      <View style={styles.themeToggleContainer}>
        <AnimatedThemeIcon />
      </View>
      <Stack screenOptions={{ headerShown: false }} />
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