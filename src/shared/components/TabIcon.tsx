// src/shared/components/TabIcon.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react-native';

type TabIconProps = {
  icon: LucideIcon;
  color: string;
  focused: boolean;
};

// This component is now simple and correct. It receives an Icon Component and renders it.
export function TabIcon({ icon: Icon, color, focused }: TabIconProps) {
  if (!Icon) return null;

  // Give the focused icon a slightly larger size for a subtle "pop" effect.
  return <Icon color={color} size={focused ? 26 : 24} />;
}