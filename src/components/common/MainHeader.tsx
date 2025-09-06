import AnimatedThemeIcon from '@/components/common/AnimatedThemeIcon';
import Avatar from '@/components/common/Avatar';
import DropdownMenu from '@/components/common/DropdownMenu';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';
import { UserRole } from '@/types';
import { useRouter } from 'expo-router';
import { Bell, LogOut, MessageSquare, Settings, Shield, UserCog } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const MenuItem = ({ text, icon: Icon, onPress, color }: { text: string, icon: React.ElementType, onPress: () => void, color: string }) => (
  <Pressable style={styles.menuItem} onPress={onPress}>
    <Icon color={color} size={18} />
    <Text style={[styles.menuText, { color }]}>{text}</Text>
  </Pressable>
);

const MainHeader = () => {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={styles.leftSection}>
        <Text style={[styles.logo, { color: colors.primary }]}>NorthFinance</Text>
      </View>
      
      <View style={styles.rightContainer}>
        <AnimatedThemeIcon />
        
        <DropdownMenu trigger={<Bell color={colors.textSecondary} size={22} />}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No new notifications</Text>
        </DropdownMenu>
        
        <DropdownMenu trigger={<MessageSquare color={colors.textSecondary} size={22} />}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No new messages</Text>
        </DropdownMenu>
        
        <DropdownMenu trigger={<Avatar url={profile?.avatar_url} name={profile?.display_name} size={36} />}>
          <MenuItem text="Edit Profile" icon={UserCog} color={colors.text} onPress={() => router.push('/(tabs)/profile/edit')} />
          <MenuItem text="Settings" icon={Settings} color={colors.text} onPress={() => router.push('/(tabs)/settings')} />
          {(profile?.role === UserRole.SUPPORT || profile?.role === UserRole.ADMIN) && (
            <MenuItem text="Admin Panel" icon={Shield} color={colors.text} onPress={() => router.push('/(tabs)/admin')} />
          )}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuItem text="Sign Out" icon={LogOut} color={colors.error} onPress={handleSignOut} />
        </DropdownMenu>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    height: 60, 
    borderBottomWidth: 1 
  },
  leftSection: {
    flex: 1,
  },
  logo: { 
    fontSize: 20, 
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
  rightContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 20 
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    gap: 12 
  },
  menuText: { 
    fontSize: 16, 
    fontFamily: 'Inter_400Regular' 
  },
  divider: { 
    height: StyleSheet.hairlineWidth, 
    marginVertical: 8 
  },
  emptyText: { 
    padding: 16, 
    fontStyle: 'italic', 
    fontFamily: 'Inter_400Regular' 
  },
});

export default MainHeader;