import React, { useState, useEffect } from 'react';
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
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@/context/ThemeProvider';
import {
  createJournalEntry,
  getChartOfAccounts,
} from '@/services/accountingService';
import { ChartOfAccounts, JournalEntryLine } from '@/types/accounting';
import Button from '@/components/common/Button';
import { Plus, Trash2, Calculator } from 'lucide-react-native';

interface JournalEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function JournalEntryModal({
  visible,
  onClose,
  onSuccess,
}: JournalEntryModalProps) {
  const { colors } = useTheme();
  const [accounts, setAccounts] = useState<ChartOfAccounts[]>([]);
  const [reference, setReference] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [entries, setEntries] = useState<Omit<JournalEntryLine, 'id'>[]>([
    {
      accountId: '',
      accountName: '',
      accountCode: '',
      description: '',
      debitAmount: 0,
      creditAmount: 0,
    },
    {
      accountId: '',
      accountName: '',
      accountCode: '',
      description: '',
      debitAmount: 0,
      creditAmount: 0,
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      loadAccounts();
      generateReference();
    }
  }, [visible]);

  const loadAccounts = async () => {
    try {
      const accountsData = await getChartOfAccounts();
      setAccounts(accountsData.filter((acc) => acc.isActive));
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  };

  const generateReference = () => {
    const now = new Date();
    const ref = `JE-${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${now
      .getDate()
      .toString()
      .padStart(2, '0')}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')}`;
    setReference(ref);
  };

  const addEntryLine = () => {
    setEntries([
      ...entries,
      {
        accountId: '',
        accountName: '',
        accountCode: '',
        description: '',
        debitAmount: 0,
        creditAmount: 0,
      },
    ]);
  };

  const removeEntryLine = (index: number) => {
    if (entries.length > 2) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const updateEntry = (index: number, field: string, value: any) => {
    const updatedEntries = [...entries];

    if (field === 'accountId') {
      const selectedAccount = accounts.find((acc) => acc.id === value);
      if (selectedAccount) {
        updatedEntries[index] = {
          ...updatedEntries[index],
          accountId: value,
          accountName: selectedAccount.name,
          accountCode: selectedAccount.code,
        };
      }
    } else {
      updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    }

    setEntries(updatedEntries);
  };

  const getTotalDebits = () =>
    entries.reduce((sum, entry) => sum + (entry.debitAmount || 0), 0);
  const getTotalCredits = () =>
    entries.reduce((sum, entry) => sum + (entry.creditAmount || 0), 0);
  const isBalanced = () =>
    Math.abs(getTotalDebits() - getTotalCredits()) < 0.01;

  const handleSave = async () => {
    if (!reference || !description) {
      Alert.alert(
        'Missing Fields',
        'Please fill in Reference and Description.'
      );
      return;
    }

    if (!isBalanced()) {
      Alert.alert('Unbalanced Entry', 'Total debits must equal total credits.');
      return;
    }

    const validEntries = entries.filter(
      (entry) =>
        entry.accountId && (entry.debitAmount > 0 || entry.creditAmount > 0)
    );

    if (validEntries.length < 2) {
      Alert.alert('Invalid Entry', 'At least two account lines are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createJournalEntry({
        date,
        reference,
        description,
        clientId: 'cli1', // In real app, get from context
        entries: validEntries.map((entry, index) => ({
          ...entry,
          id: `line_${index}`,
        })),
        totalDebit: getTotalDebits(),
        totalCredit: getTotalCredits(),
        status: 'posted',
        createdBy: 'user1',
      });

      onSuccess();
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to create journal entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setReference('');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setEntries([
      {
        accountId: '',
        accountName: '',
        accountCode: '',
        description: '',
        debitAmount: 0,
        creditAmount: 0,
      },
      {
        accountId: '',
        accountName: '',
        accountCode: '',
        description: '',
        debitAmount: 0,
        creditAmount: 0,
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.cancelButton, { color: colors.primary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            New Journal Entry
          </Text>
          <TouchableOpacity onPress={handleSave} disabled={isSubmitting}>
            <Text style={[styles.saveButton, { color: colors.primary }]}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Entry Details
            </Text>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Reference
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    },
                  ]}
                  value={reference}
                  onChangeText={setReference}
                  placeholder="JE-001"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Date
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    },
                  ]}
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Description
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the transaction..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Account Lines
              </Text>
              <TouchableOpacity
                onPress={addEntryLine}
                style={styles.addLineButton}
              >
                <Plus size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {entries.map((entry, index) => (
              <View
                key={index}
                style={[
                  styles.entryLine,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.entryHeader}>
                  <Text
                    style={[styles.lineNumber, { color: colors.textSecondary }]}
                  >
                    Line {index + 1}
                  </Text>
                  {entries.length > 2 && (
                    <TouchableOpacity onPress={() => removeEntryLine(index)}>
                      <Trash2 size={16} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Account
                </Text>
                <View
                  style={[
                    styles.pickerContainer,
                    { borderColor: colors.border },
                  ]}
                >
                  <Picker
                    selectedValue={entry.accountId}
                    onValueChange={(value) =>
                      updateEntry(index, 'accountId', value)
                    }
                    style={[styles.picker, { color: colors.text }]}
                  >
                    <Picker.Item label="Select Account..." value="" />
                    {accounts.map((account) => (
                      <Picker.Item
                        key={account.id}
                        label={`${account.code} - ${account.name}`}
                        value={account.id}
                      />
                    ))}
                  </Picker>
                </View>

                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Description
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
                  value={entry.description}
                  onChangeText={(value) =>
                    updateEntry(index, 'description', value)
                  }
                  placeholder="Line description..."
                  placeholderTextColor={colors.textSecondary}
                />

                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text
                      style={[styles.label, { color: colors.textSecondary }]}
                    >
                      Debit
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
                      value={
                        entry.debitAmount > 0
                          ? entry.debitAmount.toString()
                          : ''
                      }
                      onChangeText={(value) =>
                        updateEntry(
                          index,
                          'debitAmount',
                          parseFloat(value) || 0
                        )
                      }
                      placeholder="0.00"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <Text
                      style={[styles.label, { color: colors.textSecondary }]}
                    >
                      Credit
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
                      value={
                        entry.creditAmount > 0
                          ? entry.creditAmount.toString()
                          : ''
                      }
                      onChangeText={(value) =>
                        updateEntry(
                          index,
                          'creditAmount',
                          parseFloat(value) || 0
                        )
                      }
                      placeholder="0.00"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View
            style={[
              styles.totalsSection,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.totalsHeader}>
              <Calculator size={20} color={colors.primary} />
              <Text style={[styles.totalsTitle, { color: colors.text }]}>
                Entry Totals
              </Text>
            </View>
            <View style={styles.totalsRow}>
              <Text
                style={[styles.totalsLabel, { color: colors.textSecondary }]}
              >
                Total Debits:
              </Text>
              <Text style={[styles.totalsValue, { color: colors.text }]}>
                ${getTotalDebits().toFixed(2)}
              </Text>
            </View>
            <View style={styles.totalsRow}>
              <Text
                style={[styles.totalsLabel, { color: colors.textSecondary }]}
              >
                Total Credits:
              </Text>
              <Text style={[styles.totalsValue, { color: colors.text }]}>
                ${getTotalCredits().toFixed(2)}
              </Text>
            </View>
            <View style={[styles.totalsRow, styles.balanceRow]}>
              <Text
                style={[
                  styles.totalsLabel,
                  { color: colors.text, fontWeight: 'bold' },
                ]}
              >
                Balance:
              </Text>
              <Text
                style={[
                  styles.totalsValue,
                  {
                    color: isBalanced() ? colors.success : colors.error,
                    fontWeight: 'bold',
                  },
                ]}
              >
                {isBalanced()
                  ? 'BALANCED'
                  : `OFF BY $${Math.abs(
                      getTotalDebits() - getTotalCredits()
                    ).toFixed(2)}`}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  cancelButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  addLineButton: {
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
  },
  entryLine: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  lineNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalsSection: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  totalsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  totalsTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  balanceRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
    paddingTop: 8,
    marginTop: 8,
  },
  totalsLabel: {
    fontSize: 14,
  },
  totalsValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
