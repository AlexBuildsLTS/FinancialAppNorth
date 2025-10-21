import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert } from 'react-native';
import { useAuth } from '@/shared/context/AuthContext';
import { useTheme } from '@/shared/context/ThemeProvider';
import * as ImagePicker from 'expo-image-picker';
import { uploadAvatar } from '@/shared/services/profileService';
import { Avatar } from '@/shared/components/Avatar';
import { router } from 'expo-router';
import { supabase } from '@/shared/lib/supabase';

export default function EditProfileScreen() {
    const { theme } = useTheme();
    const { colors } = theme;
    const { profile, updateProfile } = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (profile) {
            setDisplayName(profile.display_name || '');
            setAvatarUrl(profile.avatar_url || null);
        }
    }, [profile]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && profile) {
            setIsSubmitting(true);
            const asset = result.assets[0];
            const { filePath, error } = await uploadAvatar(profile.id, asset);

            if (error) {
                Alert.alert('Upload Error', error.message);
            } else if (filePath) {
                const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
                await updateProfile({ avatar_url: data.publicUrl });
                setAvatarUrl(data.publicUrl);
            }
            setIsSubmitting(false);
        }
    };

    const handleUpdateProfile = async () => {
        setIsSubmitting(true);
        let error;
        try {
            const response = await updateProfile({
                display_name: displayName,
            });
            error = response
        } catch (err) {
            error = err;
        }
        setIsSubmitting(false);

        if (error) {
            const errorMessage = (error instanceof Error) ? error.message : 'An error occurred while updating your profile.';
            Alert.alert('Update Error', errorMessage);
        } else {
            Alert.alert('Success', 'Profile updated successfully.');
            router.back();
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.avatarContainer}>
                <Avatar avatarUrl={avatarUrl} size={120} userId={profile?.id || ''} />
                <Pressable onPress={pickImage} disabled={isSubmitting}>
                    <Text style={[styles.changeText, { color: colors.primary }]}>Change Photo</Text>
                </Pressable>
            </View>

            <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Display Name</Text>
                <TextInput
                    value={displayName}
                    onChangeText={setDisplayName}
                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                />
            </View>

            <Pressable
                style={[styles.button, { backgroundColor: isSubmitting ? colors.textSecondary : colors.primary }]}
                onPress={handleUpdateProfile}
                disabled={isSubmitting}
            >
                <Text style={styles.buttonText}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, alignItems: 'center' },
    avatarContainer: { alignItems: 'center', marginBottom: 32 },
    changeText: { marginTop: 12, fontSize: 16, fontWeight: 'bold' },
    inputContainer: { width: '100%', marginBottom: 24 },
    label: { marginBottom: 8, fontSize: 14 },
    input: { height: 50, borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, fontSize: 16 },
    button: { width: '100%', height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
