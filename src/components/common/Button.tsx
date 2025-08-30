// src/components/common/Button.tsx

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { LucideIcon } from 'lucide-react-native';

type ButtonVariant = 'solid' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  style?: ViewStyle;
}

export const Button = ({ title, onPress, variant = 'solid', size = 'medium', isLoading = false, disabled = false, icon: Icon, style }: ButtonProps) => {
  const { colors } = useTheme();
  const isDisabled = isLoading || disabled;

  const getButtonStyles = () => {
    const base: ViewStyle = { ...styles.buttonBase, ...styles[size] };
    switch (variant) {
      case 'outline': return { ...base, borderColor: colors.primary, borderWidth: 1 };
      case 'ghost': return { ...base, backgroundColor: 'transparent' };
      case 'solid':
      default: return { ...base, backgroundColor: colors.primary };
    }
  };

  const getTextStyles = () => {
    const base: any = { ...styles.textBase, ...styles[`text_${size}`] };
    switch (variant) {
      case 'outline': return { ...base, color: colors.primary };
      case 'ghost': return { ...base, color: colors.textSecondary };
      case 'solid':
      default: return { ...base, color: '#FFFFFF' };
    }
  };

  const buttonStyle = [getButtonStyles(), isDisabled && styles.disabled, style];
  const textStyle = getTextStyles();
  const iconColor = textStyle.color;

  return (
    <TouchableOpacity onPress={onPress} style={buttonStyle} disabled={isDisabled}>
      {isLoading ? <ActivityIndicator color={iconColor} /> : (
        <>
          {Icon && <Icon color={iconColor} size={18} style={styles.icon} />}
          <Text style={textStyle}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 12, gap: 8 },
  textBase: { fontWeight: '600', textAlign: 'center' },
  disabled: { opacity: 0.5 },
  icon: {},
  small: { paddingVertical: 8, paddingHorizontal: 12 },
  medium: { paddingVertical: 12, paddingHorizontal: 20 },
  large: { paddingVertical: 16, paddingHorizontal: 24 },
  text_small: { fontSize: 14 },
  text_medium: { fontSize: 16 },
  text_large: { fontSize: 18 },
});