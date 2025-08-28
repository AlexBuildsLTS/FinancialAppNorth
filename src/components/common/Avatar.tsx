// src/components/common/Avatar.tsx

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';

// --- Helper Functions ---
/**
 * Generates initials from a display name.
 * e.g., "Alex Test" -> "AT"
 */
const getInitials = (name: string = ''): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

/**
 * Generates a consistent, vibrant color from a string (e.g., user ID).
 * This ensures a user's avatar color is always the same.
 */
const aA = 'a'.charCodeAt(0);
const zA = 'z'.charCodeAt(0);
const colorRange = zA-aA;
const COLORS = ['#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e', '#f1c40f', '#e67e22', '#e74c3c'];
const generateColor = (id: string = ''): string => {
    const nameCode = id.split('').reduce((acc, char) => acc + char.toLowerCase().charCodeAt(0)-aA ,0)
    return COLORS[nameCode % COLORS.length];
};


// --- Component Definition ---
interface AvatarProps {
  size?: number;
  profile?: {
    avatar_url: string | null;
    display_name: string;
    id: string;
  } | null;
}

const Avatar: React.FC<AvatarProps> = ({ size = 48, profile }) => {
  const { colors } = useTheme();

  const avatarUrl = profile?.avatar_url;
  const displayName = profile?.display_name || 'User';
  const userId = profile?.id || 'default-user-id';
  
  const initials = getInitials(displayName);
  const backgroundColor = generateColor(userId);

  const style = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (avatarUrl) {
    return <Image source={{ uri: avatarUrl }} style={[styles.avatar, style]} />;
  }

  return (
    <View style={[styles.initialsContainer, style, { backgroundColor }]}>
      <Text style={[styles.initialsText, { fontSize: size * 0.4, color: '#FFFFFF' }]}>
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    resizeMode: 'cover',
  },
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontWeight: 'bold',
  },
});

export default Avatar;