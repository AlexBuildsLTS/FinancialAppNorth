import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';
import { useToast } from '@/context/ToastProvider';
import { getProfile, updateProfile, uploadAvatar } from '@/services/profileService';
import { Profile } from '@/types';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';
import ScreenContainer from '@/components/ScreenContainer';
import Button from '@/components/common/Button';

export default function EditProfileScreen() {
    const { user, session } = useAuth();
    const { colors } = useTheme();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [displayName, setDisplayName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

    useEffect(() => {
        if (user) {
            setLoading(true);
            getProfile(user.id)
                .then((data) => {
                    if (data) {
                        setProfile(data);
                        setDisplayName(data.display_name || '');
                        setAvatarUrl(data.avatar_url || null);
                    }
                })
                .catch((err) => showToast('Failed to load profile.', 'error'))
                .finally(() => setLoading(false));
        }
    }, [user]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0]);
            setAvatarUrl(result.assets[0].uri);
        }
    };

    const handleUpdateProfile = async () => {
        if (!session?.user || !profile) return;

        setLoading(true);
        try {
            let finalAvatarUrl = profile.avatar_url;

            if (selectedImage) {
                const response = await fetch(selectedImage.uri);
                const blob = await response.blob();
                const fileName = selectedImage.uri.split('/').pop() || `avatar-${Date.now()}`;
                finalAvatarUrl = await uploadAvatar(session.user.id, blob, fileName);
            }

            const updates = {
                display_name: displayName,
                avatar_url: finalAvatarUrl,
                updated_at: new Date().toISOString(),
            };

            await updateProfile(session.user.id, updates);
            showToast('Profile updated successfully!', 'success');
        } catch (error: any) {
            showToast(error.message || 'Failed to update profile.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenContainer>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.avatarContainer}>
                    <Image
                        source={avatarUrl ? { uri: avatarUrl } : require('@/assets/images/icon.png')}
                        style={styles.avatar}
                    />
                    <TouchableOpacity style={[styles.cameraButton, { backgroundColor: colors.primary }]} onPress={pickImage}>
                        <Camera color={colors.primaryContrast} size={24} />
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Display Name</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                        value={displayName}
                        onChangeText={setDisplayName}
                        placeholder="Enter your display name"
                        placeholderTextColor={colors.textSecondary}
                    />
                    
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.textSecondary, borderColor: colors.border }]}
                        value={user?.email}
                        editable={false}
                    />

                    <Button
                        title="Save Changes"
                        onPress={handleUpdateProfile}
                        isLoading={loading}
                        disabled={loading}
                        style={{ marginTop: 20 }}
                    />
                </View>
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 32,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#BB4711FF',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    form: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        fontSize: 16,
        borderWidth: 1,
    },
});