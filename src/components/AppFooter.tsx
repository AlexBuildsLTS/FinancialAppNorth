import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { Mail, Linkedin, Twitter } from 'lucide-react-native';

const AppFooter = () => {
  const { theme: { colors } } = useTheme();

  return (
    <View style={[styles.footerContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      <Text style={[styles.copyrightText, { color: colors.textSecondary }]}>
        © {new Date().getFullYear()} NorthFinance. All rights reserved.
      </Text>
      <View style={styles.linksContainer}>
        <TouchableOpacity style={styles.link}>
          <Mail color={colors.textSecondary} size={20} />
          <Text style={[styles.linkText, { color: colors.textSecondary }]}>Contact</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.link}>
          <Linkedin color={colors.textSecondary} size={20} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.link}>
          <Twitter color={colors.textSecondary} size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
  },
  copyrightText: {
    fontSize: 12,
  },
  linksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  linkText: {
    fontSize: 12,
  },
});

export default AppFooter;
