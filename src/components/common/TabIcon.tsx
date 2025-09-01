import React from 'react';
import { Platform } from 'react-native';

// Platform-aware TabIcon: uses lucide-react (SVG) on web and lucide-react-native on native
import * as LucideReactIcons from 'lucide-react';

type TabIconProps = {
  Icon: any; // icon component imported in codebase (usually lucide-react-native)
  color?: string;
  size?: number;
};

export default function TabIcon({ Icon, color = '#000', size = 24 }: TabIconProps) {
  const isWeb = Platform.OS === 'web';
  if (!Icon) return null;

  if (isWeb) {
    // Determine possible icon name from component metadata
    const iconName = (Icon.displayName || Icon.name || '').replace?.(/(Icon|React)/gi, '') || Icon?.__iconName || '';
    const WebIcon = (LucideReactIcons as any)[iconName] || (LucideReactIcons as any)[Icon.displayName] || (LucideReactIcons as any)[Icon.name];

    if (WebIcon) {
      return <WebIcon color={color} size={size} />;
    }

    // final fallback: try a generic icon, else null
    const Fallback = (LucideReactIcons as any).Square || (() => null);
    return <Fallback color={color} size={size} />;
  }

  // Native: render provided lucide-react-native component
  const NativeIcon = Icon;
  return <NativeIcon color={color} size={size} />;
}