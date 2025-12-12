import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  Alert, 
  SafeAreaView, 
  ScrollView, 
  ActivityIndicator, 
  Platform 
} from 'react-native';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../lib/supabase'; // Used for storage
import { UserService } from '../../../services/userService'; // Used for profile data
import * as ImagePicker from 'expo-image-picker';
import { Camera, Save, ArrowLeft, User, Mail, UploadCloud } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { decode } from 'base64-arraybuffer';

export default function ProfileScreen() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  
  // Local State for Form
  const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.name?.split(' ').slice(1).join(' ') || '');
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // --- Image Picker Logic ---
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true, // Needed for Supabase Storage upload
      });

      if (!result.canceled && result.assets[0].base64) {
        // Pass URI too so we can detect file extension correctly
        await uploadAvatar(result.assets[0].base64, result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from library.');
    }
  };

  // --- Avatar Upload Logic ---
  const uploadAvatar = async (base64: string, uri: string) => {
    if (!user) return;
    setUploading(true);
    
    try {
      // 1. Smart Extension Detection
      // Determines if it's png/jpg based on URI to set correct Content-Type
      const isDataUrl = uri.startsWith('data:');
      let fileExt = 'jpg'; 
      if (!isDataUrl) {
          const parts = uri.split('.');
          if (parts.length > 1) fileExt = parts.pop()?.toLowerCase() || 'jpg';
      }
      
      // Clean query params if present
      fileExt = fileExt.split('?')[0];
      const mimeType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // 2. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, decode(base64), {
          contentType: mimeType,
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 3. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // 4. Update Profile Record
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({ 
            id: user.id, 
            avatar_url: publicUrl,
            updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      // 5. Refresh Context to update UI immediately
      await refreshProfile();
      Alert.alert('Success', 'Profile photo updated!');

    } catch (error: any) {
      console.error("Avatar Upload Error:", error);
      Alert.alert('Upload Failed', error.message || "Could not upload image.");
    } finally {
      setUploading(false);
    }
  };

  // --- Save Profile Logic ---
  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await UserService.updateProfile(
        user.id,
        firstName,
        lastName,
        { first_name: firstName, last_name: lastName }
      );
      
      await refreshProfile(); // Sync global state
      Alert.alert('Saved', 'Profile details updated successfully.');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      {/* Header */}
      <View className="px-4 py-4 flex-row items-center border-b border-white/5 bg-[#0A192F]">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 -ml-2 rounded-full active:bg-white/10">
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Edit Profile</Text>
      </View>

      <ScrollView className="p-6">
        
        {/* Avatar Section */}
        <View className="items-center mb-8">
          <View className="relative">
            <View className="w-28 h-28 rounded-full bg-[#112240] overflow-hidden border-4 border-[#64FFDA] shadow-2xl items-center justify-center">
              {uploading ? (
                 <ActivityIndicator size="large" color="#64FFDA" />
              ) : user?.avatar ? (
                <Image source={{ uri: user.avatar }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <User size={48} color="#8892B0" />
              )}
            </View>
            
            <TouchableOpacity 
              onPress={pickImage}
              disabled={uploading}
              className="absolute bottom-0 right-0 bg-[#64FFDA] p-2.5 rounded-full shadow-lg border-2 border-[#0A192F]"
            >
              <Camera size={18} color="#0A192F" />
            </TouchableOpacity>
          </View>
          <Text className="text-[#8892B0] mt-3 text-sm font-medium">Tap icon to change photo</Text>
        </View>

        {/* Form Fields */}
        <View className="gap-5">
          <View>
            <Text className="text-[#8892B0] mb-2 font-bold text-xs uppercase ml-1">First Name</Text>
            <View className="flex-row items-center bg-[#112240] px-4 py-3.5 rounded-xl border border-white/10">
              <User size={18} color="#64FFDA" />
              <TextInput 
                className="flex-1 ml-3 text-white text-base font-medium"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
                placeholderTextColor="#475569"
              />
            </View>
          </View>

          <View>
            <Text className="text-[#8892B0] mb-2 font-bold text-xs uppercase ml-1">Last Name</Text>
            <View className="flex-row items-center bg-[#112240] px-4 py-3.5 rounded-xl border border-white/10">
              <User size={18} color="#64FFDA" />
              <TextInput 
                className="flex-1 ml-3 text-white text-base font-medium"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
                placeholderTextColor="#475569"
              />
            </View>
          </View>

          <View>
            <Text className="text-[#8892B0] mb-2 font-bold text-xs uppercase ml-1">Email (Read Only)</Text>
            <View className="flex-row items-center bg-[#0D1F3A] px-4 py-3.5 rounded-xl border border-white/5 opacity-80">
              <Mail size={18} color="#8892B0" />
              <Text className="flex-1 ml-3 text-gray-400 text-base">{user?.email}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View className="p-6 bg-[#0A192F] border-t border-white/5">
        <TouchableOpacity 
            onPress={handleSave}
            disabled={loading}
            className={`w-full py-4 rounded-xl flex-row justify-center items-center shadow-lg 
                ${loading ? 'bg-[#64FFDA]/50' : 'bg-[#64FFDA]'}`}
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
    </SafeAreaView>
  );
}