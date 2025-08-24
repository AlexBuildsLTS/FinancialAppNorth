import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Bell, Shield, Palette, LogOut, Info } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import ScreenContainer from '@/components/ScreenContainer';

const SettingsListItem = ({ icon: Icon, text, onPress, rightContent, colors }: any) => (
  <TouchableOpacity style={[styles.listItem, { backgroundColor: colors.surface, borderBottomColor: colors.background }]} onPress={onPress}>
    <Icon color={colors.textSecondary} size={22} />
    <Text style={[styles.listItemText, { color: colors.text }]}>{text}</Text>
    {rightContent ? rightContent : <ChevronRight color={colors.textSecondary} size={22} />}
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const router = useRouter();

  type AppRoute = "/(tabs)/settings" | "/(tabs)/profile/security";

  interface MenuItem {
    icon: any;
    text: string;
    path: AppRoute;
  }

  const menuItems: MenuItem[] = [
    { icon: Bell, text: 'Notifications', path: '/(tabs)/settings' }, // Placeholder path, ideally should go to a notifications settings page
    { icon: Shield, text: 'Security & Privacy', path: '/(tabs)/profile/security' },
    { icon: Info, text: 'About NorthFinance', path: '/(tabs)/settings' }, // Placeholder path, ideally should go to an about page
  ];

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>
      <ScrollView>
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, {color: colors.textSecondary}]}>PREFERENCES</Text>
          {menuItems.map((item) => (
            <SettingsListItem key={item.text} icon={item.icon} text={item.text} onPress={() => router.push(item.path)} colors={colors} />
          ))}
           <SettingsListItem
              icon={Palette}
              text="Dark Mode"
              onPress={toggleTheme}
              rightContent={
                <Switch
                    trackColor={{ false: '#767577', true: colors.primary }}
                    thumbColor={isDark ? colors.surface : '#f4f3f4'}
                    onValueChange={toggleTheme}
                    value={isDark}
                />
              }
              colors={colors}
            />
        </View>

        <View style={styles.menuSection}>
            <Text style={[styles.sectionTitle, {color: colors.textSecondary}]}>ACCOUNT</Text>
            <SettingsListItem 
                icon={LogOut} 
                text="Sign Out" 
                onPress={signOut}
                colors={colors} 
            />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
    header: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10 },
    title: { fontSize: 32, fontWeight: 'bold' },
    menuSection: { marginHorizontal: 16, marginTop: 24 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', paddingLeft: 16, marginBottom: 8 },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 2, // Creates a subtle separation
        borderBottomWidth: 1,
    },
    listItemText: {
        flex: 1,
        fontSize: 16,
        marginLeft: 16,
    },
});