import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setAvatarUrl(user.avatarUrl || null);
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', user.id);
      if (error) throw error;
      Alert.alert('Success', 'Your profile has been updated.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64 && user) {
      setLoading(true);
      const asset = result.assets[0];
      const fileExt = asset.uri?.split('.').pop()?.toLowerCase() ?? 'jpg';
      const filePath = `${user.id}/${new Date().getTime()}.${fileExt}`;
      const contentType = `image/${fileExt}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, decode(asset.base64!), { contentType });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(filePath);

        setAvatarUrl(publicUrl);

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id);

        if (updateError) throw updateError;
      } catch (error: any) {
        Alert.alert('Upload Error', error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity onPress={handlePickAvatar}>
        <Image
          source={{ uri: avatarUrl || 'https://i.pravatar.cc/150' }}
          style={styles.avatar}
        />
        <Text style={[styles.changeText, { color: colors.primary }]}>
          Change Photo
        </Text>
      </TouchableOpacity>

      <Text style={[styles.label, { color: colors.text }]}>Display Name</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: colors.border,
          },
        ]}
        value={displayName}
        onChangeText={setDisplayName}
      />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handleUpdateProfile}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center' },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 8 },
  changeText: {
    fontFamily: 'Inter-Bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  label: {
    width: '100%',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter-Bold' },
});
