import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Plus, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import { createJournalEntry, getChartOfAccounts } from '@/services/accountingService';
import { JournalEntryLine, Account } from '@/types';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import { Picker } from '@react-native-picker/picker';

interface JournalEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId: string;
}

export default function JournalEntryModal({ visible, onClose, onSuccess, clientId }: JournalEntryModalProps) {
  const { colors } = useTheme();
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState<Partial<JournalEntryLine>[]>([{ debit_amount: 0, credit_amount: 0 }, { debit_amount: 0, credit_amount: 0 }]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);

  useEffect(() => {
    if (visible) {
      getChartOfAccounts(clientId).then(setAccounts).catch(console.error);
    }
  }, [visible, clientId]);
  
  useEffect(() => {
    const debits = lines.reduce((sum: number, line: Partial<JournalEntryLine>) => sum + (Number(line.debit_amount ?? 0) || 0), 0);
    const credits = lines.reduce((sum: number, line: Partial<JournalEntryLine>) => sum + (Number(line.credit_amount ?? 0) || 0), 0);
    setTotalDebit(debits);
    setTotalCredit(credits);
  }, [lines]);

  const updateLine = (index: number, field: keyof JournalEntryLine, value: string | number | undefined) => {
    const newLines = [...lines];
  if (field === 'account_id') {
    const selectedAccount = accounts.find(a => a.id === value || a.code === value);
    // Ensure account_id is stored as a string
    const acctId = selectedAccount?.id ?? selectedAccount?.code;
    newLines[index].account_id = acctId !== undefined && acctId !== null ? String(acctId) : undefined;
    } else {
        // Ensure debit_amount and credit_amount are stored as numbers
    if (field === 'debit_amount' || field === 'credit_amount') {
      newLines[index][field] = Number(value ?? 0) || 0;
    } else {
      // Narrow assignment based on field expected type
      if (field === 'description') {
        newLines[index][field] = String(value ?? '') as any;
      } else {
        newLines[index][field] = value as any;
      }
    }
    }
    setLines(newLines);
  };
  
  const addLine = () => setLines([...lines, {}]);
  const removeLine = (index: number) => setLines(lines.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!description || lines.some(l => !l.account_id || (!l.debit_amount && !l.credit_amount))) {
        return Alert.alert('Validation Error', 'Please provide a description and fill all transaction lines.');
    }
    if (totalDebit !== totalCredit || totalDebit === 0) {
        return Alert.alert('Validation Error', 'Total debits must equal total credits and cannot be zero.');
    }
    
    setLoading(true);
    try {
        await createJournalEntry({
          client_id: clientId,
          date: new Date().toISOString(),
          description,
          entries: lines as JournalEntryLine[],
          status: 'posted',
          created_by: clientId,
        });
        onSuccess();
        onClose();
    } catch (error) {
        Alert.alert('Error', 'Failed to create journal entry.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Create Journal Entry">
      <TextInput style={[styles.input, { backgroundColor: colors.surface }]} placeholder="Entry Description" value={description} onChangeText={setDescription} />
      
      <View style={styles.tableHeader}>
          <Text style={[styles.headerText, { flex: 3 }]}>Account</Text>
          <Text style={[styles.headerText, { flex: 2, textAlign: 'right' }]}>Debit</Text>
          <Text style={[styles.headerText, { flex: 2, textAlign: 'right' }]}>Credit</Text>
          <View style={{ width: 30 }} />
      </View>

      <FlatList
        data={lines}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.lineItem}>
              <Picker selectedValue={item.account_id} onValueChange={(val) => updateLine(index, 'account_id', val)} style={[styles.picker, { flex: 3 }]}>
                  {accounts.map(acc => <Picker.Item key={acc.id} label={`${acc.code} - ${acc.name}`} value={acc.id} />)}
              </Picker>
              <TextInput style={[styles.lineInput, { flex: 2 }]} placeholder="0.00" keyboardType="numeric" value={item.debit_amount?.toString()} onChangeText={(val) => updateLine(index, 'debit_amount', val)} />
              <TextInput style={[styles.lineInput, { flex: 2 }]} placeholder="0.00" keyboardType="numeric" value={item.credit_amount?.toString()} onChangeText={(val) => updateLine(index, 'credit_amount', val)} />
              <TouchableOpacity onPress={() => removeLine(index)} style={{ width: 30, alignItems: 'center' }}>
                  <Trash2 color={colors.error} size={18} />
              </TouchableOpacity>
          </View>
        )}
      />
      
      <TouchableOpacity onPress={addLine} style={styles.addLineButton}><Plus size={16} color={colors.primary} /><Text style={{ color: colors.primary }}>Add Line</Text></TouchableOpacity>
      
      <View style={styles.totalsRow}>
          <Text style={styles.totalText}>Totals</Text>
          <Text style={styles.totalAmount}>${totalDebit.toFixed(2)}</Text>
          <Text style={styles.totalAmount}>${totalCredit.toFixed(2)}</Text>
      </View>
      
      <Button title="Post Entry" onPress={handleSubmit} isLoading={loading} disabled={totalDebit !== totalCredit || totalDebit === 0} />
    </Modal>
  );
}
// Extensive styling for a professional look
const styles = StyleSheet.create({
    input: { height: 50, borderRadius: 8, paddingHorizontal: 16, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#444' },
    tableHeader: { flexDirection: 'row', paddingHorizontal: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#444' },
    headerText: { fontWeight: 'bold', color: '#8892B0' },
    lineItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 },
    picker: { height: 40, borderWidth: 1, borderColor: '#444', borderRadius: 8 },
    lineInput: { height: 40, borderWidth: 1, borderColor: '#444', borderRadius: 8, paddingHorizontal: 8, textAlign: 'right', fontFamily: 'monospace' },
    addLineButton: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', padding: 10, marginVertical: 8 },
    totalsRow: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 2, borderTopColor: '#444', paddingTop: 8, marginTop: 8, paddingHorizontal: 38 },
    totalText: { flex: 3, fontWeight: 'bold', fontSize: 16 },
    totalAmount: { flex: 2, textAlign: 'right', fontWeight: 'bold', fontSize: 16, fontFamily: 'monospace' },
});
