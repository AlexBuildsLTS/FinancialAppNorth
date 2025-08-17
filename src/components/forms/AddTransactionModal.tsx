import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { createTransaction } from '@/services/dataService';
import { Transaction } from '@/types';
import Button from '@/components/common/Button';
import DateTimePickerModal from "@react-native-community/datetimepicker";

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (newTransaction: Transaction) => void;
  clientId: string;
}

export default function AddTransactionModal({ visible, onClose, onSuccess, clientId }: AddTransactionModalProps) {
  const { colors } = useTheme();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!title || !amount || !category) {
      Alert.alert('Missing Fields', 'Please fill in Title, Amount, and Category.');
      return;
    }
    setIsSubmitting(true);
    const newTransactionData = {
      clientId, title, category,
      amount: type === 'expense' ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount)),
      date: date.toISOString(),
      type, status: 'completed',
    };
    try {
      const result = await createTransaction(newTransactionData as Omit<Transaction, 'id'>);
      onSuccess(result);
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to save transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => { setType('expense'); setAmount(''); setTitle(''); setCategory(''); setDate(new Date()); };

  const handleConfirmDate = (selectedDate: Date) => {
    setDate(selectedDate);
    setDatePickerVisibility(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Add Transaction</Text>
          
          <View style={[styles.typeSelector, { backgroundColor: colors.background }]}>
            <TouchableOpacity style={[styles.typeButton, type === 'expense' && { backgroundColor: colors.primary }]} onPress={() => setType('expense')}>
              <Text style={[styles.typeButtonText, { color: colors.text }, type === 'expense' && { color: colors.primaryContrast }]}>Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.typeButton, type === 'income' && { backgroundColor: colors.primary }]} onPress={() => setType('income')}>
              <Text style={[styles.typeButtonText, { color: colors.text }, type === 'income' && { color: colors.primaryContrast }]}>Income</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput placeholder="Title (e.g., Office Supplies)" value={title} onChangeText={setTitle} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} placeholderTextColor={colors.textSecondary}/>
          <TextInput placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} placeholderTextColor={colors.textSecondary}/>
          <TextInput placeholder="Category (e.g., Business Expense)" value={category} onChangeText={setCategory} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} placeholderTextColor={colors.textSecondary}/>
          
          <TouchableOpacity onPress={() => setDatePickerVisibility(true)} style={[styles.input, { justifyContent: 'center' }]}>
             <Text style={{color: colors.text}}>{date.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {isDatePickerVisible && (
            <DateTimePickerModal
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                const currentDate = selectedDate || date;
                setDatePickerVisibility(false);
                setDate(currentDate);
              }}
            />
          )}

          <View style={styles.buttonContainer}>
            <Button title="Cancel" variant="outline" onPress={onClose} style={{ flex: 1 }} />
            <Button title="Save" onPress={handleSave} style={{ flex: 1 }} isLoading={isSubmitting} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  typeSelector: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 16 },
  typeButton: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  typeButtonText: { fontWeight: '600' },
  input: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, fontSize: 16 },
  buttonContainer: { flexDirection: 'row', gap: 16, marginTop: 16 },
});