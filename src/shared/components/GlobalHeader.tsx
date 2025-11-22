import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Bell } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/shared/context/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { ProfileDropdown } from '@/shared/components/ProfileDropdown';

export const GlobalHeader = () => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.headerWrapper}>
      <View style={[styles.glassBackground, { height: insets.top + 70 }]}>
        <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View style={[styles.bottomBorder, { borderColor: theme.colors.border }]} />
      </View>

      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>NorthFinance</Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>Welcome back</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={[styles.iconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
               <Bell size={20} color={theme.colors.text} />
            </Pressable>
            <Pressable onPress={() => setMenuVisible(!menuVisible)} style={styles.profileBtn}>
               <LinearGradient colors={[theme.colors.primary, theme.colors.accent]} style={styles.avatarGradient}>
                  <Text style={styles.avatarText}>JD</Text>
               </LinearGradient>
            </Pressable>
          </View>
        </View>
        {menuVisible && (
          <View style={[styles.dropdownWrapper, { top: insets.top + 60 }]}>
            <ProfileDropdown closeMenu={() => setMenuVisible(false)} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
  glassBackground: { position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden' },
  bottomBorder: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, opacity: 0.2, borderBottomWidth: 1 },
  headerContainer: { paddingHorizontal: 20, paddingBottom: 15, height: Platform.OS === 'ios' ? 110 : 90, justifyContent: 'flex-end' },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 50 },
  headerTitle: { fontSize: 20, fontFamily: 'Inter-Bold', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 12, fontFamily: 'Inter-Medium' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { padding: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  profileBtn: { padding: 2 },
  avatarGradient: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontSize: 14, fontFamily: 'Inter-Bold' },
  dropdownWrapper: { position: 'absolute', right: 20, zIndex: 200 }
});