// src/features/budgets/components/CreateBudgetModal.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, ScrollView, Modal as RNModal } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastProvider';  
import * as Icons from 'lucide-react-native';
import { createBudget, CreateBudgetPayload, getCategories } from '@/services/budgetService';
import { Category } from '@/types';
import { Button } from '@/components/Button';
import Modal from '@/components/Modal';




interface CreateBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}




interface CreateBudgetModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSuccess: () => void;
}

type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

const categoryIcons: { [key: string]: any } = {
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

export default function CreateBudgetModal({ visible, onClose, onSuccess }: CreateBudgetModalProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const { session, profile } = useAuth(); // ensure useAuth provides profile (or fetch if not)
  const toast = useToast();

  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [budgetLimit, setBudgetLimit] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<BudgetPeriod>('monthly');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!session?.user) return;
      try {
        const fetchedCategories = await getCategories(session.user.id);
        setAvailableCategories(fetchedCategories || []);
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        toast.show('Error', 'Failed to load categories', 'error');
      }
    };
    if (visible) fetchCategories();
  }, [visible, session, toast]);

  const handleCreateBudget = async () => { // Renamed from handleCreateBudget to avoid conflict
    if (!session?.user) return;
    const allocatedAmount = parseFloat(budgetLimit);
    const category = availableCategories.find((c) => c.id === selectedCategoryId);

    if (!category || isNaN(allocatedAmount) || allocatedAmount <= 0) {
      return Alert.alert('Invalid Input', 'Please select a category and enter a positive budget limit.');
    }

    setLoading(true);
    try {
      const Currency = session.user.currency || 'USD';
      const payload: CreateBudgetPayload = {
        user_id: session.user.id,
        name: category.name, // budgets.name
        amount: allocatedAmount, // budgets.amount
        currency: Currency,
        period: selectedPeriod,
      };
      await createBudget(payload);
      toast.show('Success', 'Budget created successfully', 'success');
      onSuccess();
      onClose();
      setSelectedCategoryId(null);
      setBudgetLimit('');
      setSelectedPeriod('monthly');
    } catch (error: any) {
      console.error('createBudget error:', error);
      toast.show('Error', error.message || 'Failed to create budget', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RNModal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create Budget</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: colors.primary }]}>Close</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Select Category</Text>
            <View style={styles.categoryGrid}>
              {availableCategories.map((cat) => {
                const Icon = categoryIcons[cat.name] || Icons.Tag;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryItem,
                      { backgroundColor: colors.surface },
                      selectedCategoryId === cat.id && { borderColor: colors.accent, borderWidth: 2 },
                    ]}
                    onPress={() => setSelectedCategoryId(cat.id)}
                  >
                    <Icon size={24} color={selectedCategoryId === cat.id ? colors.accent : colors.textPrimary} />
                    <Text
                      style={[
                        styles.categoryText,
                        { color: selectedCategoryId === cat.id ? colors.accent : colors.textPrimary },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={[styles.label, { color: colors.textSecondary, marginTop: 20 }]}>Budget Limit</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              value={budgetLimit}
              onChangeText={setBudgetLimit}
              keyboardType="numeric"
            />
            <Text style={[styles.label, { color: colors.textSecondary, marginTop: 20 }]}>Budget Period</Text>
            <View style={[styles.periodSelector, { borderColor: colors.border }]}>
              {['weekly', 'monthly', 'yearly'].map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodButton,
                    selectedPeriod === period && { backgroundColor: colors.accent },
                  ]}
                  onPress={() => setSelectedPeriod(period as BudgetPeriod)}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      { color: selectedPeriod === period ? colors.surfaceContrast : colors.textPrimary },
                    ]}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button title="Create Budget" onPress={handleCreateBudget} isLoading={loading} style={{ marginTop: 30 }} />
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
  },
  modalContent: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 16,
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
  periodSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});