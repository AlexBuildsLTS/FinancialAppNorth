/**
 * src/app/(main)/organization/_layout.tsx
 * ROLE: The Organization Navigation Root.
 * PURPOSE: Standardizes the "Deep Slate" design and native performance transitions.
 */

import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import React from 'react';
import { BlurView } from 'expo-blur';

export default function OrganizationLayout() {
  return (
    <Stack
      screenOptions={{
        // --- Premium Appearance ---
        headerStyle: {
          backgroundColor: '#020617', // Optimized Slate-950
        },
        headerTintColor: '#22d3ee', // North Cyan Accent
        headerTitleStyle: {
          color: '#f8fafc', // Slate 50
          fontWeight: '900',
          fontSize: 16,
        },
        headerShadowVisible: false,
        headerTransparent: Platform.OS === 'ios',
        headerBlurEffect: 'systemThickMaterialDark', // Glassmorphism backdrop

        // --- Structural Content ---
        contentStyle: {
          backgroundColor: '#020617',
        },

        // --- Animation Logic ---
        animation: Platform.OS === 'android' ? 'slide_from_bottom' : 'default',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Organization HQ',
          headerLargeTitle: true,
          headerLargeTitleStyle: {
            color: '#FFFFFF',
            fontFamily: 'Inter-Black',
          },
          headerSearchBarOptions: {
            placeholder: 'Search entities...',
            textColor: '#fff',
          },
        }}
      />
      <Stack.Screen
        name="members"
        options={{
          title: 'Directorship',
          presentation: 'modal', // High-end focus for team management
        }}
      />
      <Stack.Screen
        name="audit-log"
        options={{
          title: 'Compliance Vault',
        }}
      />
    </Stack>
  );
}
