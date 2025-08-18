import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import ScreenContainer from '@/components/ScreenContainer';
import Button from '@/components/common/Button';
import { ChevronLeft } from 'lucide-react-native';

export default function SecurityScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    setIsLoading(true);
    try {
      // In a real app, you would call an API to change the password.
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Your password has been changed.');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to change password. Please check your current password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Security</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Current Password</Text>
        <TextInput
          value={currentPassword}
          onChangeText={setCurrentPassword}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          placeholder="Enter your current password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
        />
        <Text style={[styles.label, { color: colors.textSecondary }]}>New Password</Text>
        <TextInput
          value={newPassword}
          onChangeText={setNewPassword}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          placeholder="Enter your new password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
        />
        <Text style={[styles.label, { color: colors.textSecondary }]}>Confirm New Password</Text>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          placeholder="Confirm your new password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
        />
        <Button title="Change Password" onPress={handlePasswordChange} isLoading={isLoading} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backButton: { padding: 4 },
  headerTitle: { fontFamily: 'Inter-Bold', fontSize: 20, fontWeight: 'bold' },
  container: { padding: 16, paddingTop: 0 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8, marginLeft: 4 },
  input: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, marginBottom: 24, fontSize: 16 },
});