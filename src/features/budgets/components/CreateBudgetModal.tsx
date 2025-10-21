import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { useAuth } from '@/shared/context/AuthContext';
import { useToast } from '@/shared/context/ToastProvider';
import { createBudget } from '@/features/budgets/services/budgetService';
import Modal from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';

interface CreateBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateBudgetModal({ visible, onClose, onSuccess }: CreateBudgetModalProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const { session } = useAuth();
  const { showToast } = useToast();
  const [category, setCategory] = useState('');
  const [allocated, setAllocated] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateBudget = async () => {
    if (!session?.user) return;
    const allocatedAmount = parseFloat(allocated);
    if (!category || isNaN(allocatedAmount) || allocatedAmount <= 0) {
      return Alert.alert('Invalid Input', 'Please enter a valid category and a positive amount.');
    }

    setLoading(true);
    try {
      await createBudget({
        user_id: session.user.id,
        category,
        allocated: allocatedAmount,
        period: 'monthly', // Defaulting to monthly for now
      });
      showToast('Budget created successfully!', 'success');
      onSuccess();
      onClose();
      // Reset form
      setCategory('');
      setAllocated('');
    } catch (error) {
      showToast('Failed to create budget.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Create New Budget">
      <View>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="e.g., Groceries, Transportation"
          placeholderTextColor={colors.textSecondary}
          value={category}
          onChangeText={setCategory}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Monthly Amount ($)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="e.g., 500"
          placeholderTextColor={colors.textSecondary}
          value={allocated}
          onChangeText={setAllocated}
          keyboardType="numeric"
        />

        <Button title="Create Budget" onPress={handleCreateBudget} isLoading={loading} style={{ marginTop: 16 }} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8, },
  input: { height: 50, borderRadius: 12, paddingHorizontal: 16, fontSize: 16, borderWidth: 1, marginBottom: 16 },
});
