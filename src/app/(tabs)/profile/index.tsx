import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, User as UserIcon, Shield, KeyRound, Settings, LogOut, BarChart2 } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import ScreenContainer from '@/components/ScreenContainer';

const ProfileListItem = ({ icon: Icon, text, onPress, colors }: any) => (
  <TouchableOpacity style={[styles.listItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]} onPress={onPress}>
    <Icon color={colors.textSecondary} size={22} />
    <Text style={[styles.listItemText, { color: colors.text }]}>{text}</Text>
    <ChevronRight color={colors.textSecondary} size={22} />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const isProfessional = user?.role === 'Professional (CPA)' || user?.role === 'Administrator';

  const profileMenuItems = [
    { icon: UserIcon, text: 'Edit Profile', path: '/profile/edit' },
    { icon: Shield, text: 'Security', path: '/profile/security' },
    { icon: KeyRound, text: 'AI Provider API Keys', path: '/profile/api-keys' },
  ];

  const professionalMenuItems = [
    { icon: BarChart2, text: 'Personal Analytics', path: '/client-dashboard/personal' }, // Placeholder path
  ];

  const generalMenuItems = [
    { icon: Settings, text: 'Settings', path: '/(tabs)/settings' },
    { icon: LogOut, text: 'Sign Out', onPress: signOut },
  ];

  return (
    <ScreenContainer>
      <ScrollView>
        <View style={styles.header}>
          <Image
            source={{ uri: user?.avatar_url || `https://i.pravatar.cc/150?u=${user?.id}` }}
            style={styles.avatar}
          />
          <Text style={[styles.name, { color: colors.text }]}>{user?.user_metadata?.display_name || 'User Name'}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
          {user?.role && (
            <Text style={[styles.role, { color: colors.textSecondary }]}>{user.role}</Text>
          )}
          {user?.profession && (
            <Text style={[styles.profession, { color: colors.textSecondary }]}>{user.profession}</Text>
          )}
        </View>

        <View style={styles.menuSection}>
          {profileMenuItems.map((item) => (
            <ProfileListItem key={item.text} icon={item.icon} text={item.text} onPress={() => router.push(item.path as any)} colors={colors} />
          ))}
        </View>

        {isProfessional && (
          <View style={styles.menuSection}>
            {professionalMenuItems.map((item) => (
              <ProfileListItem key={item.text} icon={item.icon} text={item.text} onPress={() => router.push(item.path as any)} colors={colors} />
            ))}
          </View>
        )}
        
        <View style={styles.menuSection}>
           {generalMenuItems.map((item) => (
            <ProfileListItem 
              key={item.text} 
              icon={item.icon} 
              text={item.text} 
              onPress={item.onPress ? item.onPress : () => router.push(item.path as any)} 
              colors={colors} 
            />
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
    header: { alignItems: 'center', paddingVertical: 32 },
    avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16, borderWidth: 2, borderColor: '#333'},
    name: { fontSize: 24, fontWeight: 'bold' },
    email: { fontSize: 16, marginTop: 4 },
    role: { fontSize: 14, marginTop: 2, fontStyle: 'italic' },
    profession: { fontSize: 14, marginTop: 2, fontStyle: 'italic' },
    menuSection: { marginHorizontal: 16, marginTop: 20, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#333' },
    listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 16, borderBottomWidth: 1 },
    listItemText: { flex: 1, fontSize: 16, marginLeft: 16, fontWeight: '500' },
});
