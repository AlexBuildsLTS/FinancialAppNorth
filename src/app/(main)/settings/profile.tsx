import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera, Save } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { decode } from 'base64-arraybuffer';

export default function ProfileSettings() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        uploadAvatar(result.assets[0].base64);
      }
    } catch (e) {
      Alert.alert("Error picking image", String(e));
    }
  };

  const uploadAvatar = async (base64: string) => {
    if (!user) return;
    setLoading(true);
    try {
      // Path: user_id/timestamp.jpg
      const fileName = `${user.id}/${Date.now()}.jpg`;
      
      // 1. Upload
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, decode(base64), { contentType: 'image/jpeg', upsert: true });

      if (uploadError) throw uploadError;

      // 2. Get URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      
      // 3. Update Profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(data.publicUrl);
      await refreshUser(); // Update global state
      Alert.alert('Success', 'Avatar updated!');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Upload Failed', error.message || "Could not upload image");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Basic logic to split name if user inputs full name
      const parts = name.trim().split(' ');
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ') || '';

      const { error } = await supabase
        .from('profiles')
        .update({ first_name: firstName, last_name: lastName })
        .eq('id', user.id);

      if (error) throw error;
      
      await refreshUser();
      Alert.alert('Saved', 'Profile updated successfully.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]" edges={['top']}>
      <View className="px-6 py-4 border-b border-[#233554] flex-row items-center gap-4">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Edit Profile</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        {/* Avatar Section */}
        <View className="items-center mb-8">
          <TouchableOpacity onPress={pickImage} className="relative">
            <View className="w-28 h-28 rounded-full bg-[#112240] border-2 border-[#64FFDA] overflow-hidden items-center justify-center">
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} className="w-full h-full" />
              ) : (
                <Text className="text-[#64FFDA] text-4xl font-bold">{name?.[0]}</Text>
              )}
            </View>
            <View className="absolute bottom-0 right-0 bg-[#64FFDA] p-2 rounded-full">
              <Camera size={16} color="#0A192F" />
            </View>
          </TouchableOpacity>
          <Text className="text-[#8892B0] mt-4 text-sm">Tap to change avatar</Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          <View>
            <Text className="text-[#8892B0] mb-2 text-sm font-bold uppercase">Full Name</Text>
            <TextInput
              className="bg-[#112240] text-white p-4 rounded-xl border border-[#233554]"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View>
            <Text className="text-[#8892B0] mb-2 text-sm font-bold uppercase">Email (Read Only)</Text>
            <TextInput
              className="bg-[#112240]/50 text-[#8892B0] p-4 rounded-xl border border-[#233554]"
              value={user?.email}
              editable={false}
            />
          </View>

          <TouchableOpacity 
            onPress={handleSave}
            disabled={loading}
            className="bg-[#64FFDA] h-14 rounded-xl items-center justify-center mt-4 flex-row gap-2"
          >
            {loading ? <ActivityIndicator color="#0A192F" /> : (
              <>
                <Save size={20} color="#0A192F" />
                <Text className="text-[#0A192F] font-bold text-lg">Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}