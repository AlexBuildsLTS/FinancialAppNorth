import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react-native';
import { useTheme } from '../context/ThemeProvider';

export function SmallFooter() {
  const { theme } = useTheme();

  const footerSections = [
    {
      title: 'Company',
      links: ['About Us', 'Careers', 'Press', 'Blog'],
    },
    {
      title: 'Products',
      links: ['Personal Finance', 'Business', 'CPA Tools'],
    },
    {
      title: 'Resources',
      links: ['Help Center', 'Documentation', 'Community', 'Status'],
    },
    {
      title: 'Legal',
      links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
    },
  ];

  return (
    <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
      <View style={styles.container}>
        <View style={styles.sectionsContainer}>
          {footerSections.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.fonts.semiBold }]}>
                {section.title}
              </Text>
              {section.links.map((link, linkIndex) => (
                <TouchableOpacity key={linkIndex} style={styles.link}>
                  <Text style={[styles.linkText, { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular }]}>
                    {link}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.fonts.semiBold }]}>
              Get in Touch
            </Text>
            <View style={styles.contactRow}>
              <Mail size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.contactText, { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular }]}>
                support@northfinance.com
              </Text>
            </View>
            <View style={styles.contactRow}>
              <Phone size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.contactText, { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular }]}>
                +1 (555) 123-4567
              </Text>
            </View>
            <View style={styles.contactRow}>
              <MapPin size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.contactText, { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular }]}>
                123 Finance St, San Francisco, CA 94102
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <Text style={[styles.copyright, { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular }]}>
            © 2025 NorthFinance. All rights reserved.
          </Text>
          <View style={styles.socialIcons}>
            <TouchableOpacity style={styles.socialIcon}>
              <Twitter size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <Linkedin size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    borderTopWidth: 1,
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  container: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  sectionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 32,
  },
  section: {
    minWidth: 200,
    marginBottom: 24,
    marginRight: 32,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  link: {
    paddingVertical: 6,
  },
  linkText: {
    fontSize: 14,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    marginLeft: 8,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  copyright: {
    fontSize: 14,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  socialIcon: {
    padding: 8,
  },
});

export default SmallFooter;
