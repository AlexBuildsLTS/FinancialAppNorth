import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform, // Import Platform
} from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { useAuth } from '@/shared/context/AuthContext';
import { addTransaction } from '@/shared/services/transactionService';
import { getCategories } from '@/features/budgets/services/budgetService';
import { getChartOfAccounts } from '@/shared/services/accountingService';
import { Transaction, Category, Account } from '@/shared/types';
import { Button } from '@/shared/components/Button';
import Modal from '@/shared/components/Modal';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Icons from 'lucide-react-native';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (newTransaction: Transaction) => void;
  clientId: string | null;
}

const categoryIcons: { [key: string]: Icons.LucideIcon } = {
  Groceries: Icons.ShoppingCart,
  Dining: Icons.Utensils,
  Transportation: Icons.Car,
  Utilities: Icons.Lightbulb,
  Entertainment: Icons.Film,
  Healthcare: Icons.HeartPulse,
  Education: Icons.BookOpen,
  Shopping: Icons.ShoppingBag,
  Travel: Icons.Plane,
  Housing: Icons.Home,
  Salary: Icons.Briefcase,
  Investments: Icons.TrendingUp,
  Other: Icons.Tag,
};

type TransactionType = 'expense' | 'income' | 'transfer';
type TransactionStatus = 'pending' | 'cleared' | 'reconciled';

export default function AddTransactionModal({
  visible,
  onClose,
  onSuccess,
  clientId,
}: AddTransactionModalProps) {
  const { theme: { colors } } = useTheme();
  const { session } = useAuth();
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>('pending');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) return;
      try {
        const fetchedCategories = await getCategories(session.user.id);
        setAvailableCategories(fetchedCategories || []);
        const fetchedAccounts = await getChartOfAccounts(session.user.id);
        setAvailableAccounts(fetchedAccounts || []);
      } catch (error) {
        console.error('Error fetching data for transaction modal:', error);
        Alert.alert('Error', 'Failed to load categories or accounts.');
      }
    };
    if (visible) {
      fetchData();
    }
  }, [visible, session]);

  const handleSubmit = async () => {
    if (!amount || !description || !selectedCategory || !selectedAccount) {
      Alert.alert('Invalid Input', 'Please fill all required fields.');
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid positive amount.');
      return;
    }

    setLoading(true);
    try {
      if (!session?.user) {
        Alert.alert('Error', 'User not authenticated.');
        setLoading(false);
        return;
      }

      const newTransactionData: Omit<Transaction, 'id' | 'created_at'> = {
        user_id: session.user.id,
        account_id: selectedAccount,
        category: selectedCategory,
        description: description,
        amount: numericAmount,
        type: transactionType === 'transfer' ? 'expense' : transactionType,
        transaction_date: date.toISOString(),
        date: date.toISOString(), // Added missing 'date' property
        status: transactionStatus, // Directly use transactionStatus as it's now correctly typed
      };

      const addedTransaction = await addTransaction(newTransactionData as any);

      Alert.alert('Success', 'Transaction added successfully.');
      onSuccess(addedTransaction);
      onClose();
      // Clear form
      setTransactionType('expense');
      setDate(new Date());
      setAmount('');
      setDescription('');
      setSelectedCategory(null);
      setSelectedAccount(null);
      setTransactionStatus('pending');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to add transaction.');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Add Transaction">
      <ScrollView contentContainerStyle={styles.modalContent}>
        {/* Transaction Type */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Transaction Type</Text>
        <View style={[styles.typeSelector, { borderColor: colors.border }]}>
          {['expense', 'income', 'transfer'].map((typeOption) => (
            <TouchableOpacity
              key={typeOption}
              style={[
                styles.typeButton,
                transactionType === typeOption && { backgroundColor: colors.accent },
              ]}
              onPress={() => setTransactionType(typeOption as TransactionType)}
            >
              {typeOption === 'expense' && <Icons.MinusCircle size={20} color={transactionType === typeOption ? colors.surfaceContrast : colors.error} />}
              {typeOption === 'income' && <Icons.PlusCircle size={20} color={transactionType === typeOption ? colors.surfaceContrast : colors.success} />}
              {typeOption === 'transfer' && <Icons.Repeat size={20} color={transactionType === typeOption ? colors.surfaceContrast : colors.textPrimary} />}
              <Text style={[styles.typeButtonText, { color: transactionType === typeOption ? colors.surfaceContrast : colors.textPrimary, marginLeft: 5 }]}>
                {typeOption.charAt(0).toUpperCase() + typeOption.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Date</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.input, styles.dateInput, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ color: colors.textPrimary }}>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        {/* Amount */}
        <Text style={[styles.label, { color: colors.textSecondary, marginTop: 20 }]}>Amount ($)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
          placeholder="0.00"
          placeholderTextColor={colors.textSecondary}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        {/* Description */}
        <Text style={[styles.label, { color: colors.textSecondary, marginTop: 20 }]}>Description</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
          placeholder="Enter transaction description"
          placeholderTextColor={colors.textSecondary}
          value={description}
          onChangeText={setDescription}
        />

        {/* Category */}
        <Text style={[styles.label, { color: colors.textSecondary, marginTop: 20 }]}>Category</Text>
        <View style={styles.categoryGrid}>
          {availableCategories.map((cat) => {
            const Icon = categoryIcons[cat.name] || Icons.Tag;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryItem,
                  { backgroundColor: colors.surface },
                  selectedCategory === cat.id && { borderColor: colors.accent, borderWidth: 2 },
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Icon size={24} color={selectedCategory === cat.id ? colors.accent : colors.textPrimary} />
                <Text
                  style={[
                    styles.categoryText,
                    { color: selectedCategory === cat.id ? colors.accent : colors.textPrimary },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Account */}
        <Text style={[styles.label, { color: colors.textSecondary, marginTop: 20 }]}>Account</Text>
        <View style={styles.accountGrid}>
          {availableAccounts.map((acc) => (
            <TouchableOpacity
              key={acc.id}
              style={[
                styles.accountItem,
                { backgroundColor: colors.surface },
                selectedAccount === acc.id && { borderColor: colors.accent, borderWidth: 2 },
              ]}
              onPress={() => setSelectedAccount(acc.id)}
            >
              <Text
                style={[
                  styles.accountText,
                  { color: selectedAccount === acc.id ? colors.accent : colors.textPrimary },
                ]}
              >
                {acc.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Status */}
        <Text style={[styles.label, { color: colors.textSecondary, marginTop: 20 }]}>Status</Text>
        <View style={[styles.statusSelector, { borderColor: colors.border }]}>
          {['pending', 'cleared', 'reconciled'].map((statusOption) => (
            <TouchableOpacity
              key={statusOption}
              style={[
                styles.statusButton,
                transactionStatus === statusOption && { backgroundColor: colors.accent },
              ]}
              onPress={() => setTransactionStatus(statusOption as TransactionStatus)}
            >
              <Text style={[styles.statusButtonText, { color: transactionStatus === statusOption ? colors.surfaceContrast : colors.textPrimary }]}>
                {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Add Transaction"
          onPress={handleSubmit}
          isLoading={loading}
          style={{ marginTop: 30 }}
        />
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    paddingBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
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
  dateInput: {
    justifyContent: 'center',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryText: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  accountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  accountItem: {
    width: '48%',
    paddingVertical: 15,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  accountText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
