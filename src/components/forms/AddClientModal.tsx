import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import Modal from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useTheme } from '@/context/ThemeProvider';
import { useToast } from '@/context/ToastProvider';
import { requestClientAccess } from '@/services/cpaService';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

interface AddClientModalProps {
  visible: boolean;
  onClose: () => void;
  onClientAdded: () => void;
}

export default function AddClientModal({ visible, onClose, onClientAdded }: AddClientModalProps) {
    const { colors } = useTheme();
    const { showToast } = useToast();
    const { profile } = useAuth();
    const [clientEmail, setClientEmail] = useState('');
    const [loading, setLoading] = useState(false);

    // Allowed roles to assign clients: Professional (CPA), Support, Administrator
    const canAssign = !!profile && [UserRole.CPA, UserRole.SUPPORT, UserRole.ADMIN].includes(profile.role as UserRole);

    useEffect(() => {
      if (visible && !canAssign) {
        // If modal is opened incorrectly, close and show message
        showToast('You do not have permission to assign clients.', 'error');
        onClose();
      }
    }, [visible, canAssign]);

    const handleAddClient = async () => {
        if (!clientEmail) {
            Alert.alert('Error', 'Please enter a client email address.');
            return;
        }
        if (!canAssign) {
            showToast('Not authorized to assign clients.', 'error');
            return;
        }

        setLoading(true);
        try {
            // call the real service which should send an invite/request to client
            await requestClientAccess(clientEmail);
            showToast('Client assignment request sent!', 'success');
            onClientAdded(); // Refresh the client list
            onClose(); // Close the modal
        } catch (error: any) {
            showToast(error?.message || 'Failed to add client.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} onClose={onClose} title="Assign New Client">
            <View>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Client's Email Address</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    placeholder="client@example.com"
                    placeholderTextColor={colors.textSecondary}
                    value={clientEmail}
                    onChangeText={setClientEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <Button
                    title="Assign Client"
                    onPress={handleAddClient}
                    isLoading={loading}
                    style={{ marginTop: 16 }}
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
    },
});

