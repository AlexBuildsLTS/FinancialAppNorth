import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Bell, Shield, Palette, LogOut, Info, Globe } from 'lucide-react-native'; // Import Globe icon
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import ScreenContainer from '@/components/ScreenContainer';
import { Cards } from '@/components/Cards';

const SettingsListItem = ({ icon: Icon, text, onPress, rightContent, colors, isFirst, isLast }: any) => (
  <TouchableOpacity
    style={[
      styles.listItem,
      { borderBottomColor: colors.border, backgroundColor: colors.surface },
      isFirst && styles.isFirst,
      isLast && styles.isLast,
    ]}
    onPress={onPress}
  >
    <Icon color={colors.primary} size={22} />
    <Text style={[styles.listItemText, { color: colors.text }]}>{text}</Text>
    {rightContent ? rightContent : <ChevronRight color={colors.textSecondary} size={22} />}
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { colors } = theme;
  const { signOut } = useAuth();
  const router = useRouter();

  type AppRoute = "/(main)/settings" | "/(main)/profile/security" | "/(main)/profile/localization"; // Add new path

  interface MenuItem {
    icon: any;
    text: string;
    path: AppRoute;
  }

  const menuItems: MenuItem[] = [
    { icon: Bell, text: 'Notifications', path: '/(main)/settings' }, // Placeholder path
    { icon: Shield, text: 'Security & Privacy', path: '/(main)/profile/security' },
    { icon: Globe, text: 'Localization', path: '/(main)/profile/localization' }, // New Localization item
    { icon: Info, text: 'About NorthFinance', path: '/(main)/settings' }, // Placeholder path
  ];

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        <Cards style={styles.menuSection}>
          <SettingsListItem
            icon={Palette}
            text="Dark Mode"
            onPress={toggleTheme}
            rightContent={
              <Switch
                trackColor={{ false: '#767577', true: colors.primary }}
                thumbColor={isDark ? colors.surface : '#0328cfff'}
                onValueChange={toggleTheme}
                value={isDark}
              />
            }
            colors={colors}
            isFirst
            isLast
          />
        </Cards>

        <Cards style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <SettingsListItem
              key={item.text}
              icon={item.icon}
              text={item.text}
              onPress={() => router.push(item.path)}
              colors={colors}
              isFirst={index === 0}
              isLast={index === menuItems.length - 1}
            />
          ))}
        </Cards>

        <Cards style={styles.menuSection}>
          <SettingsListItem
            icon={LogOut}
            text="Sign Out"
            onPress={signOut}
            colors={colors}
            isFirst
            isLast
          />
        </Cards>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 30 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 24 },
  menuSection: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden', // to clip children to the border radius
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,

    borderBottomWidth: 1,
  },
  isFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  isLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomWidth: 0,
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 20,
    fontFamily: 'Inter-SemiBold',
  },
});
