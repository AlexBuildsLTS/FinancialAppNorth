import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';
import { useToast } from '@/context/ToastProvider';
import Button from '@/components/common/Button';
import ScreenContainer from '@/components/ScreenContainer';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signInWithEmail } = useAuth();
  const { colors } = useTheme();
  const { showToast } = useToast();

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please enter both email and password.');
    setLoading(true);
    const { error } = await signInWithEmail(email, password);
    setLoading(false);
    if (error) {
      showToast(error.message, 'error');
    } else {
      router.replace('/(tabs)');
    }
  };
  
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
      <Button title="Login" onPress={handleLogin} isLoading={loading} style={{marginTop: 10}}/>
      <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
        <Text style={[styles.link, { color: colors.primary }]}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 32, textAlign: 'center' },
  input: { height: 50, borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, fontSize: 16, borderWidth: 1 },
  link: { marginTop: 24, textAlign: 'center', fontSize: 16, fontWeight: '500' },
});
