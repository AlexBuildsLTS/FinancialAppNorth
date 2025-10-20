import React, { useState } from 'react';
import { Image, View, StyleSheet, ActivityIndicator } from 'react-native';
import { User } from 'lucide-react-native';
import { useTheme } from '@/shared/context/ThemeProvider';

interface AvatarProps {
  url: string | null | undefined;
  size?: number;
}

export const Avatar: React.FC<{ url?: string | null; size?: number }> = ({ url, size = 40 }) => {
  const { theme: { colors } } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // If there's no URL or an error occurred, show the default icon.
  if (!url || hasError) {
    return (
      <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surface }]}>
        <User size={size * 0.6} color={colors.textSecondary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surface }]}>
      <Image
        source={{ uri: url }}
        style={[{ width: size, height: size, borderRadius: size / 2 }]}
        resizeMode="cover"
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
      {isLoading && (
        <View style={styles.loader}>
 <ActivityIndicator color={colors.accent} />
        </View>
      )}
    </View>
  );
};

// export default as well so older/default imports won't break
export default Avatar;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    resizeMode: 'cover',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
