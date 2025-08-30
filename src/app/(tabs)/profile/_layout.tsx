// src/app/(tabs)/profile/_layout.tsx

import { Stack } from 'expo-router';
import React from 'react';

export default function ProfileLayout() {
  // This configures the navigator for the screens inside the 'profile' folder.
  // It hides the header because our screens will provide their own custom header.
  return <Stack screenOptions={{ headerShown: false }} />;
}