import React from 'react';
import { Platform } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import * as LucideReactIcons from 'lucide-react';
import { SvgProps } from 'react-native-svg';

// A helper function to convert kebab-case to PascalCase
const toPascalCase = (str: string) => {
  return str.replace(/(^\w|-\w)/g, (g) => g.replace(/-/, '').toUpperCase());
};

type TabIconProps = {
  icon: React.ElementType;
  color?: string;
  size?: number;
  focused?: boolean;
};

export default function TabIcon({ icon: Icon, color = '#000', size = 24, focused = false }: TabIconProps) {
  if (!Icon) return null;

  return <Icon color={color} size={size} />;
}
