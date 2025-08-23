import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'; // Added TouchableOpacity
import { Bell, User, Settings } from 'lucide-react-native'; // Added User and Settings icons
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeProvider';

interface DashboardHeaderProps {
  displayName: string;
  avatarUrl: string;
  onPressProfile: () => void;
  onPressSettings: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ displayName, avatarUrl, onPressProfile, onPressSettings }) => {
  const { colors } = useTheme();

  return (
    <Animated.View entering={FadeInDown.duration(500)} style={styles.container}>
      <View style={styles.userInfo}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            Welcome back,
          </Text>
          <Text style={[styles.displayName, { color: colors.text }]}>{displayName}</Text>
        </View>
      </View>
      <View style={styles.rightIcons}> {/* New container for right-aligned icons */}
        <TouchableOpacity onPress={() => { /* Handle notifications */ }} style={[styles.iconButton, { backgroundColor: colors.surface }]}>
          <Bell color={colors.text} size={24} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressSettings} style={[styles.iconButton, { backgroundColor: colors.surface }]}>
          <Settings color={colors.text} size={24} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressProfile} style={[styles.iconButton, { backgroundColor: colors.surface }]}>
          <User color={colors.text} size={24} />
        </TouchableOpacity>
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
  displayName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rightIcons: { // Styles for the new container
    flexDirection: 'row',
    gap: 8, // Space between icons
  },
  iconButton: { // Styles for individual icon buttons
    padding: 12,
    borderRadius: 25,
  },
});

export default DashboardHeader;
