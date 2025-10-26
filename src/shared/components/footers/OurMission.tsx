import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeProvider';

export function OurMission() {
  const { theme } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
        Our Mission
      </Text>
      <Text style={[styles.paragraph, { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular }]}>
        We believe financial clarity should be accessible to everyone. Our mission is to democratize professional-grade financial management tools, making them intuitive enough for individuals while powerful enough for certified professionals. Through innovative technology and human expertise, we help our users make informed financial decisions with confidence.
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
