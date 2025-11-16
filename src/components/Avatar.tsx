import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { AppTheme } from '@/constants/theme';
import { Image as ExpoImage } from 'expo-image';

// Predefined, accessible color palette for generated avatars
const avatarColors = [
  "#E11D48", // Rose
  "#BB4711", // Orange (Primary Light)
  "#F59E0B", // Amber
  "#1DB954", // Green (Primary Dark)
  "#3B82F6", // Blue
  "#6366F1", // Indigo
  "#8B5CF6", // Purple
];

/**
 * Generates a stable color index based on a string (e.g., user ID or name).
 */
const getColorIndex = (id: string) => {
  if (!id) return 0;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % avatarColors.length;
};

/**
 * Generates initials from a full name (e.g., "John Smith" -> "JS").
 */
const getInitials = (firstName?: string | null, lastName?: string | null) => {
  const first = (firstName || "").charAt(0).toUpperCase();
  const last = (lastName || "").charAt(0).toUpperCase();
  return first + last || "??";
};

interface AvatarProps {
  avatarUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  userId: string; // Used for stable color generation
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({
  avatarUrl,
  firstName,
  lastName,
  userId,
  size = 40,
}) => {
  const { theme } = useTheme();
  const initials = getInitials(firstName, lastName);
  
  // Use a stable color based on the user ID
  const colorIndex = getColorIndex(userId);
  const backgroundColor = avatarColors[colorIndex];

  return (
    <View
      style={[
        styles.avatarContainer,
        {
          height: size,
          width: size,
          borderRadius: size / 2,
          backgroundColor: theme.colors.surface, // Fallback color
        },
      ]}
    >
      {avatarUrl ? (
        <ExpoImage
          source={{ uri: avatarUrl }}
          style={{ width: size, height: size }}
          contentFit="cover"
        />
      ) : (
        <View
          style={[
            styles.initialsContainer,
            {
              backgroundColor,
            },
          ]}
        >
          <Text
            style={[
              styles.initialsText,
              {
                fontSize: size * 0.4, // Scale font size with avatar size
                color: theme.colors.primaryContrast,
              },
            ]}
          >
            {initials}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontWeight: 'bold', // Assuming subheader implies bold
  },
});