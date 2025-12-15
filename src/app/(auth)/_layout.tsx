import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function AuthLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0A192F' }}>
      {/* Light status bar for dark background */}
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A192F' },
          animation: 'fade',
          // Security: Prevent swiping back to bypass auth screens
          gestureEnabled: false, 
        }}
      >
        <Stack.Screen name="login" options={{ title: 'Sign In' }} />
        <Stack.Screen name="register" options={{ title: 'Create Account' }} />
      </Stack>
    </View>
  );
}