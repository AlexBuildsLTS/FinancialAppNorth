import React from 'react';
import { View } from 'react-native';
import * as LucideIcons from 'lucide-react-native';

export type TabIconName = keyof typeof LucideIcons;

// CORRECTED: The component expects a prop named 'icon', not 'name'.
export interface TabIconProps {
  icon: TabIconName;
  color: string;
  focused?: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ icon, color, focused }) => {
  const IconComponent = LucideIcons[icon] as React.ElementType;

  if (!IconComponent) {
    // Return a default or null if the icon name is invalid
    return <LucideIcons.HelpCircle color={color} />;
  }
  
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <IconComponent color={color} size={24} />
    </View>
  );
};

export default TabIcon;