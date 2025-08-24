import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Image } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';
import { useToast } from '@/context/ToastProvider';
import { updateProfile } from '../../../services/userService';
import ScreenContainer from '@/components/ScreenContainer';
import Button from '@/components/common/Button';

export default function EditProfileScreen() {
    const { colors } = useTheme();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
    const [loading, setLoading] = useState(false);

    const handleUpdateProfile = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await updateProfile(user.id, { display_name: displayName, avatar_url: avatarUrl });
            showToast('Profile updated successfully!', 'success');
        } catch (error) {
            showToast('Failed to update profile.', 'error');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <ScreenContainer>
            <View style={styles.container}>
                <Image source={{ uri: avatarUrl || `https://i.pravatar.cc/150?u=${user?.id}` }} style={styles.avatar} />
                <Text style={[styles.label, { color: colors.textSecondary }]}>Display Name</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    value={displayName}
                    onChangeText={setDisplayName}
                />
                <Text style={[styles.label, { color: colors.textSecondary }]}>Avatar URL</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    value={avatarUrl}
                    onChangeText={setAvatarUrl}
                />
                <Button title="Save Changes" onPress={handleUpdateProfile} isLoading={loading} style={{ marginTop: 24 }} />
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: { padding: 24, flex: 1 },
    avatar: { width: 120, height: 120, borderRadius: 60, alignSelf: 'center', marginBottom: 32 },
    label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
    input: { height: 50, borderRadius: 12, paddingHorizontal: 16, fontSize: 16, borderWidth: 1, marginBottom: 16 },
});