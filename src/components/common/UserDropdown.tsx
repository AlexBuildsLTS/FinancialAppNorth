import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Settings, LogOut, ChevronDown, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';

export default function UserDropdown() {
  const { colors } = useTheme();
  const { profile, signOut } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  const handleProfile = () => {
    setIsOpen(false);
    router.push('/(tabs)/profile');
  };

  const handleSettings = () => {
    setIsOpen(false);
    router.push('/(tabs)/settings');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={() => setIsOpen(true)} 
        style={[styles.trigger, { backgroundColor: colors.surface }]}
      >
        <User color={colors.textSecondary} size={20} />
        <ChevronDown color={colors.textSecondary} size={16} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable 
          style={styles.overlay} 
          onPress={() => setIsOpen(false)}
        >
          <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {profile?.display_name || 'User'}
              </Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                {profile?.email}
              </Text>
            </View>
            
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={handleProfile}
            >
              <User color={colors.textSecondary} size={18} />
              <Text style={[styles.menuText, { color: colors.text }]}>Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={handleSettings}
            >
              <Settings color={colors.textSecondary} size={18} />
              <Text style={[styles.menuText, { color: colors.text }]}>Settings</Text>
            </TouchableOpacity>
            
            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {profile?.role === 'Administrator' && (
              <>
                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={() => {
                    setIsOpen(false);
                    router.push('/admin');
                  }}
                >
                  <ShieldCheck color={colors.textSecondary} size={18} />
                  <Text style={[styles.menuText, { color: colors.text }]}>Admin Panel</Text>
                </TouchableOpacity>
                <View style={[styles.separator, { backgroundColor: colors.border }]} />
              </>
            )}
            
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={handleSignOut}
            >
              <LogOut color={colors.error} size={18} />
              <Text style={[styles.menuText, { color: colors.error }]}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 16,
  },
  dropdown: {
    minWidth: 200,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  userInfo: {
    padding: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
  },
  separator: {
    height: 1,
    marginHorizontal: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
