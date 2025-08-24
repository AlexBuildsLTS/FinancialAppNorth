import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { createClient } from '@/services/dataService';
import { Client } from '@/types';
import Button from '@/components/common/Button';

interface AddClientModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (newClient: Client) => void;
}

export default function AddClientModal({
  visible,
  onClose,
  onSuccess,
}: AddClientModalProps) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!name || !companyName || !email) {
      Alert.alert('Missing Fields', 'Please fill all fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await createClient({
        name,
        companyName,
        email,
        status: 'active',
        netWorth: 0,
        uncategorized: 0,
      });
      onSuccess(result);
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to save client.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setCompanyName('');
    setEmail('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Add New Client
          </Text>

          <TextInput
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
            placeholderTextColor={colors.textSecondary}
          />
          <TextInput
            placeholder="Company Name"
            value={companyName}
            onChangeText={setCompanyName}
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
            placeholderTextColor={colors.textSecondary}
          />
          <TextInput
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
            placeholderTextColor={colors.textSecondary}
          />

          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={onClose}
              style={{ flex: 1 }}
            />
            <Button
              title="Save Client"
              onPress={handleSave}
              style={{ flex: 1 }}
              isLoading={isSubmitting}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  buttonContainer: { flexDirection: 'row', gap: 16, marginTop: 16 },
});
