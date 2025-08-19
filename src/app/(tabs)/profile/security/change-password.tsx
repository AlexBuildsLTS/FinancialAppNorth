import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';

const ChangePasswordScreen = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.text }]}>Current Password</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="Enter your current password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
        />

        <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="Enter your new password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
        />

        <Text style={[styles.label, { color: colors.text }]}>Confirm New Password</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="Confirm your new password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
        />

        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]}>
          <Text style={styles.buttonText}>Update Password</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    marginTop: 32,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
});

export default ChangePasswordScreen;