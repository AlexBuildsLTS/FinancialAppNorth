import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import Modal from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { Cards } from '@/shared/components/Cards';
import { useTheme } from '@/shared/context/ThemeProvider';
import { useToast } from '@/shared/context/ToastProvider';
import { requestClientAccess } from '@/shared/services/cpaService';

interface AddClientModalProps {
  visible: boolean;
  onClose: () => void;
  onClientAdded: () => void;
}

export default function AddClientModal({ visible, onClose, onClientAdded }: AddClientModalProps) {
    const { theme } = useTheme();
    const { colors } = theme;
    const { showToast } = useToast();
    const [clientEmail, setClientEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddClient = async () => {
        if (!clientEmail) {
            Alert.alert('Error', 'Please enter a client email address.');
            return;
        }
        setLoading(true);
        try {
            // This service function would send a request for client access to the specified email
            await requestClientAccess(clientEmail); // Use the imported service function
            showToast('Client successfully assigned!', 'success');
            onClientAdded(); // Refresh the client list
            onClose(); // Close the modal
        } catch (error: any) {
            showToast(error.message || 'Failed to add client.', 'error');
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

