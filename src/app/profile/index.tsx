import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import ScreenContainer from '@/components/ScreenContainer';
import { ChevronLeft, Edit } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Button from '@/components/common/Button';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const handleChangeImage = () => {
    Alert.alert("Feature Coming Soon", "The ability to change your profile image is under development.");
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
                    source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }} 
                    style={[styles.avatar, { borderColor: colors.surface }]}
                />
                <TouchableOpacity onPress={handleChangeImage} style={[styles.editIcon, {backgroundColor: colors.primary}]}>
                    <Edit size={16} color={colors.primaryContrast} />
                </TouchableOpacity>
            </View>
            <Text style={[styles.name, { color: colors.text }]}>Alex Professional</Text>
            <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
            <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Account Type</Text>
                <Text style={[styles.infoValue, { color: colors.text, textTransform: 'capitalize' }]}>{user?.role}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Subscription</Text>
                <Text style={[styles.infoValue, { color: colors.primary }]}>Pro Plan</Text>
            </View>
             <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Member Since</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>Aug 2025</Text>
            </View>
        </View>

        <Button title="Manage Subscription" onPress={() => {}}/>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backButton: { padding: 4 },
  headerTitle: { fontFamily: 'Inter-Bold', fontSize: 20, fontWeight: 'bold' },
  container: { padding: 16, paddingTop: 0 },
  profileHeader: { alignItems: 'center', marginBottom: 32 },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4 },
  editIcon: { position: 'absolute', bottom: 5, right: 5, padding: 8, borderRadius: 16 },
  name: { fontFamily: 'Inter-Bold', fontSize: 24, fontWeight: 'bold', marginTop: 16 },
  email: { fontFamily: 'Inter-Regular', fontSize: 16, marginTop: 4 },
  infoCard: { borderRadius: 16, paddingHorizontal: 16, marginBottom: 24 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(128,128,128,0.1)' },
  infoLabel: { fontFamily: 'Inter-Regular', fontSize: 16 },
  infoValue: { fontFamily: 'Inter-Bold', fontSize: 16, fontWeight: '600' },
});