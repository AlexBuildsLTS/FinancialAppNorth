import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { Briefcase, User, LucideIcon } from 'lucide-react-native';

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

const iconSizeMap: Record<ButtonSize, number> = {
  small: 14,
  medium: 16,
  large: 20,
};

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

  const buttonStyles: ViewStyle[] = [ styles.buttonBase, styles[size] ];
  if (variant === 'solid') buttonStyles.push({ backgroundColor: colors.primary });
  else if (variant === 'outline') buttonStyles.push({ borderColor: colors.primary, borderWidth: 2 });
  if (isDisabled) buttonStyles.push(styles.disabled);
  if (style) buttonStyles.push(style);

  const textStyles: TextStyle[] = [ styles.textBase, styles[`text_${size}`] ];
  if (variant === 'solid') textStyles.push({ color: colors.primaryContrast });
  else if (variant === 'ghost') textStyles.push({ color: colors.textSecondary });
  else textStyles.push({ color: colors.primary });

  const iconColor = textStyles[textStyles.length - 1].color;

  return (
    <TouchableOpacity onPress={onPress} style={buttonStyles} disabled={isDisabled}>
      {isLoading ? (
        <ActivityIndicator color={variant === 'solid' ? colors.primaryContrast : colors.primary} />
      ) : (
        <>
          {Icon && <Icon color={iconColor} size={iconSizeMap[size]} style={styles.icon} />}
          <Text style={textStyles}>{title}</Text>
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