import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/shared/context/ThemeProvider';
interface PasswordStrengthInfo {
  strength: 'empty' | 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
  color: string;
}

const getPasswordStrength = (password: string, colors: any): PasswordStrengthInfo => {
    if (!password) return { strength: 'empty', score: 0, color: colors.textSecondary };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (password.length > 0 && password.length < 6) return { strength: 'weak', score: 1, color: colors.error };
    if (score <= 1) return { strength: 'weak', score: 1, color: colors.error };
    if (score === 2) return { strength: 'medium', score: 2, color: colors.warning };
    if (score === 3) return { strength: 'strong', score: 3, color: '#2E7D32' };
    if (score >= 4) return { strength: 'very-strong', score: 4, color: colors.success };
    return { strength: 'empty', score: 0, color: colors.textSecondary };
};

interface Props {
  password?: string;
  onStrengthChanged?: (strength: 'empty' | 'weak' | 'medium' | 'strong' | 'very-strong') => void;
}

export default function PasswordStrengthIndicator({ password = '', onStrengthChanged }: Props) {
  const { theme: { colors } } = useTheme();
  const { strength, score, color } = getPasswordStrength(password, colors);

  React.useEffect(() => {
    if (onStrengthChanged) onStrengthChanged(strength);
  }, [strength, onStrengthChanged]);

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        {Array.from({ length: 4 }).map((_, index) => {
            const animatedStyle = useAnimatedStyle(() => ({ // Use colors.border as a fallback for surfaceVariant
                backgroundColor: withTiming(index < score ? color : colors.border, { duration: 300 }),
            }));
            return <Animated.View key={index} style={[ styles.barSegment, animatedStyle ]} />
        })}
      </View>
      {password.length > 0 && (
        <Text style={[styles.strengthText, { color }]}>{strength.replace('-', ' ')}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  barContainer: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', gap: 4 },
  barSegment: { flex: 1, height: '100%', borderRadius: 3 },
  strengthText: { marginTop: 6, textAlign: 'right', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
});