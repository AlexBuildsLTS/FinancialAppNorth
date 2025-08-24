import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useToast } from '@/context/ToastProvider';
import { updateUserPassword } from '@/services/userService';
import ScreenContainer from '@/components/ScreenContainer';
import Button from '@/components/common/Button';

export default function ChangePasswordScreen() {
    const { colors } = useTheme();
    const { showToast } = useToast();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdatePassword = async () => {
        if (!newPassword || newPassword.length < 8) {
            return Alert.alert('Error', 'Password must be at least 8 characters long.');
        }
        if (newPassword !== confirmPassword) {
            return Alert.alert('Error', 'Passwords do not match.');
        }

        setLoading(true);
        try {
            await updateUserPassword(newPassword);
            showToast('Password updated successfully!', 'success');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            showToast(error.message || 'Failed to update password.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenContainer>
            <View style={styles.container}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>New Password</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                />
                <Text style={[styles.label, { color: colors.textSecondary }]}>Confirm New Password</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />
                <Button title="Update Password" onPress={handleUpdatePassword} isLoading={loading} style={{ marginTop: 24 }} />
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: { padding: 24, flex: 1 },
    label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
    input: { height: 50, borderRadius: 12, paddingHorizontal: 16, fontSize: 16, borderWidth: 1, marginBottom: 16 },
});