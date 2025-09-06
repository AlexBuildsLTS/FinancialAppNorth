import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import ScreenContainer from '@/components/ScreenContainer';
import { LifeBuoy } from 'lucide-react-native';

export default function SupportScreen() {
  const { colors } = useTheme();

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        <LifeBuoy size={64} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Support Center</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Get help with your account and financial management
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
  subtitle: { 
    fontSize: 16, 
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
});