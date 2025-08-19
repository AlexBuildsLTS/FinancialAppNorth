import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, Alert, ActivityIndicator, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { createTransaction } from '@/services/dataService';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from '@react-native-picker/picker';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddTransactionModal = ({ visible, onClose, onSuccess }: AddTransactionModalProps) => {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [date, setDate] = useState(new Date());
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSaveTransaction = async () => {
    if (!title || !amount || !category) {
      Alert.alert('Missing Information', 'Please fill out all required fields.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      Alert.alert('Invalid Amount', 'Please enter a valid number for the amount.');
      return;
    }

    setLoading(true);
    try {
      await createTransaction({
        title,
        amount: numericAmount,
        category,
        date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        type,
        status: 'completed',
        clientId: ''
      });
      
      onSuccess(); // Signal to the dashboard that a new transaction was added
      onClose();   // Close the modal
      // Reset form for next time
      setTitle('');
      setAmount('');

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
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Transaction</Text>
          
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholder="Title (e.g., Coffee)"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
          
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholder="Amount"
            placeholderTextColor={colors.textSecondary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          <TouchableOpacity style={[styles.input, styles.datePickerButton]} onPress={() => setDatePickerVisibility(true)}>
            <Text style={{ color: colors.text }}>{date.toDateString()}</Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={(selectedDate) => { setDate(selectedDate); setDatePickerVisibility(false); }}
            onCancel={() => setDatePickerVisibility(false)}
          />
          
          <View style={[styles.pickerContainer, {borderColor: colors.border, backgroundColor: colors.background}]}>
            <Picker
                selectedValue={type}
                onValueChange={(itemValue) => setType(itemValue)}
                style={{ color: colors.text }}
            >
                <Picker.Item label="Expense" value="expense" />
                <Picker.Item label="Income" value="income" />
            </Picker>
          </View>

          <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSaveTransaction} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Transaction</Text>}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={loading}>
            <Text style={{ color: colors.textSecondary }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    modalTitle: { fontSize: 22, fontFamily: 'Inter-Bold', marginBottom: 20, textAlign: 'center' },
    input: { height: 50, borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, fontSize: 16, marginBottom: 16, justifyContent: 'center' },
    datePickerButton: { justifyContent: 'center' },
    pickerContainer: { borderWidth: 1, borderRadius: 8, marginBottom: 16 },
    saveButton: { height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
    saveButtonText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter-Bold' },
    cancelButton: { marginTop: 16, alignItems: 'center' }
});

export default AddTransactionModal;