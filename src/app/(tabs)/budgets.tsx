import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { PiggyBank, Plus } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeProvider';
import { useAuth } from '../../context/AuthContext';
import { getBudgets } from '../../services/budgetService';
import { Budget } from '../../types';
import ScreenContainer from '../../components/ScreenContainer';
import CreateBudgetModal from '../../components/forms/CreateBudgetModal';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
const BudgetProgressBar = ({ spent, allocated, color }: { spent: number, allocated: number, color: string }) => {
    const percent = allocated > 0 ? Math.min((spent / allocated) * 100, 100) : 0;
    return (
        <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${percent}%`, backgroundColor: color }]} />
        </View>
    );
};

export default function BudgetsScreen() {
  const { colors } = useTheme();
  const { session } = useAuth();
  const user = session?.user;
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);

  const fetchBudgets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getBudgets(user.id);
      setBudgets(data);
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => {
    fetchBudgets();
  }, [fetchBudgets]));

  const renderBudgetItem = ({ item }: { item: Budget }) => {
    const remaining = item.amount - item.spent;
    const isOverspent = remaining < 0;
    const progressColor = isOverspent ? colors.error : colors.primary;

    return (
        <View style={[styles.budgetCard, { backgroundColor: colors.surface }]}>
            <View style={styles.budgetHeader}>
                <Text style={[styles.budgetCategory, { color: colors.text }]}>{item.category}</Text>
                <Text style={[styles.budgetAmount, { color: colors.text }]}>
                    ${item.spent.toFixed(2)} / <Text style={{color: colors.textSecondary}}>${item.amount.toFixed(2)}</Text>
                </Text>
            </View>
            <BudgetProgressBar spent={item.spent} allocated={item.amount} color={progressColor} />
            <Text style={[styles.budgetRemaining, { color: isOverspent ? colors.error : colors.textSecondary }]}>
                {isOverspent ? `$${Math.abs(remaining).toFixed(2)} Overspent` : `$${remaining.toFixed(2)} Remaining`}
            </Text>
        </View>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Budgets</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Plus color={colors.primary} size={28} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} size="large" />
      ) : (
        <FlatList
          data={budgets}
          renderItem={renderBudgetItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <PiggyBank size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No budgets created yet.</Text>
                <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>Tap the '+' button to start tracking your spending.</Text>
            </View>
          }
        />
      )}
      
      <CreateBudgetModal 
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={fetchBudgets}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10 },
    title: { fontSize: 32, fontWeight: 'bold' },
    addButton: { padding: 8 },
    list: { paddingHorizontal: 16, paddingBottom: 50 },
    budgetCard: { borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#333' },
    budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    budgetCategory: { fontSize: 18, fontWeight: 'bold' },
    budgetAmount: { fontSize: 14, fontFamily: 'monospace' },
    progressBarBackground: { height: 8, backgroundColor: '#333', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 4 },
    budgetRemaining: { fontSize: 12, textAlign: 'right', marginTop: 8, fontStyle: 'italic' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100, paddingHorizontal: 40, gap: 16 },
    emptyText: { fontSize: 20, fontWeight: 'bold' },
    emptySubText: { fontSize: 14, textAlign: 'center' },
});
