import React, { ReactNode, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/shared/context/ThemeProvider';
import { RelativePathString, useRouter } from 'expo-router';

interface FooterLink {
  label: string;
  url?: string; // For external links or internal routes
  onPress?: () => void; // For custom actions
}

interface FooterProps {
  style?: object;
  isVisible?: boolean; // Control visibility for animation
}

const Footer = ({ style, isVisible = true }: FooterProps) => {
  const { theme: { colors } } = useTheme();
  const router = useRouter();
  const translateY = useSharedValue(0);

  // Animation for sliding in from the bottom
  useEffect(() => {
    if (isVisible) {
      translateY.value = withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      });
    } else {
      // Optionally animate out if needed, or just keep it visible
      // For this task, we assume it appears on mount
    }
  }, [isVisible, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const footerLinks: { title: string; links: FooterLink[] }[] = [
    {
      title: 'Company',
      links: [
        { label: 'About Us', url: '/company/about' },
        { label: 'Careers', url: '/careers' },
        { label: 'Press', url: '/company/press' },
        { label: 'Blog', url: '/blog' },
      ],
    },
    {
      title: 'Products',
      links: [
        { label: 'Personal Finance', url: '/products/personal-finance' },
        { label: 'Business Solutions', url: '/products/business-solutions' },
        { label: 'CPA Tools', url: '/products/cpa-tools' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Help Center', url: '/resources/help' },
        { label: 'Documentation', url: '/resources/documentation' },
        { label: 'Community', url: '/resources/community' },
        { label: 'Status', url: '/resources/status' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', url: '/legal/privacy' },
        { label: 'Terms of Service', url: '/legal/terms' },
        { label: 'Cookie Policy', url: '/legal/cookies' },
        { label: 'Security', url: '/legal/security' },
      ],
    },
  ];
  const handleLinkPress = (link: FooterLink) => {
    const isInternal = /^\/(resources|legal|products)/.test(link.url ?? '');
    if (isInternal && link.url) {
      router.push(link.url as RelativePathString);
    } else if (link.onPress) {
      link.onPress();
    }
  };

  return (
<Animated.View style={[
  styles.footerContainer,
  { backgroundColor: colors.surface, borderColor: colors.border },
  animatedStyle,
  style
]}  
>
      <View style={styles.contentWrapper}>
        <View style={styles.linksSection}>
          {footerLinks.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.linkColumn}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
              {section.links.map((link, linkIndex) => (
                <TouchableOpacity key={linkIndex} onPress={() => handleLinkPress(link)} style={styles.linkItem}>
                  <Text style={[styles.linkText, { color: colors.textSecondary }]}>{link.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>   
        <View style={styles.contactAndSocialSection}>       
          <View style={styles.contactInfo}>        <Text style={[styles.contactItem, { color: colors.textSecondary }]}>
                  <Text style={{ fontWeight: 'bold', color: colors.text }}>Email:</Text> info@northfinance.com
                </Text>
                  </View>
            <View style={styles.contactInfo}>
          <Text style={[styles.contactItem, { color: colors.textSecondary }]}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>Support:</Text> support@northfinance.com
          </Text>
          <Text style={[styles.contactItem, { color: colors.textSecondary }]}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>Address:</Text> 123 Finance Street, San Francisco, CA 94102
          </Text>
        </View>
        <View style={styles.socialIcons}>
          {/* Placeholder for social icons */}
          <Text style={{ color: colors.textSecondary }}>[Social Icons]</Text>
        </View>
      </View>
    </View>
    <View style={[styles.copyrightSection, { borderColor: colors.border }]}>
      <Text style={[styles.copyrightText, { color: colors.textSecondary }]}>
        © 2025 NorthFinance. All rights reserved.
      </Text>
    </View>
</Animated.View>
);
};

const styles = StyleSheet.create({
  footerContainer: {
    width: '100%',
    borderTopWidth: 1,
    paddingTop: 24,
    paddingBottom: 16, // Adjusted for copyright
    position: 'absolute', // Position at the bottom
    bottom: 0,
    left: 0,
    zIndex: 10, // Ensure it's above other content
  },
  contentWrapper: {
    paddingHorizontal: 24,
    marginBottom: 24, // Space before copyright
  },
  linksSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 32,
  },
  linkColumn: {
    flex: 1,
    minWidth: 150, // Ensure columns don't get too narrow
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  linkItem: {
    paddingVertical: 6,
  },
  linkText: {
    fontSize: 14,
  },
  contactAndSocialSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  contactInfo: {
    flex: 2, // Takes more space
    marginRight: 20,
  },
  contactItem: {
    fontSize: 14,
    marginBottom: 8,
  },
  socialIcons: {
    flex: 1, // Takes less space
    alignItems: 'flex-end',
  },
  copyrightSection: {
    borderTopWidth: 1,
    paddingTop: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 12,
  },
});

export default Footer;
