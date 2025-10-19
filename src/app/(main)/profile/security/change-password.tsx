import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { useToast } from '@/shared/context/ToastProvider';
import { supabase } from '@/shared/lib/supabase'; // FIX: This component uses a default export, so it should be imported as `import ScreenContainer from ...`
import { Button } from '@/shared/components/Button';
import ScreenContainer from '@/shared/components/ScreenContainer';
import PasswordStrengthIndicator from '@/shared/components/PasswordStrengthIndicator';
import { Eye, EyeOff } from 'lucide-react-native';

export default function ChangePasswordScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isBreached, setIsBreached] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<'empty' | 'weak' | 'medium' | 'strong' | 'very-strong'>('empty');

  const requirements = {
    length: newPassword.length >= 8,
    capital: /[A-Z]/.test(newPassword),
    number: /\d/.test(newPassword),
    symbol: /[^A-Za-z0-9]/.test(newPassword),
  };
  const allRequirementsMet = Object.values(requirements).every(Boolean);

  const handlePasswordStrengthChange = (strength: 'empty' | 'weak' | 'medium' | 'strong' | 'very-strong') => {
    setPasswordStrength(strength);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    if (!allRequirementsMet) {
      Alert.alert('Error', 'New password does not meet all requirements.');
      return;
    }
    if (isBreached) {
      Alert.alert('Security Risk', 'This password has been found in data breaches. Please choose a different one.');
      return;
    }

    setLoading(true);
    // Note: Supabase requires the user to be recently signed in to update their password.
    // If you get an error here, you might need to re-authenticate the user.
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };
  
  const getButtonState = () => {
    return !allRequirementsMet ||
      !newPassword ||
      newPassword !== confirmPassword ||
      isBreached === true ||
      passwordStrength === 'weak' ||
      !currentPassword;
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Change Password</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Current Password"
            placeholderTextColor={colors.textSecondary}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={!showCurrentPassword}
          />
          <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)} style={styles.eyeIcon}>
            {showCurrentPassword ? <EyeOff color={colors.textSecondary} size={20} /> : <Eye color={colors.textSecondary} size={20} />}
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="New Password"
            placeholderTextColor={colors.textSecondary}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
          />
          <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeIcon}>
            {showNewPassword ? <EyeOff color={colors.textSecondary} size={20} /> : <Eye color={colors.textSecondary} size={20} />}
          </TouchableOpacity>
        </View>
        <PasswordStrengthIndicator password={newPassword} onStrengthChanged={handlePasswordStrengthChange} />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Confirm New Password"
            placeholderTextColor={colors.textSecondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
           <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
            {showConfirmPassword ? <EyeOff color={colors.textSecondary} size={20} /> : <Eye color={colors.textSecondary} size={20} />}
          </TouchableOpacity>
        </View>
         <PasswordStrengthIndicator password={confirmPassword} />

        <Button
          title="Change Password"
          onPress={handleChangePassword}
          isLoading={loading}
          disabled={getButtonState()}
          style={{ marginTop: 20 }}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 4,
    zIndex: 1,
  },
});