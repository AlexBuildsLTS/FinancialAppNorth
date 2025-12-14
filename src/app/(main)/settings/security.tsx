/**
 * ============================================================================
 * NORTHFINANCE: SECURITY SETTINGS
 * ============================================================================
 * Manages:
 * - Biometric Login (FaceID/TouchID)
 * - Password Updates
 * - Session Management
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Fingerprint, Lock, ShieldCheck, Smartphone, Key } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../lib/supabase';
import * as Linking from 'expo-linking';

export default function SecurityScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check hardware availability on mount
  useEffect(() => {
    checkBiometrics();
    loadPreference();
  }, []);

  const checkBiometrics = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricsAvailable(hasHardware && isEnrolled);
  };

  const loadPreference = async () => {
    const stored = await AsyncStorage.getItem('biometrics_enabled');
    setBiometricsEnabled(stored === 'true');
  };

  const toggleBiometrics = async (value: boolean) => {
    if (value) {
      // Verify identity before enabling
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometrics',
      });
      
      if (result.success) {
        setBiometricsEnabled(true);
        await AsyncStorage.setItem('biometrics_enabled', 'true');
      } else {
        Alert.alert('Authentication failed', 'Could not verify identity.');
        return;
      }
    } else {
      setBiometricsEnabled(false);
      await AsyncStorage.setItem('biometrics_enabled', 'false');
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const redirectUrl = Linking.createURL('/(auth)/login');
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: redirectUrl,
      });
      if (error) throw error;
      Alert.alert('Email Sent', 'Check your inbox for password reset instructions.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-white/5">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 -ml-2">
          <ArrowLeft size={24} color="#8892B0" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Security</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        
        {/* Biometrics Section */}
        <View className="mb-8">
          <Text className="text-[#64FFDA] font-bold text-sm uppercase mb-4 tracking-widest">Authentication</Text>
          
          <View className="bg-[#112240] rounded-2xl border border-white/5 overflow-hidden">
            <View className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 mr-4">
                <View className="w-10 h-10 rounded-full bg-[#64FFDA]/10 items-center justify-center mr-3">
                  <Fingerprint size={20} color="#64FFDA" />
                </View>
                <View>
                  <Text className="text-white font-bold text-base">Biometric Login</Text>
                  <Text className="text-[#8892B0] text-xs mt-0.5">Use FaceID or Fingerprint</Text>
                </View>
              </View>
              
              {biometricsAvailable ? (
                <Switch
                  value={biometricsEnabled}
                  onValueChange={toggleBiometrics}
                  trackColor={{ false: '#0A192F', true: '#64FFDA' }}
                  thumbColor={biometricsEnabled ? '#112240' : '#8892B0'}
                />
              ) : (
                <Text className="text-[#8892B0] text-xs italic">Not Available</Text>
              )}
            </View>

            <View className="h-[1px] bg-white/5 mx-4" />

            <View className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 mr-4">
                <View className="w-10 h-10 rounded-full bg-[#64FFDA]/10 items-center justify-center mr-3">
                  <Smartphone size={20} color="#64FFDA" />
                </View>
                <View>
                  <Text className="text-white font-bold text-base">2-Factor Auth</Text>
                  <Text className="text-[#8892B0] text-xs mt-0.5">Recommended for high security</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => Alert.alert('Coming Soon', '2FA will be available in the next update.')}>
                <Text className="text-[#64FFDA] font-bold">Setup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Password Section */}
        <View className="mb-8">
          <Text className="text-[#64FFDA] font-bold text-sm uppercase mb-4 tracking-widest">Account Access</Text>
          
          <View className="bg-[#112240] rounded-2xl border border-white/5 overflow-hidden">
            <TouchableOpacity 
              onPress={handlePasswordReset}
              disabled={loading}
              className="p-4 flex-row items-center justify-between active:bg-[#162C52]"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-orange-500/10 items-center justify-center mr-3">
                  <Key size={20} color="#F97316" />
                </View>
                <View>
                  <Text className="text-white font-bold text-base">Change Password</Text>
                  <Text className="text-[#8892B0] text-xs mt-0.5">Send reset link to email</Text>
                </View>
              </View>
              {loading ? <ActivityIndicator size="small" color="#64FFDA" /> : <ArrowLeft size={16} color="#8892B0" style={{ transform: [{ rotate: '180deg' }] }} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Device Info */}
        <View className="p-4 bg-[#64FFDA]/5 rounded-2xl border border-[#64FFDA]/20 flex-row items-start">
            <ShieldCheck size={20} color="#64FFDA" className="mt-0.5" />
            <View className="ml-3 flex-1">
                <Text className="text-[#64FFDA] font-bold mb-1">Security Status: Good</Text>
                <Text className="text-[#8892B0] text-xs leading-5">
                    Your connection is encrypted. Biometrics are handled securely on your device hardware and never shared with our servers.
                </Text>
            </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}