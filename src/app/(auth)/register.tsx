import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeProvider';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { ChevronLeft, Check } from 'lucide-react-native'; // Added Check icon for checkbox
import { UserRole } from '../../context/AuthContext';

export default function RegisterScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('Member');
  const [agreedToTerms, setAgreedToTerms] = useState(false); // New state for terms agreement

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !displayName) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (!agreedToTerms) {
      Alert.alert('Error', 'You must agree to the terms and conditions.');
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, this would call an API to register the user
      // For now, we'll simulate registration and then sign in
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful registration and then sign in with the chosen role
      signIn(selectedRole); 
      Alert.alert('Success', 'Account created and logged in successfully!');
      router.replace('/'); // Navigate to the main app screen after registration
    } catch (error) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Account</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Display Name</Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          placeholder="Enter your display name"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          placeholder="Enter your email"
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          placeholder="Enter your password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Confirm Password</Text>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          placeholder="Confirm your password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Account Type</Text>
        <View style={styles.roleSelectionContainer}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              { backgroundColor: selectedRole === 'Member' ? colors.primary : colors.surface },
              { borderColor: colors.border }
            ]}
            onPress={() => setSelectedRole('Member')}
          >
            <Text style={[styles.roleButtonText, { color: selectedRole === 'Member' ? colors.primaryContrast : colors.text }]}>
              Personal User
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.roleButton,
              { backgroundColor: selectedRole === 'Professional Accountant' ? colors.primary : colors.surface },
              { borderColor: colors.border }
            ]}
            onPress={() => setSelectedRole('Professional Accountant')}
          >
            <Text style={[styles.roleButtonText, { color: selectedRole === 'Professional Accountant' ? colors.primaryContrast : colors.text }]}>
              Professional
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.termsContainer}>
          <TouchableOpacity onPress={() => setAgreedToTerms(!agreedToTerms)} style={styles.checkbox}>
            {agreedToTerms ? (
              <Check size={20} color={colors.primary} />
            ) : (
              <View style={[styles.checkboxEmpty, { borderColor: colors.textSecondary }]} />
            )}
          </TouchableOpacity>
          <Text style={[styles.termsText, { color: colors.textSecondary }]}>
            I agree to the <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Terms of Service</Text> and <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Privacy Policy</Text>.
          </Text>
        </View>

        <Button title="Create Account" onPress={handleRegister} isLoading={isLoading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backButton: { padding: 4 },
  headerTitle: { fontFamily: 'Inter-Bold', fontSize: 20, fontWeight: 'bold' },
  container: { padding: 16, paddingTop: 0 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8, marginLeft: 4 },
  input: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, marginBottom: 24, fontSize: 16 },
  roleSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    gap: 16,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  roleButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxEmpty: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
  },
});
