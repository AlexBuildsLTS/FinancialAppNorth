import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import ScreenContainer from '@/components/ScreenContainer';

export default function ProcessDocumentScreen() {
  const { colors } = useTheme();

  return (
    <ScreenContainer style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.title, { color: colors.text }]}>
        Processing Document
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Please wait while we extract the information...
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
  },
});