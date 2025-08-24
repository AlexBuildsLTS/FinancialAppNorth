import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useToast } from '@/context/ToastProvider';
import { requestClientAccess } from '@/services/cpaService';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

interface AddClientModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddClientModal({ visible, onClose, onSuccess }: AddClientModalProps) {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendRequest = async () => {
    if (!email.includes('@')) {
        return Alert.alert('Invalid Email', 'Please enter a valid client email address.');
    }
    setLoading(true);
    try {
        await requestClientAccess(email);
        showToast('Access request sent!', 'success');
        onSuccess();
        onClose();
        setEmail('');
    } catch (error: any) {
        showToast(error.message || 'Failed to send request.', 'error');
    } finally {
        setLoading(false);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Request Client Access">
      <View>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Client Email Address</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="Enter the client's email"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Button title="Send Request" onPress={handleSendRequest} isLoading={loading} style={{ marginTop: 16 }} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  input: { height: 50, borderRadius: 12, paddingHorizontal: 16, fontSize: 16, borderWidth: 1, marginBottom: 16 },
});