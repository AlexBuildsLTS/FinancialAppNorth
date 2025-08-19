import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { User, Key, Shield, LogOut, ChevronRight, BarChartHorizontalBig } from 'lucide-react-native';

// A single, reusable component for each menu item.
const MenuItem = ({ icon: Icon, label, onPress, colors }: any) => (
  <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={onPress}>
    {/* Each element is on its own line to prevent accidental spaces */}
    <Icon color={colors.textSecondary} size={22} />
    <Text style={[styles.menuLabel, { color: colors.text }]}>{label}</Text>
    <ChevronRight color={colors.textSecondary} size={22} />
  </TouchableOpacity>
);


const ProfileScreen = () => {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: signOut }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Image source={{ uri: user?.avatarUrl }} style={styles.avatar} />
        <Text style={[styles.displayName, { color: colors.text }]}>{user?.displayName}</Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.roleText}>{user?.role}</Text>
        </View>
      </View>
      
      {/* This is where an error could hide. 
        For example, if you had a character here:
        <View style={styles.menu}>
          x  <-- THIS 'x' WOULD CRASH THE APP
          <MenuItem ... /> 
        </View>
      */}
      <View style={styles.menu}>
        <MenuItem icon={User} label="Edit Profile" onPress={() => router.push('/profile/edit')} colors={colors} />
        <MenuItem icon={Shield} label="Security" onPress={() => router.push('/profile/security')} colors={colors} />
        <MenuItem icon={Key} label="AI Provider API Keys" onPress={() => router.push('/profile/api-keys')} colors={colors} />
        
        {/* Conditional rendering for the admin panel link */}
        {user?.role === 'Administrator' && (
            <MenuItem icon={BarChartHorizontalBig} label="Admin Panel" onPress={() => router.push('/admin')} colors={colors} />
        )}
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <LogOut color={colors.error} size={22} />
        <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  displayName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  email: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  roleBadge: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    textTransform: 'uppercase',
  },
  menu: {
    marginHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginLeft: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 32,
    padding: 16,
    borderRadius: 8,
  },
  signOutText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginLeft: 8,
  },
});

export default ProfileScreen;