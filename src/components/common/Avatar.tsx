import React, { useMemo, useState } from 'react';
import { Image, View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { User } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';

interface AvatarProps {
  url?: string | null;
  name?: string | null;
  id?: string | null;
  size?: number;
}

const palette = [
  '#F87171', // red-400
  '#FBBF24', // amber-400
  '#34D399', // emerald-400
  '#60A5FA', // blue-400
  '#A78BFA', // violet-400
  '#F472B6', // pink-400
  '#F59E0B', // orange-400
  '#10B981', // green-500
];

function hashStringToIndex(s: string | undefined | null, mod: number) {
  if (!s) return 0;
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) % mod;
}

export const Avatar: React.FC<AvatarProps> = ({ url, name, id, size = 40 }) => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const initials = useMemo(() => {
    const source = (name || id || '').trim();
    if (!source) return '';
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [name, id]);

  const bgColor = useMemo(() => palette[hashStringToIndex(name || id || url || 'default', palette.length)], [name, id, url]);

  // If there's a URL and it hasn't errored, show the image
  if (url && !hasError) {
    return (
      <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surface }]}>
        <Image
          source={{ uri: url }}
          style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
        {isLoading && (
          <View style={styles.loader}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}
      </View>
    );
  }

  // Fallback: initials with deterministic background color
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }]}>
      {initials ? (
        <Text style={[styles.initials, { color: '#ffffff', fontSize: Math.max(12, size * 0.36) }]}>{initials}</Text>
      ) : (
        <User size={size * 0.6} color={colors.textSecondary} />
      )}
    </View>
  );
};

export default Avatar;

const styles = StyleSheet.create({
  container: {
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
  initials: {
    fontWeight: '700',
  },
});
