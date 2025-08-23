// src/app/(auth)/register.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext'; // Corrected import path
import { Link, router } from 'expo-router';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password);
      // On success, the AuthContext already shows an alert.
      // You can optionally redirect the user here.
      router.replace('/(auth)/login');
    } catch (error) {
      // The error is already shown in an Alert by the AuthContext
      // You can add more specific logic here if needed
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={loading ? 'Creating Account...' : 'Sign Up'}
        onPress={handleSignUp}
        disabled={loading}
      />
      <Link href="/(auth)/login" style={styles.link}>
        Already have an account? Sign In
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  link: {
    marginTop: 15,
    textAlign: 'center',
    color: 'blue',
  },
});