/**
 * ============================================================================
 * 🧭 ORGANIZATION NAVIGATION LAYOUT
 * ============================================================================
 * Configures the navigation stack for the Organization module.
 * Enforces the "Deep Navy" (#0A192F) aesthetic consistent with the brand.
 * ============================================================================
 */

import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import React from 'react';

export default function OrganizationLayout() {
  return (
    <Stack
      screenOptions={{
        // --- Appearance ---
        headerStyle: {
          backgroundColor: '#0A192F', // Deep Navy Brand Color
        },
        headerTintColor: '#64FFDA',   // Teal Accent for Back Buttons/Icons
        headerTitleStyle: {
          color: '#E2E8F0',           // Slate 200 for Readability
          fontWeight: '600',
          fontSize: 17,
        },
        headerShadowVisible: false,   // Flat Modern Look
        
        // --- Content Container ---
        contentStyle: {
          backgroundColor: '#0A192F',
          borderTopWidth: 1,
          borderTopColor: '#112240',  // Subtle separator
        },
        
        // --- Animation ---
        animation: Platform.OS === 'android' ? 'fade_from_bottom' : 'default',
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Organization HQ',
          headerLargeTitle: true, // iOS Native Feel
          headerLargeTitleStyle: { color: '#FFFFFF' }
        }} 
      />
      <Stack.Screen 
        name="members" 
        options={{ 
          title: 'Team Management',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="audit-log" 
        options={{ 
          title: 'Audit Trail',
        }} 
      />
    </Stack>
  );
}