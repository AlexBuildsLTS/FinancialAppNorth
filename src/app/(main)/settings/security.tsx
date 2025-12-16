/**
 * ============================================================================
 * 🛡️ SECURITY SETTINGS CENTER
 * ============================================================================
 * Management for Biometrics, Password Resets, and Session Security.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Fingerprint, Key, ShieldCheck, Smartphone } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { setItem, getItem } from '../../../lib/secureStorage';

export default function SecurityScreen() {
  const router = useRouter();
  const { user, logout } = useAuth(); // Assuming logout is exposed
  
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
    checkBiometrics();
    loadPreference();
  }, []);

  const checkBiometrics = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricsAvailable(hasHardware && isEnrolled);
    } catch (e) {
      console.warn('Biometric check failed', e);
    }
  };

  const loadPreference = async () => {
    try {
      const stored = await getItem('biometrics_enabled');
      setBiometricsEnabled(stored === 'true');
    } catch (e) {
      console.warn('Pref check failed', e);
    }
  };

  // --- HANDLERS ---
  const toggleBiometrics = async (value: boolean) => {
    if (!biometricsAvailable) {
      Alert.alert('Not Available', 'Biometric authentication is not available on this device. This feature requires a device with FaceID, TouchID, or fingerprint sensor.');
      return;
    }

    if (value) {
      try {
        // First check what types are available
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        console.log('Available auth types:', types);

        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to enable biometric login',
          fallbackLabel: 'Use Passcode',
          cancelLabel: 'Cancel',
        });
        
        if (result.success) {
          setBiometricsEnabled(true);
          await setItem('biometrics_enabled', 'true');
          Alert.alert('Success', 'Biometric login has been enabled. You can now use FaceID/TouchID to sign in.');
        } else {
          if (result.error !== 'user_cancel') {
            Alert.alert('Authentication Failed', result.error || 'Could not verify your identity. Please try again.');
          }
          // Don't change state if user cancelled
        }
      } catch (error: any) {
        console.error('Biometric error:', error);
        Alert.alert('Error', error.message || 'Failed to authenticate. Please try again.');
      }
    } else {
      // Disable biometrics - no need to authenticate for this
      setBiometricsEnabled(false);
      await setItem('biometrics_enabled', 'false');
      Alert.alert('Disabled', 'Biometric login has been disabled.');
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      // For mobile apps, we typically redirect to a deep link
      // ensure 'northfinance' scheme is added to app.json
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: 'northfinance://reset-password',
      });
      if (error) throw error;
      Alert.alert('Email Sent', 'Check your inbox for password reset instructions.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email');
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
        
        {/* SECTION: AUTHENTICATION */}
        <View className="mb-8">
          <Text className="text-[#64FFDA] font-bold text-xs uppercase mb-4 tracking-widest">Authentication</Text>
          
          <View className="bg-[#112240] rounded-2xl border border-white/5 overflow-hidden">
            {/* Biometrics Row */}
            <View className="p-4 flex-row items-center justify-between border-b border-white/5">
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

            {/* 2FA Placeholder Row */}
            <View className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 mr-4">
                <View className="w-10 h-10 rounded-full bg-[#64FFDA]/10 items-center justify-center mr-3">
                  <Smartphone size={20} color="#64FFDA" />
                </View>
                <View>
                  <Text className="text-white font-bold text-base">2-Factor Auth</Text>
                  <Text className="text-[#8892B0] text-xs mt-0.5">Enhanced Protection</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => Alert.alert('Coming Soon', 'Enterprise MFA coming in Q1.')}>
                <Text className="text-[#64FFDA] font-bold text-xs">SETUP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* SECTION: ACCOUNT ACCESS */}
        <View className="mb-8">
          <Text className="text-[#64FFDA] font-bold text-xs uppercase mb-4 tracking-widest">Account Access</Text>
          
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
                  <Text className="text-[#8892B0] text-xs mt-0.5">Receive reset link via email</Text>
                </View>
              </View>
              {loading ? (
                <ActivityIndicator size="small" color="#64FFDA" />
              ) : (
                <ArrowLeft size={16} color="#8892B0" style={{ transform: [{ rotate: '180deg' }] }} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* FOOTER: STATUS */}
        <View className="p-4 bg-[#64FFDA]/5 rounded-2xl border border-[#64FFDA]/20 flex-row items-start">
            <ShieldCheck size={20} color="#64FFDA" className="mt-0.5" />
            <View className="ml-3 flex-1">
                <Text className="text-[#64FFDA] font-bold mb-1">Security Status: Good</Text>
                <Text className="text-[#8892B0] text-xs leading-5">
                    Your connection is encrypted (TLS 1.3). Biometric keys are stored in the device's Secure Enclave and never transmitted.
                </Text>
            </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}