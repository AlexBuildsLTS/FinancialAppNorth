import React from 'react';
import { ActivityIndicator, ActivityIndicatorProps } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';

const LoadingSpinner = (props: ActivityIndicatorProps) => {
  const { theme: { colors } } = useTheme();
  return <ActivityIndicator color={colors.primary} {...props} />;
};

export default LoadingSpinner;
