import React from 'react';
import { View, ViewProps } from 'react-native';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'dark';
}

export const GlassCard = ({ children, className = '', variant = 'default', ...props }: GlassCardProps) => {
  const baseStyle = "rounded-3xl border p-6";
  const variants = {
    default: "bg-[#112240]/90 border-[#64FFDA]/20 shadow-lg", // Slightly transparent dark blue with teal border hint
    dark: "bg-[#020C1B]/80 border-[#233554] shadow-md"
  };

  return (
    <View 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </View>
  );
};