import React, { useState, useEffect } from 'react'; // Import useEffect
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, ScrollView } from 'react-native'; // Import ScrollView, TouchableOpacity
import { useTheme } from '@/shared/context/ThemeProvider';
import { useAuth } from '@/shared/context/AuthContext';
import { useToast } from '@/shared/context/ToastProvider';
import { createBudget, getCategories } from '@/features/budgets/services/budgetService'; // Import getCategories
import Modal from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { Category } from '@/shared/types'; // Assuming Category type exists
import * as Icons from 'lucide-react-native'; // Import all Lucide icons

interface CreateBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Map category names to Lucide icons
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

type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

export default function CreateBudgetModal({ visible, onClose, onSuccess }: CreateBudgetModalProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const { session } = useAuth();
  const { showToast } = useToast();

  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [budgetLimit, setBudgetLimit] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<BudgetPeriod>('monthly');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!session?.user) return;
      try {
        const fetchedCategories = await getCategories(session.user.id);
        setAvailableCategories(fetchedCategories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        showToast('Failed to load categories.', 'error');
      }
    };
    if (visible) {
      fetchCategories();
    }
  }, [visible, session, showToast]);

  const handleCreateBudget = async () => {
    if (!session?.user) return;
    const allocatedAmount = parseFloat(budgetLimit);
    if (!selectedCategory || isNaN(allocatedAmount) || allocatedAmount <= 0) {
      return Alert.alert('Invalid Input', 'Please select a category and enter a positive budget limit.');
    }

    setLoading(true);
    try {
      await createBudget({
        user_id: session.user.id,
        category: selectedCategory,
        allocated: allocatedAmount,
        period: selectedPeriod,
      });
      showToast('Budget created successfully!', 'success');
      onSuccess();
      onClose();
      // Reset form
      setSelectedCategory(null);
      setBudgetLimit('');
      setSelectedPeriod('monthly');
    } catch (error) {
      showToast('Failed to create budget.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Create Budget">
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

        <Text style={[styles.label, { color: colors.textSecondary, marginTop: 20 }]}>Budget Limit ($)</Text>
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
