import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Bell } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeProvider';

interface DashboardHeaderProps {
  username: string;
  avatarUrl: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ username, avatarUrl }) => {
  const { colors } = useTheme();

  return (
    <Animated.View entering={FadeInDown.duration(500)} style={styles.container}>
      <View style={styles.userInfo}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            Welcome back,
          </Text>
          <Text style={[styles.username, { color: colors.text }]}>{username}</Text>
        </View>
      </View>
      <View style={[styles.notificationIcon, { backgroundColor: colors.surface }]}>
        <Bell color={colors.text} size={24} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  greeting: {
    fontSize: 14,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  notificationIcon: {
    padding: 12,
    borderRadius: 25,
  },
});

export default DashboardHeader;