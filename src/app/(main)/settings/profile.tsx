import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Save, ArrowLeft, Mail, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user } = useAuth(); 
  const router = useRouter();
  
  const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.name?.split(' ')[1] || '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

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
        uploadAvatar(result.assets[0].base64, result.assets[0].uri.split('.').pop() || 'jpg');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadAvatar = async (base64: string, fileExt: string) => {
    if (!user) return;
    setUploading(true);
    
    try {
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to Supabase Storage
      // We use the arrayBuffer method via base64 decode for compatibility
      const arrayBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update Profile Table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      Alert.alert('Success', 'Avatar updated! Please restart the app to see changes.');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Upload Failed', error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      Alert.alert('Saved', 'Profile updated successfully.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <View className="px-4 py-4 flex-row items-center border-b border-white/5">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Edit Profile</Text>
      </View>

      <ScrollView className="p-6">
        <View className="items-center mb-8">
          <View className="relative">
            <View className="w-24 h-24 rounded-full bg-[#112240] overflow-hidden border-2 border-[#64FFDA]">
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} className="w-full h-full" />
              ) : (
                <View className="items-center justify-center h-full"><User size={40} color="#8892B0" /></View>
              )}
            </View>
            <TouchableOpacity 
              onPress={pickImage}
              disabled={uploading}
              className="absolute bottom-0 right-0 bg-[#64FFDA] p-2 rounded-full shadow-lg"
            >
              {uploading ? <ActivityIndicator size="small" color="#0A192F" /> : <Camera size={16} color="#0A192F" />}
            </TouchableOpacity>
          </View>
          <Text className="text-[#8892B0] mt-3 text-sm">Tap camera to change photo</Text>
        </View>

        <View className="gap-5">
          <View>
            <Text className="text-[#8892B0] mb-2 font-medium">First Name</Text>
            <View className="flex-row items-center bg-[#112240] px-4 py-3 rounded-xl border border-white/10">
              <User size={18} color="#8892B0" />
              <TextInput 
                className="flex-1 ml-3 text-white text-base"
                value={firstName}
                onChangeText={setFirstName}
                placeholderTextColor="#475569"
              />
            </View>
          </View>

          <View>
            <Text className="text-[#8892B0] mb-2 font-medium">Last Name</Text>
            <View className="flex-row items-center bg-[#112240] px-4 py-3 rounded-xl border border-white/10">
              <User size={18} color="#8892B0" />
              <TextInput 
                className="flex-1 ml-3 text-white text-base"
                value={lastName}
                onChangeText={setLastName}
                placeholderTextColor="#475569"
              />
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleSave}
            disabled={loading}
            className="mt-4 bg-[#64FFDA] py-4 rounded-xl flex-row justify-center items-center shadow-lg"
          >
            {loading ? (
              <ActivityIndicator color="#0A192F" />
            ) : (
              <>
                <Save size={20} color="#0A192F" className="mr-2" />
                <Text className="text-[#0A192F] font-bold text-lg">Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}