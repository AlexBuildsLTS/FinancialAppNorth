import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Clipboard } from 'react-native';
import { useTheme } from '../../../context/ThemeProvider';
import { useAuth } from '../../../context/AuthContext';
import ScreenContainer from '../../../components/ScreenContainer';
import { ChevronLeft, Edit, Copy, Shield, Key, Crown } from 'lucide-react-native'; // Added Crown icon for upgrade
import { useRouter } from 'expo-router';
import Button from '../../../components/common/Button';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, updateUser } = useAuth(); // Assuming updateUser and a more detailed user object
  const router = useRouter();

  const copyUserId = () => {
    if (user?.uniqueUserId) {
      Clipboard.setString(user.uniqueUserId);
      Alert.alert('Copied', 'User ID copied to clipboard');
    }
  };

  const handleChangeImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // Launch image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const newAvatarUri = result.assets[0].uri;
      // In a real app, you would upload this URI to your backend (e.g., Supabase Storage)
      // and then update the user context with the new URL.
      updateUser({ avatarUrl: newAvatarUri }); // Update user context with new avatar URI
      Alert.alert("Avatar Updated", "Your profile picture has been updated!");
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <View style={{width: 40}} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileHeader}>
            <View>
                <Image
                    source={{ uri: user?.avatarUrl }} // Rely on generated avatar or user-selected
                    style={[styles.avatar, { borderColor: colors.surface }]}
                />
                <TouchableOpacity onPress={handleChangeImage} style={[styles.editIcon, {backgroundColor: colors.primary}]}>
                    <Edit size={16} color={colors.primaryContrast} />
                </TouchableOpacity>
            </View>
            <View style={styles.nameContainer}>
              <Text style={[styles.name, { color: colors.text }]}>{user?.displayName || 'User Profile'}</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/profile/edit')}>
                <Edit size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
            <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Unique User ID</Text>
                <TouchableOpacity onPress={copyUserId} style={styles.copyButton}>
                    <Text style={[styles.infoValue, { color: colors.text }]}>{user?.uniqueUserId}</Text>
                    <Copy size={16} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>
            <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Account Type</Text>
                <Text style={[styles.infoValue, { color: colors.text, textTransform: 'capitalize' }]}>{user?.role}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Role</Text>
                <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user?.role) }]}>
                    <Text style={[styles.roleText, { color: colors.surface }]}>{user?.role}</Text>
                </View>
            </View>
            <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Subscription</Text>
                <Text style={[styles.infoValue, { color: colors.primary }]}>{user?.role === 'Premium Member' ? 'Pro Plan' : 'Basic Plan'}</Text>
            </View>
             <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Member Since</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>Aug 2025</Text>
            </View>
        </View>

        <View style={styles.actionButtons}>
            <Button 
                title="Change Password" 
                onPress={() => router.push('/(tabs)/security/change-password')} 
                icon={Key}
                variant="outline"
                style={{ flex: 1 }}
            />
            <Button 
                title="2FA Settings" // Changed text to 2FA Settings
                onPress={() => router.push('/(tabs)/settings')} // Navigates to security index for 2FA
                icon={Shield}
                style={{ flex: 1 }}
            />
        </View>
        
        {user?.role === 'Member' && (
          <Button 
            title="Upgrade to Premium" 
            onPress={() => Alert.alert("Upgrade", "Navigate to upgrade flow (mock)")} 
            icon={Crown}
            style={{ marginTop: 16 }}
          />
        )}
        <Button title="Manage Subscription" onPress={() => {}} style={{ marginTop: 16 }}/>
      </ScrollView>
    </ScreenContainer>
  );
}

const getRoleColor = (role?: string) => {
  switch (role) {
    case 'Administrator': return '#E74C3C';
    case 'Professional Accountant': return '#3498DB';
    case 'Moderator': return '#9B59B6';
    case 'Support': return '#F39C12';
    case 'Customer': return '#2ECC71';
    default: return '#95A5A6';
  }
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backButton: { padding: 4 },
  headerTitle: { fontFamily: 'Inter-Bold', fontSize: 20, fontWeight: 'bold' },
  container: { padding: 16, paddingTop: 0 },
  profileHeader: { alignItems: 'center', marginBottom: 32 },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4 },
  nameContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  editIcon: { position: 'absolute', bottom: 5, right: 5, padding: 8, borderRadius: 16 },
  name: { fontFamily: 'Inter-Bold', fontSize: 24, fontWeight: 'bold' },
  email: { fontFamily: 'Inter-Regular', fontSize: 16, marginTop: 4 },
  infoCard: { borderRadius: 16, paddingHorizontal: 16, marginBottom: 24 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(128,128,128,0.1)' },
  infoLabel: { fontFamily: 'Inter-Regular', fontSize: 16 },
  infoValue: { fontFamily: 'Inter-Bold', fontSize: 16, fontWeight: '600' },
  copyButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  roleText: { fontFamily: 'Inter-Bold', fontSize: 14, fontWeight: '600' },
  actionButtons: { flexDirection: 'row', gap: 16, marginTop: 24 },
});
