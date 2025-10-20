import React, { useState, useEffect } from 'react';
import { StyleSheet, Modal, Alert, View, Text, TextInput, Button } from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { Profile, UserRole, UserRoleDisplayNames } from '@/shared/types';
import { adminService } from '@/features/admin/services/adminService';
import DropDownPicker from 'react-native-dropdown-picker';

interface EditUserModalProps {
    visible: boolean;
    onClose: () => void;
    user: Profile | null;
    onUserUpdated: (updatedUser: Profile) => void;
}

export default function EditUserModal({ visible, onClose, user, onUserUpdated }: EditUserModalProps) {
    const { theme } = useTheme();
    const { colors } = theme;
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<UserRole | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Dropdown picker state
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<UserRole | null>(null);
    const [items, setItems] = useState(
        Object.entries(UserRoleDisplayNames).map(([key, value]) => ({
            label: value as string,
            value: key as UserRole,
        }))
    );

    useEffect(() => {
        if (user) {
            setDisplayName(user.display_name || '');
            setEmail(user.email || '');
            setRole(user.role);
            setValue(user.role);
        }
    }, [user]);

    const handleSave = async () => {
        if (!user || !role) return;

        setIsLoading(true);
        const newRole = value ?? user.role;
        const { error } = await adminService.updateUser(user.id, {
            display_name: displayName,
            role: newRole,
        });
        setIsLoading(false);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert('Success', 'User profile updated successfully.');
            const updatedProfile: Profile = {
                ...user,
                display_name: displayName,
                role: newRole,
            };
            onUserUpdated(updatedProfile);
            onClose();
        }
    };

    if (!user) {
        return null;
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centered}>
                <View style={[styles.container, { backgroundColor: colors.surface, borderRadius: 10, width: '90%' }]}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: colors.text }}>Edit User</Text>

                    <TextInput
                        style={{ width: '100%', height: 40, borderColor: colors.border, borderWidth: 1, marginBottom: 20, paddingHorizontal: 10, color: colors.text, borderRadius: 5 }}
                        onChangeText={setDisplayName}
                        value={displayName}
                        placeholder="Display Name"
                        placeholderTextColor={colors.text}
                    />

                    <TextInput
                        style={{ width: '100%', height: 40, borderColor: colors.border, borderWidth: 1, marginBottom: 20, paddingHorizontal: 10, color: colors.text, backgroundColor: colors.background, borderRadius: 5 }}
                        value={email}
                        editable={false}
                    />

                    <DropDownPicker
                        open={open}
                        value={value}
                        items={items}
                        setOpen={setOpen}
                        setValue={setValue}
                        setItems={setItems}
                        theme="DARK"
                        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
                        textStyle={{ color: colors.text }}
                        dropDownContainerStyle={{
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                        }}
                        placeholder="Select a role"
                        zIndex={3000}
                        zIndexInverse={1000}
                    />

                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: '100%', marginTop: 20, zIndex: -1 }}>
                        <View style={{ marginRight: 10 }}>
                            <Button title="Cancel" onPress={onClose} color={colors.secondary} />
                        </View>
                        <Button title={isLoading ? 'Saving...' : 'Save'} onPress={handleSave} disabled={isLoading} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    container: { alignItems: 'center', padding: 24, },
});
