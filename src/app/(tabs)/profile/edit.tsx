import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import ScreenContainer from '@/components/ScreenContainer';
import Button from '@/components/common/Button';
import { ChevronLeft } from 'lucide-react-native';

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user, updateUser } = useAuth(); // Assuming updateUser exists in your AuthContext
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Validation Error', 'Display name cannot be empty.');
      return;
    }
    setIsLoading(true);
    try {
      // In a real app, you would call your update user service here
      // await updateUser({ ...user, displayName });
      Alert.alert('Success', 'Your profile has been updated.');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile.');
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.container}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Display Name</Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          placeholder="Enter your display name"
          placeholderTextColor={colors.textSecondary}
        />
        <Button title="Save Changes" onPress={handleSave} isLoading={isLoading} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backButton: { padding: 4 },
  headerTitle: { fontFamily: 'Inter-Bold', fontSize: 20, fontWeight: 'bold' },
  container: { padding: 16 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8, marginLeft: 4 },
  input: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, marginBottom: 24, fontSize: 16 },
});