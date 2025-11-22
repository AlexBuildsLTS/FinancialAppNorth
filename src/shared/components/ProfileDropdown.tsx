import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut, Settings, User } from 'lucide-react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { useAuth } from '@/shared/context/AuthContext';

interface ProfileDropdownProps {
  closeMenu: () => void;
}

export const ProfileDropdown = ({ closeMenu }: ProfileDropdownProps) => {
  const { theme } = useTheme();
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    if (closeMenu) closeMenu();
    await signOut();
    router.replace('/(auth)/login');
  };

  const handleNav = (path: any) => {
    if (closeMenu) closeMenu();
    router.push(path);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Pressable onPress={() => handleNav('/profile')} style={styles.option}>
        <User size={18} color={theme.colors.text} />
        <Text style={[styles.text, { color: theme.colors.text }]}>Profile</Text>
      </Pressable>
      <Pressable onPress={() => handleNav('/settings')} style={styles.option}>
        <Settings size={18} color={theme.colors.text} />
        <Text style={[styles.text, { color: theme.colors.text }]}>Settings</Text>
      </Pressable>
      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
      <Pressable onPress={handleSignOut} style={styles.option}>
        <LogOut size={18} color={theme.colors.error} />
        <Text style={[styles.text, { color: theme.colors.error }]}>Sign Out</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: 200, borderRadius: 16, borderWidth: 1, padding: 8, elevation: 5 },
  option: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  text: { fontSize: 14 },
  divider: { height: 1, marginVertical: 4, opacity: 0.5 },
});