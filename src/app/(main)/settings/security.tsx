import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { ArrowLeft, Lock, Save } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PasswordStrengthIndicator } from '../../../shared/components/PasswordStrengthIndicator';

export default function SecuritySettings() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: password });
      if (error) throw error;
      Alert.alert('Success', 'Password updated successfully');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <View className="px-6 py-4 border-b border-[#233554] flex-row items-center gap-4">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Security</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        <Text className="text-[#8892B0] mb-6">Update your password to keep your account secure.</Text>

        <View className="gap-4">
          <View>
            <Text className="text-[#8892B0] mb-2 text-sm font-bold uppercase">New Password</Text>
            <View className="bg-[#112240] border border-[#233554] rounded-xl px-4 h-14 flex-row items-center">
              <Lock size={20} color="#8892B0" />
              <TextInput 
                className="flex-1 text-white text-base ml-3 h-full" 
                placeholder="New Password" 
                placeholderTextColor="#475569"
                secureTextEntry
                value={password} 
                onChangeText={setPassword}
              />
            </View>
            <PasswordStrengthIndicator password={password} />
          </View>

          <View>
            <Text className="text-[#8892B0] mb-2 text-sm font-bold uppercase">Confirm Password</Text>
            <View className="bg-[#112240] border border-[#233554] rounded-xl px-4 h-14 flex-row items-center">
              <Lock size={20} color="#8892B0" />
              <TextInput 
                className="flex-1 text-white text-base ml-3 h-full" 
                placeholder="Confirm New Password" 
                placeholderTextColor="#475569"
                secureTextEntry
                value={confirmPassword} 
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleUpdatePassword}
            disabled={loading}
            className="bg-[#64FFDA] h-14 rounded-xl items-center justify-center mt-4 flex-row gap-2"
          >
            {loading ? <ActivityIndicator color="#0A192F" /> : (
              <>
                <Save size={20} color="#0A192F" />
                <Text className="text-[#0A192F] font-bold text-lg">Update Password</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}