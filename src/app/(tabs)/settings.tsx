import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import ScreenContainer from '@/components/ScreenContainer';
import Button from '@/components/common/Button';
import { User, Bell, Shield, LogOut, ChevronRight, Moon, Sun, Key } from 'lucide-react-native';

const SettingItem = ({ icon: Icon, label, onPress, colors, isDestructive = false }: any) => (
  <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
    <View style={styles.itemLeft}>
      <Icon color={isDestructive ? colors.error : colors.primary} size={22} />
      <Text style={[styles.itemLabel, { color: isDestructive ? colors.error : colors.text }]}>{label}</Text>
    </View>
    <ChevronRight color={colors.textSecondary} size={20} />
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const { colors, isDark, setTheme } = useTheme();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <ScreenContainer>
      <Stack.Screen options={{ headerShown: false }}/>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account</Text>
        <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
          <SettingItem icon={User} label="Profile" onPress={() => router.push('/profile')} colors={colors} />
          <SettingItem icon={Bell} label="Notifications" onPress={() => {}} colors={colors} />
          <SettingItem icon={Shield} label="Security" onPress={() => router.push('/security' as any)} colors={colors} />
          <SettingItem icon={Key} label="API Key Management" onPress={() => router.push('/profile/api-keys' as any)} colors={colors} />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
        <View style={[styles.sectionContainer, styles.toggleContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.itemLeft}>
                {isDark ? <Moon color={colors.primary} size={22} /> : <Sun color={colors.primary} size={22} />}
                <Text style={[styles.itemLabel, { color: colors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={() => setTheme(isDark ? 'light' : 'dark')}
              trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
              thumbColor={colors.surface}
            />
        </View>
        
        <View style={{ marginTop: 24 }}>
          <Button title="Log Out" onPress={handleLogout} variant="outline" icon={LogOut}/>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 16 },
    headerTitle: { fontFamily: 'Inter-Bold', fontSize: 28, marginBottom: 24, fontWeight: 'bold' },
    sectionTitle: { fontFamily: 'Inter-Bold', fontSize: 14, marginBottom: 8, marginLeft: 8, textTransform: 'uppercase' },
    sectionContainer: { borderRadius: 16, marginBottom: 24, overflow: 'hidden' },
    itemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(128, 128, 128, 0.1)' },
    toggleContainer: { paddingVertical: 8, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    itemLabel: { fontFamily: 'Inter-Bold', fontSize: 16, fontWeight: '500' },
});
