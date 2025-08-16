import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { X, DollarSign, Calendar, Tag } from 'lucide-react-native';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { createTransaction } from '@/services/dataService';
import { Transaction } from '@/types';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onTransactionAdded: (transaction: Transaction) => void;
}

export default function AddTransactionModal({
  visible,
  onClose,
  onTransactionAdded,
}: AddTransactionModalProps) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    description: '',
    type: 'expense' as 'income' | 'expense',
  });

  const styles = createStyles(colors);

  const categories = [
    'Groceries',
    'Transportation',
    'Food & Dining',
    'Housing',
    'Entertainment',
    'Healthcare',
    'Shopping',
    'Utilities',
    'Salary',
    'Freelance',
    'Investment',
    'Other',
  ];

  const handleSubmit = async () => {
    if (!formData.title || !formData.amount || !formData.category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const amount = parseFloat(formData.amount);
      const finalAmount = formData.type === 'expense' ? -Math.abs(amount) : Math.abs(amount);

      const newTransaction = await createTransaction({
        accountId: '1',
        title: formData.title,
        description: formData.description,
        category: formData.category,
        amount: finalAmount,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        type: formData.type,
        status: 'completed',
      });

      onTransactionAdded(newTransaction);
      setFormData({
        title: '',
        amount: '',
        category: '',
        description: '',
        type: 'expense',
      });
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add Transaction</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={styles.formCard}>
            {/* Transaction Type */}
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  formData.type === 'expense' && styles.activeTypeButton,
                ]}
                onPress={() => setFormData({ ...formData, type: 'expense' })}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    formData.type === 'expense' && styles.activeTypeButtonText,
                  ]}
                >
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  formData.type === 'income' && styles.activeTypeButton,
                ]}
                onPress={() => setFormData({ ...formData, type: 'income' })}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    formData.type === 'income' && styles.activeTypeButtonText,
                  ]}
                >
                  Income
                </Text>
              </TouchableOpacity>
            </View>

            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter transaction title"
                placeholderTextColor={colors.textSecondary}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />
            </View>

            {/* Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount *</Text>
              <View style={styles.amountContainer}>
                <DollarSign size={20} color={colors.textSecondary} />
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.amount}
                  onChangeText={(text) => setFormData({ ...formData, amount: text })}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                <View style={styles.categoryContainer}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        formData.category === category && styles.activeCategoryChip,
                      ]}
                      onPress={() => setFormData({ ...formData, category })}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          formData.category === category && styles.activeCategoryChipText,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add a note (optional)"
                placeholderTextColor={colors.textSecondary}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={3}
              />
            </View>
          </Card>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Cancel"
            onPress={onClose}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title="Add Transaction"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      flex: 1,
      padding: 20,
    },
    formCard: {
      marginBottom: 20,
    },
    typeSelector: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceVariant,
      borderRadius: 12,
      padding: 4,
      marginBottom: 24,
    },
    typeButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    activeTypeButton: {
      backgroundColor: colors.primary,
    },
    typeButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    activeTypeButtonText: {
      color: colors.surface,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.surfaceVariant,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    amountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceVariant,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    amountInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      marginLeft: 8,
    },
    categoryScroll: {
      marginHorizontal: -4,
    },
    categoryContainer: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 4,
    },
    categoryChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.surfaceVariant,
      borderWidth: 1,
      borderColor: colors.border,
    },
    activeCategoryChip: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryChipText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    activeCategoryChipText: {
      color: colors.surface,
    },
    footer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    cancelButton: {
      flex: 1,
    },
    submitButton: {
      flex: 2,
    },
  });