import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeProvider';

interface PasswordStrengthInfo {
  strength: 'Weak' | 'Fair' | 'Good' | 'Strong';
  score: number;
  color: string;
}

const getPasswordStrength = (password: string, colors: any): PasswordStrengthInfo => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
        case 1: return { strength: 'Weak', score, color: colors.error };
        case 2: return { strength: 'Fair', score, color: colors.warning };
        case 3: return { strength: 'Good', score, color: '#28a745' }; // A distinct good green
        case 4: return { strength: 'Strong', score, color: colors.success };
        default: return { strength: 'Weak', score: 0, color: colors.error };
    }
};

interface Props {
  password?: string;
}

export default function PasswordStrengthIndicator({ password = '' }: Props) {
  const { colors } = useTheme();
  const { strength, score, color } = getPasswordStrength(password, colors);

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
        <Text style={[styles.strengthText, { color }]}>{strength}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16, paddingHorizontal: 4 },
  barContainer: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', gap: 4 },
  barSegment: { flex: 1, height: '100%', borderRadius: 3 },
  strengthText: { marginTop: 6, textAlign: 'right', fontSize: 12, fontWeight: '600' },
});