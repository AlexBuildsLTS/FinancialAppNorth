import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { useAuth } from '@/shared/context/AuthContext'; // Import useAuth
import { addTransaction } from '@/shared/services/transactionService';
import { Transaction } from '@/shared/types';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import Modal from '@/shared/components/Modal'; // Using the polished base modal

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (newTransaction: Transaction) => void;
  clientId: string | null; // Can be null for personal transactions
}

export default function AddTransactionModal({
  visible,
  onClose,
  onSuccess,
  clientId,
}: AddTransactionModalProps) { 
  const { theme: { colors } } = useTheme();
  const { session } = useAuth(); // Use the useAuth hook
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !amount) { // Category is no longer required here as we can't handle it
      Alert.alert('Error', 'Please fill out title and amount.');
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid positive amount.');
      return;
    }

    setLoading(true);
    try {
      if (!session?.user) {
        Alert.alert('Error', 'User not authenticated.');
        setLoading(false);
        return;
      }

      // TODO: This modal needs a way to select an account and a category.
      // account_id is a required foreign key.
      // category_id is optional, but the UI has a text input for category name.
      const newTransactionData = {
        description: title,
        amount: numericAmount,
        type,
        account_id: '', // FIXME: This needs to be a valid account ID.
        user_id: session.user.id,
        transaction_date: new Date().toISOString(),
      };

      const addedTransaction = await addTransaction(newTransactionData as any);
      
      Alert.alert('Success', 'Transaction added successfully.');
      onSuccess(addedTransaction); // Pass the new transaction to the callback
      onClose();
      // Clear form
      setTitle('');
      setAmount('');
      setCategory('');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to add transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Add New Transaction">
      <View style={styles.container}>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeButton, type === 'expense' && styles.activeTypeButton, { backgroundColor: type === 'expense' ? colors.accent : colors.surface }]}
            onPress={() => setType('expense')}
          >
            <Text style={[styles.typeButtonText, { color: type === 'expense' ? 'white' : colors.textPrimary }]}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, type === 'income' && styles.activeTypeButton, { backgroundColor: type === 'income' ? colors.success : colors.surface }]}
            onPress={() => setType('income')}
          >
            <Text style={[styles.typeButtonText, { color: type === 'income' ? 'white' : colors.textPrimary }]}>Income</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
          placeholder="Title (e.g., Groceries)"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
          placeholder="Amount"
          placeholderTextColor={colors.textSecondary}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
          placeholder="Category (e.g., Food)"
          placeholderTextColor={colors.textSecondary}
          value={category}
          onChangeText={setCategory}
        />

        <Button
          title="Add Transaction"
          onPress={handleSubmit}
          isLoading={loading}
          style={{ marginTop: 16 }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTypeButton: {
    // Active styles are now applied directly
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
});
