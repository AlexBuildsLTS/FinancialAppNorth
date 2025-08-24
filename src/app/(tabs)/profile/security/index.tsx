import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { Lock, ChevronRight } from 'lucide-react-native';

const SecurityScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();

  const menuItems = [
    {
      icon: Lock,
      label: 'Change Password',
      onPress: () => router.push('/profile/security/change-password'),
    },
    // Future security options like 2FA can be added here
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={item.onPress}
          >
            <item.icon color={colors.textSecondary} size={22} />
            <Text style={[styles.menuLabel, { color: colors.text }]}>
              {item.label}
            </Text>
            <ChevronRight color={colors.textSecondary} size={22} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
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
});

export default SecurityScreen;
