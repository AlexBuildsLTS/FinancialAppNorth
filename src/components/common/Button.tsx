import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { LucideIcon } from 'lucide-react-native';

type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'destructive' | 'secondary';
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

export default function Button({
  title,
  onPress,
  variant = 'solid',
  size = 'medium',
  isLoading = false,
  disabled = false,
  icon: Icon,
  style,
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = isLoading || disabled;

  const getButtonStyles = () => {
    const base: ViewStyle = { ...styles.buttonBase, ...styles[size] };
    switch (variant) {
      case 'outline': return { ...base, borderColor: colors.primary, borderWidth: 2 };
      case 'ghost': return { ...base, backgroundColor: 'transparent' };
      case 'destructive': return { ...base, backgroundColor: colors.error };
      case 'secondary': return { ...base, backgroundColor: colors.surfaceVariant };
      case 'solid':
      default: return { ...base, backgroundColor: colors.primary };
    }
  };

  const getTextStyles = () => {
    const base: any = { ...styles.textBase, ...styles[`text_${size}`] };
    switch (variant) {
      case 'outline': return { ...base, color: colors.primary };
      case 'ghost': return { ...base, color: colors.textSecondary };
      case 'secondary': return { ...base, color: colors.text };
      case 'destructive':
      case 'solid':
      default: return { ...base, color: colors.primaryContrast };
    }
  };

  const buttonStyle = [getButtonStyles(), isDisabled && styles.disabled, style];
  const textStyle = getTextStyles();
  const iconColor = textStyle.color;

  return (
    <TouchableOpacity onPress={onPress} style={buttonStyle} disabled={isDisabled}>
      {isLoading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <>
          {Icon && <Icon color={iconColor} size={16} style={styles.icon} />}
          <Text style={textStyle}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonBase: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 12, gap: 8 },
  textBase: { fontFamily: 'Inter-Bold', fontWeight: '600', textAlign: 'center' },
  disabled: { opacity: 0.6 },
  icon: {},
  small: { paddingVertical: 8, paddingHorizontal: 12 },
  medium: { paddingVertical: 12, paddingHorizontal: 20 },
  large: { paddingVertical: 16, paddingHorizontal: 24 },
  text_small: { fontSize: 12 },
  text_medium: { fontSize: 14 },
  text_large: { fontSize: 16 },
});