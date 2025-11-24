import React from 'react';
import { View, ViewProps } from 'react-native';

export const GlassCard = ({ children, className, ...props }: { children: React.ReactNode; className?: string } & ViewProps) => {
  return (
    <View 
      className={`bg-[#112240] border border-[#233554] rounded-2xl p-4 ${className}`}
      {...props}
    >
      {children}
    </View>
  );
};
