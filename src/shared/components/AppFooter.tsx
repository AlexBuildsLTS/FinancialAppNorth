import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { Github, Twitter, Linkedin, Mail, Phone, MapPin, Facebook, Instagram } from 'lucide-react-native';
import { color } from '@shopify/restyle';

export const AppFooter = () => {
  const { theme, isDark } = useTheme();
  
  const footerBg = isDark ? '#051021' : '#F1F5F9'; 
  const titleColor = isDark ? '#FFFFFF' : '#0F172A';
  const textColor = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  return (
    <View style={[styles.container, { backgroundColor: footerBg, borderTopColor: borderColor }]}>
      
      <View style={styles.grid}>
        <View style={styles.column}>
          <Text style={[styles.title, { color: titleColor }]}>Company</Text>
          <FooterLink text="About Us" color={textColor} />
          <FooterLink text="Careers" color={textColor} />
          <FooterLink text="Press" color={textColor} />
        </View>

        <View style={styles.column}>
          <Text style={[styles.title, { color: titleColor }]}>Legal</Text>
          <FooterLink text="Privacy Policy" color={textColor} />
          <FooterLink text="Terms of Service" color={textColor} />
          <FooterLink text="Security" color={textColor} />
        </View>
      </View>
 
      <View style={[styles.divider, { backgroundColor: borderColor }]} />

      <View style={styles.section}>
        <Text style={[styles.title, { color: titleColor }]}>Get in Touch</Text>
        <View style={styles.row}><Mail size={14} color={theme.colors.primary} /><Text style={[styles.text, { color: textColor }]}> support@northfinance.com</Text></View>
        <View style={styles.row}><Phone size={14} color={theme.colors.primary} /><Text style={[styles.text, { color: textColor }]}> 1-800-NORTH-FIN</Text></View>
        <View style={styles.row}><MapPin size={14} color={theme.colors.primary} /><Text style={[styles.text, { color: textColor }]}> 123 Finance St, Money City</Text></View>
      </View>
      <View style={styles.socialRow}>
 <SocialIcon icon={Twitter} color={textColor} />
 <SocialIcon icon={Linkedin} color={textColor} />
 <SocialIcon icon={Github} color={textColor} />
 <SocialIcon icon={Facebook} color={textColor} />
 <SocialIcon icon={Instagram} color={textColor} />
      </View>

      <Text style={[styles.copyright, { color: textColor }]}>© 2025 NorthFinance. All rights reserved.</Text>
    </View>
 );
};
const FooterLink = ({ text, color }: any) => <TouchableOpacity style={{ marginBottom: 8 }}><Text style={{ color, fontSize: 13 }}>{text}</Text></TouchableOpacity>;
const SocialIcon = ({ icon: Icon, color }: any) => <TouchableOpacity style={{ marginRight: 20 }}><Icon size={20} color={color} /></TouchableOpacity>;

const styles = StyleSheet.create({
  container: { padding: 32, borderTopWidth: 1, width: '100%', marginTop: 40 },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  column: { width: '45%' },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  section: { marginBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  text: { fontSize: 13, marginLeft: 8 },
  socialRow: { flexDirection: 'row', marginTop: 4 },
  divider: { height: 1, width: '100%', marginBottom: 24 },
  copyright: { textAlign: 'center', fontSize: 12, marginTop: 12, opacity: 0.6 }
});