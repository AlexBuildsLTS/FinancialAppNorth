import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { Github, Linkedin, Globe, Twitter } from 'lucide-react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';

// NUCLEAR FIX: Force TypeScript to accept 'any' to prevent build errors
interface Props { scrollY: any; }

export const AuthScreenFooter = ({ scrollY }: Props) => {
  const { theme } = useTheme();
  const { colors } = theme;

  // Animation logic
  const animatedStyle = useAnimatedStyle(() => {
    const val = scrollY?.value ?? 0; 
    return {
      opacity: interpolate(val, [0, 100], [1, 0.5], Extrapolation.CLAMP),
      transform: [{ translateY: interpolate(val, [0, 100], [0, 20], Extrapolation.CLAMP) }]
    };
  });

  const openLink = (url: string) => Linking.openURL(url);

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.divider}>
        <View style={[styles.line, { backgroundColor: colors.border }]} />
        <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
          Connect with NorthFinance
        </Text>
        <View style={[styles.line, { backgroundColor: colors.border }]} />
      </View>

      <View style={styles.socialRow}>
        <SocialBtn icon={Github} onPress={() => openLink('https://github.com')} />
        <SocialBtn icon={Linkedin} onPress={() => openLink('https://linkedin.com')} />
        <SocialBtn icon={Twitter} onPress={() => openLink('https://twitter.com')} />
        <SocialBtn icon={Globe} onPress={() => openLink('https://northfinance.com')} />
      </View>

      <Text style={[styles.copyright, { color: colors.textSecondary }]}>
        © 2025 NorthFinance Technologies. All rights reserved.
      </Text>
    </Animated.View>
  );
};

const SocialBtn = ({ icon: Icon, onPress }: any) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[styles.iconBtn, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
    >
      <Icon size={20} color={theme.colors.text} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 40, alignItems: 'center', width: '100%' },
  divider: { flexDirection: 'row', alignItems: 'center', width: '85%', maxWidth: 400, marginBottom: 24 },
  line: { flex: 1, height: 1, opacity: 0.4 },
  dividerText: { marginHorizontal: 12, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  socialRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  copyright: { fontSize: 12, opacity: 0.6 },
});

export default AuthScreenFooter;