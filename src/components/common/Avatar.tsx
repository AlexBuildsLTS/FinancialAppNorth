// src/components/common/Avatar.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/context/ThemeProvider';
import { Profile } from '@/types';

type AvatarProps = {
  profile: Profile | null;
  size?: number;
};

const getInitials = (name: string | null | undefined): string => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

export const Avatar = ({ profile, size = 48 }: AvatarProps) => {
  const { colors } = useTheme();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profile?.avatar_url) {
      setIsLoading(true);
      const downloadImage = async () => {
        try {
          const { data, error } = await supabase.storage
            .from('avatars')
            .download(profile.avatar_url!);
            
          if (error) throw error;

          const fr = new FileReader();
          fr.readAsDataURL(data);
          fr.onload = () => {
            setAvatarUrl(fr.result as string);
            setIsLoading(false);
          };
        } catch (error) {
          console.error('Error downloading avatar:', (error as Error).message);
          setAvatarUrl(null);
          setIsLoading(false);
        }
      };
      downloadImage();
    } else {
      setAvatarUrl(null);
    }
  }, [profile?.avatar_url]);

  if (isLoading) {
    return <View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surfaceVariant, justifyContent: 'center', alignItems: 'center' }]} ><ActivityIndicator size="small" /></View>;
  }

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        key={profile?.avatar_url} // Force re-render when the URL changes
      />
    );
  }

  return (
    <View style={[ styles.initialsContainer, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surfaceVariant } ]}>
      <Text style={[styles.initialsText, { color: colors.textSecondary, fontSize: size / 2.5 }]}>
        {getInitials(profile?.display_name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontWeight: 'bold',
  },
});