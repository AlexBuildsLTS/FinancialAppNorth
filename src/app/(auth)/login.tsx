import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { CheckCircle2, Circle } from 'lucide-react-native';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';
import { useToast } from '@/context/ToastProvider';
import Button from '@/components/common/Button';
import ScreenContainer from '@/components/ScreenContainer';

// Secure storage keys
const REMEMBER_ME_KEY = 'remember_me';
const EMAIL_KEY = 'stored_email';
const PASSWORD_KEY = 'stored_password';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);

  const router = useRouter();
  const { signInWithEmail } = useAuth();
  const { colors } = useTheme();
  const { showToast } = useToast();

  // Check for stored credentials on component mount
  useEffect(() => {
    checkStoredCredentials();
  }, []);

  const checkStoredCredentials = async () => {
    try {
      const storedRememberMe = await SecureStore.getItemAsync(REMEMBER_ME_KEY);
      
      if (storedRememberMe === 'true') {
        const storedEmail = await SecureStore.getItemAsync(EMAIL_KEY);
        const storedPassword = await SecureStore.getItemAsync(PASSWORD_KEY);
        
        if (storedEmail && storedPassword) {
          setEmail(storedEmail);
          setPassword(storedPassword);
          setRememberMe(true);
        }
      }
    } catch (error) {
      console.error('Error checking stored credentials', error);
    } finally {
      setInitialCheckComplete(true);
    }
  };

  const storeCredentials = async () => {
    try {
      await SecureStore.setItemAsync(REMEMBER_ME_KEY, rememberMe.toString());
      
      if (rememberMe) {
        await SecureStore.setItemAsync(EMAIL_KEY, email);
        await SecureStore.setItemAsync(PASSWORD_KEY, password);
      } else {
        // Clear stored credentials if remember me is turned off
        await SecureStore.deleteItemAsync(EMAIL_KEY);
        await SecureStore.deleteItemAsync(PASSWORD_KEY);
      }
    } catch (error) {
      console.error('Error storing credentials', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Please enter both email and password.');
    }

    setLoading(true);
    try {
      const { error } = await signInWithEmail(email, password);
      
      if (error) {
        showToast(error.message, 'error');
      } else {
        // Store credentials based on remember me setting
        await storeCredentials();
        
        // Navigate to main app
        router.replace('/(tabs)');
      }
    } catch (error) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Don't render until initial check is complete
  if (!initialCheckComplete) {
    return null; // Or a loading spinner
  }

  return (
    <ScreenContainer style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
        placeholder="Email"
        placeholderTextColor={colors.textSecondary}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
        placeholder="Password"
        placeholderTextColor={colors.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity 
        style={styles.checkboxContainer} 
        onPress={() => setRememberMe(!rememberMe)}
      >
        {rememberMe ? (
          <CheckCircle2 color={colors.primary} size={24} />
        ) : (
          <Circle color={colors.textSecondary} size={24} />
        )}
        <Text style={[styles.checkboxLabel, { color: colors.text }]}>
          Remember me
        </Text>
      </TouchableOpacity>
      <Button 
        title="Login" 
        onPress={handleLogin} 
        isLoading={loading} 
        style={{marginTop: 10}}
      />
      <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
        <Text style={[styles.link, { color: colors.primary }]}>
          Don't have an account? Sign Up
        </Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 32, textAlign: 'center' },
  input: { height: 50, borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, fontSize: 16, borderWidth: 1 },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 16,
  },
  link: { marginTop: 24, textAlign: 'center', fontSize: 16, fontWeight: '500' },
});