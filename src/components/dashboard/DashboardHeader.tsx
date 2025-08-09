import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { Bell, MessageSquare } from 'lucide-react-native';

export default function DashboardHeader() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {/* Screen Title on the Left */}
      <Text style={styles.title}>Dashboard</Text>

      {/* Action Icons and Profile on the Right */}
      <View style={styles.rightContainer}>
        <TouchableOpacity style={styles.iconButton}>
          <MessageSquare size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Bell size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image 
            source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }} 
            style={styles.avatar} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: { background?: string; surface: any; surfaceVariant?: string; text: any; textSecondary?: string; border: any; primary: any; success?: string; warning?: string; error?: string; tabBarActive?: string; tabBarInactive?: string; }) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: colors.text,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.primary,
  },
});