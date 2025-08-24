import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { createTransaction } from '@/services/realTransactionService';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import { Transaction } from '@/types';

export interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (newTransaction: Transaction) => void;
  clientId: string;
}

const AddTransactionModal = ({
  visible,
  onClose,
  onSuccess,
  clientId,
}: AddTransactionModalProps) => {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [accountId, setAccountId] = useState('1'); // Default account ID
  const [tags, setTags] = useState('');
  const [location, setLocation] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSaveTransaction = async () => {
    if (!title || !amount || !category) {
      Alert.alert(
        'Missing Information',
        'Please fill out all required fields.'
      );
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      Alert.alert(
        'Invalid Amount',
        'Please enter a valid number for the amount.'
      );
      return;
    }

    setLoading(true);
    try {
      const transactionData: Omit<Transaction, "id"> = {
        accountId,
        title,
        description,
        category,
        amount: numericAmount,
        date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        time: new Date().toISOString().split('T')[1].split('.')[0], // Format as HH:mm:ss
        type,
        status: 'completed',
        clientId: clientId,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [], // Convert comma-separated string to array
        location,
      };

      // createTransaction expects Omit<Transaction, "id">, so we pass the relevant fields
      const newTransaction = await createTransaction(transactionData);

      onSuccess(newTransaction); // Signal to the dashboard that a new transaction was added
      onClose(); // Close the modal
      // Reset form for next time
      setTitle('');
      setAmount('');
      setDescription('');
      setAccountId('1');
      setTags('');
      setLocation('');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save the transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Add New Transaction
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
            placeholder="Title (e.g., Coffee)"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
            placeholder="Description"
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
            placeholder="Amount"
            placeholderTextColor={colors.textSecondary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
            placeholder="Account ID"
            placeholderTextColor={colors.textSecondary}
            value={accountId}
            onChangeText={setAccountId}
          />

          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
            placeholder="Tags (comma-separated)"
            placeholderTextColor={colors.textSecondary}
            value={tags}
            onChangeText={setTags}
          />

          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
            placeholder="Location"
            placeholderTextColor={colors.textSecondary}
            value={location}
            onChangeText={setLocation}
          />

          <TouchableOpacity
            style={[styles.input, styles.datePickerButton]}
            onPress={() => setDatePickerVisibility(true)}
          >
            <Text style={{ color: colors.text }}>{date.toDateString()}</Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={(selectedDate) => {
              setDate(selectedDate);
              setDatePickerVisibility(false);
            }}
            onCancel={() => setDatePickerVisibility(false)}
          />

          <View
            style={[
              styles.pickerContainer,
              {
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
          >
            <Picker
              selectedValue={type}
              onValueChange={(itemValue) => setType(itemValue)}
              style={{ color: colors.text }}
            >
              <Picker.Item label="Expense" value="expense" />
              <Picker.Item label="Income" value="income" />
            </Picker>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSaveTransaction}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Transaction</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={loading}
          >
            <Text style={{ color: colors.textSecondary }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    justifyContent: 'center',
  },
  datePickerButton: { justifyContent: 'center' },
  pickerContainer: { borderWidth: 1, borderRadius: 8, marginBottom: 16 },
  saveButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter-Bold' },
  cancelButton: { marginTop: 16, alignItems: 'center' },
});

export default AddTransactionModal;
