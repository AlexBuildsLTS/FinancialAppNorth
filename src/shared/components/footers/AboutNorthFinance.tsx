import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeProvider';

export function AboutNorthFinance() {
  const { theme } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
        About NorthFinance
      </Text>
      <Text style={[styles.paragraph, { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular }]}>
        NorthFinance is a comprehensive financial management platform designed to empower individuals and businesses with intelligent tools for tracking, analyzing, and optimizing their financial health. We combine cutting-edge AI technology with professional CPA expertise to deliver a seamless, secure, and intuitive financial management experience.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    marginBottom: 16,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});
