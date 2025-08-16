import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Globe,
  CircleHelp as HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  type: 'navigation' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(true);
  const [darkMode, setDarkMode] = useState(isDark);

  const styles = createStyles(isDark);

  const settingSections = [
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Profile Settings',
          subtitle: 'Manage your personal information',
          icon: <User size={20} color={isDark ? '#64ffda' : '#3b82f6'} />,
          type: 'navigation' as const,
          onPress: () => console.log('Profile Settings'),
        },
        {
          id: 'security',
          title: 'Security & Privacy',
          subtitle: 'Password, 2FA, and privacy settings',
          icon: <Shield size={20} color={isDark ? '#64ffda' : '#3b82f6'} />,
          type: 'navigation' as const,
          onPress: () => console.log('Security Settings'),
        },
        {
          id: 'payment',
          title: 'Payment Methods',
          subtitle: 'Manage cards and bank accounts',
          icon: <CreditCard size={20} color={isDark ? '#64ffda' : '#3b82f6'} />,
          type: 'navigation' as const,
          onPress: () => console.log('Payment Methods'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Receive alerts and updates',
          icon: <Bell size={20} color={isDark ? '#64ffda' : '#3b82f6'} />,
          type: 'toggle' as const,
          value: notifications,
          onToggle: setNotifications,
        },
        {
          id: 'biometrics',
          title: 'Biometric Authentication',
          subtitle: 'Use fingerprint or face ID',
          icon: <Shield size={20} color={isDark ? '#64ffda' : '#3b82f6'} />,
          type: 'toggle' as const,
          value: biometrics,
          onToggle: setBiometrics,
        },
        {
          id: 'theme',
          title: 'Dark Mode',
          subtitle: 'Switch between light and dark theme',
          icon: isDark ? (
            <Sun size={20} color="#fbbf24" />
          ) : (
            <Moon size={20} color="#3b82f6" />
          ),
          type: 'toggle' as const,
          value: darkMode,
          onToggle: setDarkMode,
        },
        {
          id: 'language',
          title: 'Language',
          subtitle: 'English (US)',
          icon: <Globe size={20} color={isDark ? '#64ffda' : '#3b82f6'} />,
          type: 'navigation' as const,
          onPress: () => console.log('Language Settings'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          title: 'Help Center',
          subtitle: 'FAQs and support articles',
          icon: <HelpCircle size={20} color={isDark ? '#64ffda' : '#3b82f6'} />,
          type: 'navigation' as const,
          onPress: () => console.log('Help Center'),
        },
        {
          id: 'logout',
          title: 'Sign Out',
          subtitle: 'Sign out of your account',
          icon: <LogOut size={20} color="#ef4444" />,
          type: 'action' as const,
          onPress: () => console.log('Sign Out'),
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem, index: number) => (
    <Animated.View
      key={item.id}
      entering={FadeInUp.delay(200 + index * 30).springify()}
    >
      <TouchableOpacity
        style={styles.settingItem}
        onPress={item.onPress}
        disabled={item.type === 'toggle'}
      >
        <View style={styles.settingLeft}>
          <View style={styles.settingIcon}>{item.icon}</View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>

        <View style={styles.settingRight}>
          {item.type === 'toggle' ? (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{
                false: isDark ? '#334155' : '#e2e8f0',
                true: isDark ? '#64ffda' : '#3b82f6',
              }}
              thumbColor={item.value ? '#ffffff' : '#f4f3f4'}
            />
          ) : (
            <ChevronRight size={20} color={isDark ? '#64748b' : '#9ca3af'} />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <Animated.View
          entering={FadeInUp.delay(100).springify()}
          style={styles.profileCard}
        >
          <View style={styles.profileAvatar}>
            <User size={32} color={isDark ? '#0a192f' : '#ffffff'} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profileEmail}>john.doe@financeflow.com</Text>
            <Text style={styles.profilePlan}>Professional Plan</Text>
          </View>
        </Animated.View>

        {/* Settings Sections */}
        {settingSections.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) =>
                renderSettingItem(item, sectionIndex * 10 + itemIndex)
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0a192f' : '#f8fafc',
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: isDark ? '#0a192f' : '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1e293b' : '#e2e8f0',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: isDark ? '#ffffff' : '#1f2937',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 20,
      marginTop: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#e2e8f0',
    },
    profileAvatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: isDark ? '#64ffda' : '#3b82f6',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 20,
      fontWeight: '700',
      color: isDark ? '#ffffff' : '#1f2937',
      marginBottom: 2,
    },
    profileEmail: {
      fontSize: 14,
      color: isDark ? '#94a3b8' : '#6b7280',
      marginBottom: 4,
    },
    profilePlan: {
      fontSize: 12,
      color: isDark ? '#64ffda' : '#3b82f6',
      fontWeight: '600',
    },
    section: {
      marginTop: 32,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: isDark ? '#ffffff' : '#1f2937',
      marginBottom: 12,
    },
    sectionContent: {
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#e2e8f0',
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#334155' : '#f1f5f9',
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? '#334155' : '#f1f5f9',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#1f2937',
      marginBottom: 2,
    },
    settingSubtitle: {
      fontSize: 14,
      color: isDark ? '#94a3b8' : '#6b7280',
    },
    settingRight: {
      marginLeft: 12,
    },
  });
