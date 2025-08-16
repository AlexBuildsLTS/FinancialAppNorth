import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/context/ThemeProvider';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.surface : colors.primary}
        />
      ) : (
        <>
          {icon}
          <Text style={textStyleCombined}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      gap: 8,
    },
    text: {
      fontWeight: '600',
      textAlign: 'center',
    },
    
    // Variants
    primary: {
      backgroundColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.surfaceVariant,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    
    // Text variants
    primaryText: {
      color: colors.surface,
    },
    secondaryText: {
      color: colors.text,
    },
    outlineText: {
      color: colors.primary,
    },
    ghostText: {
      color: colors.primary,
    },
    
    // Sizes
    small: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      minHeight: 36,
    },
    medium: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      minHeight: 44,
    },
    large: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      minHeight: 52,
    },
    
    // Text sizes
    smallText: {
      fontSize: 14,
    },
    mediumText: {
      fontSize: 16,
    },
    largeText: {
      fontSize: 18,
    },
    
    // Disabled state
    disabled: {
      opacity: 0.5,
    },
    disabledText: {
      opacity: 0.5,
    },
  });