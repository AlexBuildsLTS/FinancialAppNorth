import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeProvider';

interface PasswordStrengthInfo {
  strength: 'empty' | 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
  color: string;
}

const getPasswordStrength = (password: string, colors: any): PasswordStrengthInfo => {
    if (!password) {
        return { strength: 'empty', score: 0, color: colors.textSecondary };
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    // More granular strength based on score and length
    if (password.length < 6) {
        return { strength: 'weak', score: 0, color: colors.error };
    } else if (score <= 1) {
        return { strength: 'weak', score: 1, color: colors.error };
    } else if (score === 2) {
        return { strength: 'medium', score: 2, color: colors.warning };
    } else if (score === 3) {
        return { strength: 'strong', score: 3, color: '#28a745' }; // A distinct good green
    } else if (score >= 4) {
        return { strength: 'very-strong', score: 4, color: colors.success };
    }
    return { strength: 'empty', score: 0, color: colors.textSecondary }; // Fallback
};

interface Props {
  password?: string;
  onStrengthChanged?: (strength: 'empty' | 'weak' | 'medium' | 'strong' | 'very-strong') => void;
}

export default function PasswordStrengthIndicator({ password = '', onStrengthChanged }: Props) {
  const { colors } = useTheme();
  const { strength, score, color } = getPasswordStrength(password, colors);

  React.useEffect(() => {
    if (onStrengthChanged) {
      onStrengthChanged(strength);
    }
  }, [strength, onStrengthChanged]);

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        {Array.from({ length: 4 }).map((_, index) => {
            const animatedStyle = useAnimatedStyle(() => {
                return {
                    backgroundColor: withTiming(index < score ? color : colors.surfaceVariant, { duration: 300 }),
                };
            });
            return (
                <Animated.View
                    key={index}
                    style={[ styles.barSegment, animatedStyle ]}
                />
            )
        })}
      </View>
      {password.length > 0 && (
        <Text style={[styles.strengthText, { color }]}>{strength.replace('-', ' ')}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16, paddingHorizontal: 4 },
  barContainer: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', gap: 4 },
  barSegment: { flex: 1, height: '100%', borderRadius: 3 },
  strengthText: { marginTop: 6, textAlign: 'right', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
});