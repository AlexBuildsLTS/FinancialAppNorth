import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';
import * as ImagePicker from 'expo-image-picker';
import { Avatar } from '@/components/common/Avatar';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

async function uploadAvatar(userId: string, asset: any): Promise<{ filePath?: string; error?: any }> {
    try {
        const uri = asset.uri;
        // fetch the file data
        const response = await fetch(uri);
        const blob = await response.blob();
        // determine a filename
        const fileName = asset.fileName || uri.split('/').pop() || `${Date.now()}.jpg`;
        const filePath = `${userId}/${fileName}`;
        // upload to Supabase storage (avatars bucket)
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, blob, { cacheControl: '3600', upsert: true });
        if (uploadError) return { error: uploadError };
        return { filePath };
    } catch (err) {
        return { error: err };
    }
}

export default function EditProfileScreen() {
    const { colors } = useTheme();
    const auth = useAuth();
    const { profile } = auth;
    const updateProfile = (auth as any).updateProfile;
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
            mediaTypes: 'images',
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
        if (!profile) return;
        const nextName = displayName.trim();
        setIsSubmitting(true);
        const { error } = await updateProfile({
            display_name: nextName,
        });
        setIsSubmitting(false);

        if (error) {
            Alert.alert('Update Error', error.message);
        } else {
            Alert.alert('Success', 'Profile updated successfully.');
            router.back();
        }
    };

    if (!profile) {
        return (
            <View style={[styles.container, { justifyContent: 'center', backgroundColor: colors.background }]}>
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.avatarContainer}>
                <Avatar url={avatarUrl} size={120} />
                <Pressable onPress={pickImage} disabled={isSubmitting}>
                    <Text style={[styles.changeText, { color: colors.primary }]}>Change Photo</Text>
                </Pressable>
            </View>

            <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Display Name</Text>
                <TextInput
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Enter a display name"
                    placeholderTextColor={colors.textSecondary}
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
