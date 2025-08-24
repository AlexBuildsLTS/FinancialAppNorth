import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { User, Key, Shield, LogOut, ChevronRight, CircleHelp as HelpCircle, BarChartHorizontalBig } from 'lucide-react-native';

// A single, reusable component for each menu item.
const MenuItem = ({ icon: Icon, label, onPress, colors }: any) => (
  <TouchableOpacity
    style={[styles.menuItem, { borderBottomColor: colors.border }]}
    onPress={onPress}
  >
    {/* Each element is on its own line to prevent accidental spaces */}
    <Icon color={colors.textSecondary} size={22} />
    <Text style={[styles.menuLabel, { color: colors.text }]}>{label}</Text>
    <ChevronRight color={colors.textSecondary} size={22} />
  </TouchableOpacity>
);

const ProfileScreen = () => {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const [clientModeEnabled, setClientModeEnabled] = React.useState(false);
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleClientModeToggle = async (enabled: boolean) => {
    setClientModeEnabled(enabled);
    // In a real implementation, you would update the user's profile
    // to indicate they want to receive professional help
    try {
      // Update user profile to enable/disable client mode
      console.log('Client mode:', enabled ? 'enabled' : 'disabled');
    } catch (error) {
      console.error('Error updating client mode:', error);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Image source={{ uri: user?.avatarUrl }} style={styles.avatar} />
        <Text style={[styles.displayName, { color: colors.text }]}>
          {user?.displayName}
        </Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>
          {user?.email}
        </Text>
        <View style={[styles.roleBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.roleText}>{user?.role}</Text>
        </View>
      </View>

      {/* Client Mode Toggle for Professional Help */}
      {(user?.role === 'Member' || user?.role === 'Premium Member') && (
        <View style={[styles.clientModeSection, { backgroundColor: colors.surface }]}>
          <View style={styles.clientModeHeader}>
            <HelpCircle color={colors.primary} size={24} />
            <View style={styles.clientModeText}>
              <Text style={[styles.clientModeTitle, { color: colors.text }]}>
                Professional Help
              </Text>
              <Text style={[styles.clientModeDescription, { color: colors.textSecondary }]}>
                Allow professionals to access your account for assistance
              </Text>
            </View>
            <Switch
              value={clientModeEnabled}
              onValueChange={handleClientModeToggle}
              trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
            />
          </View>
        </View>
      )}

      {/* This is where an error could hide. 
        For example, if you had a character here:
        <View style={styles.menu}>
          x  <-- THIS 'x' WOULD CRASH THE APP
          <MenuItem ... /> 
        </View>
      */}
      <View style={styles.menu}>
        <MenuItem
          icon={User}
          label="Edit Profile"
          onPress={() => router.push('/profile/edit')}
          colors={colors}
        />
        <MenuItem
          icon={Shield}
          label="Security"
          onPress={() => router.push('/profile/security')}
          colors={colors}
        />
        <MenuItem
          icon={Key}
          label="AI Provider API Keys"
          onPress={() => router.push('/profile/api-keys')}
          colors={colors}
        />

        {/* Conditional rendering for the admin panel link */}
        {user?.role === 'Administrator' && (
          <MenuItem
            icon={BarChartHorizontalBig}
            label="Admin Panel"
            onPress={() => router.push('/admin')}
            colors={colors}
          />
        )}
      </View>

      {/* Support Access for Admins/Professionals */}
      {(user?.role === 'Administrator' || user?.role === 'Professional Accountant' || user?.role === 'Support') && (
        <View style={styles.menu}>
          <MenuItem
            icon={HelpCircle}
            label="Client Support Access"
            onPress={() => router.push('/client-support')}
            colors={colors}
          />
        </View>
      )}

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <LogOut color={colors.error} size={22} />
        <Text style={[styles.signOutText, { color: colors.error }]}>
          Sign Out
        </Text>
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
  clientModeSection: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
  },
  clientModeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clientModeText: { flex: 1 },
  clientModeTitle: { fontSize: 16, fontWeight: '600' },
  clientModeDescription: { fontSize: 14, marginTop: 2 },
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
