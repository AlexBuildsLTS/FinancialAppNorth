
import React, { useState, useEffect } from 'react';
import { StyleSheet, Modal, Alert } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { Profile, UserRole, UserRoleDisplayNames } from '@/types';
import { adminService } from '@/services/adminService';
import { Check, X } from 'lucide-react-native';
import DropDownPicker from 'react-native-dropdown-picker';

interface EditUserModalProps {
    visible: boolean;
    onClose: () => void;
    user: Profile | null;
    onUserUpdated: () => void;
}

export default function EditUserModal({ visible, onClose, user, onUserUpdated }: EditUserModalProps) {
    const { colors } = useTheme();
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<UserRole | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Dropdown picker state
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState(
        Object.entries(UserRoleDisplayNames).map(([key, value]) => ({
            label: value,
            value: key as UserRole,
        }))
    );

    useEffect(() => {
        if (user) {
            setDisplayName(user.display_name || '');
            setEmail(user.email || '');
            setRole(user.role);
        }
    }, [user]);

    const handleSave = async () => {
        if (!user || !role) return;

        setIsLoading(true);
        const { error } = await adminService.updateUser(user.id, {
            display_name: displayName,
            role: value || undefined,
        });
        setIsLoading(false);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert('Success', 'User profile updated successfully.');
            onUserUpdated();
            onClose();
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >

        </Modal>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, padding: 24, alignItems: 'center' },
});