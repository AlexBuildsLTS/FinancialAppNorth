import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Plus, Target, CircleAlert as AlertCircle, CircleCheck as CheckCircle } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeProvider';
import { getBudgets, getGoals } from '@/services/dataService';
import { Budget, Goal } from '@/types';
import Card from '@/components/common/Card';

const { width } = Dimensions.get('window');

export default function BudgetsScreen() {
  const { colors, isDark } = useTheme();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const styles = createStyles(colors, width);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [budgetsData, goalsData] = await Promise.all([
          getBudgets(),
          getGoals(),
        ]);
        setBudgets(budgetsData);
        setGoals(goalsData);
      } catch (error) {
        console.error('Failed to load budgets and goals:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const renderBudgetCard = (budget: Budget, index: number) => {
    const spentPercentage = (budget.spent / budget.allocated) * 100;
    const isOverBudget = spentPercentage > 100;
    const progressColor = isOverBudget ? colors.error : 
                         spentPercentage > 80 ? colors.warning : colors.success;

    return (
      <Animated.View
        key={budget.id}
        entering={FadeInUp.delay(200 + index * 100).springify()}
        style={styles.budgetCard}
      >
        <View style={styles.budgetHeader}>
          <Text style={styles.budgetCategory}>{budget.category}</Text>
          {isOverBudget ? (
            <AlertCircle size={20} color={colors.error} />
          ) : (
            <CheckCircle size={20} color={colors.success} />
          )}
        </View>

        <View style={styles.budgetAmounts}>
          <Text style={styles.spentAmount}>
            ${budget.spent.toLocaleString()}
          </Text>
          <Text style={styles.allocatedAmount}>
            of ${budget.allocated.toLocaleString()}
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(spentPercentage, 100)}%`,
                  backgroundColor: progressColor,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: progressColor }]}>
            {spentPercentage.toFixed(1)}%
          </Text>
        </View>

        <Text style={styles.budgetPeriod}>
          {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} budget
        </Text>
      </Animated.View>
    );
  };

  const renderGoalCard = (goal: Goal, index: number) => {
    const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
    const remainingAmount = goal.targetAmount - goal.currentAmount;
    const daysRemaining = Math.ceil(
      (new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
      <Animated.View
        key={goal.id}
        entering={FadeInUp.delay(400 + index * 100).springify()}
        style={styles.goalCard}
      >
        <View style={styles.goalHeader}>
          <View style={styles.goalTitleContainer}>
            <Target size={20} color={colors.primary} />
            <Text style={styles.goalTitle}>{goal.title}</Text>
          </View>
          <View style={[
            styles.priorityBadge,
            { backgroundColor: goal.priority === 'high' ? `${colors.error}20` : 
                               goal.priority === 'medium' ? `${colors.warning}20` : 
                               `${colors.success}20` }
          ]}>
            <Text style={[
              styles.priorityText,
              { color: goal.priority === 'high' ? colors.error : 
                      goal.priority === 'medium' ? colors.warning : 
                      colors.success }
            ]}>
              {goal.priority}
            </Text>
          </View>
        </View>

        <Text style={styles.goalDescription}>{goal.description}</Text>

        <View style={styles.goalProgress}>
          <View style={styles.goalAmounts}>
            <Text style={styles.currentAmount}>
              ${goal.currentAmount.toLocaleString()}
            </Text>
            <Text style={styles.targetAmount}>
              of ${goal.targetAmount.toLocaleString()}
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(progressPercentage, 100)}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {progressPercentage.toFixed(1)}%
            </Text>
          </View>

          <View style={styles.goalFooter}>
            <Text style={styles.remainingAmount}>
              ${remainingAmount.toLocaleString()} remaining
            </Text>
            <Text style={styles.daysRemaining}>
              {daysRemaining > 0 ? `${daysRemaining} days left` : 'Goal reached!'}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Budgets & Goals</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Budgets & Goals</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color={colors.surface} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Budgets Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Budgets</Text>
          <View style={styles.budgetsGrid}>
            {budgets.map((budget, index) => renderBudgetCard(budget, index))}
          </View>
        </View>

        {/* Goals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Goals</Text>
          <View style={styles.goalsList}>
            {goals.map((goal, index) => renderGoalCard(goal, index))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, screenWidth: number) => {
  const cardWidth = (screenWidth - 52) / 2;

  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: { fontSize: 24, fontWeight: '700', color: colors.text },
    addButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 100 },
    section: { paddingHorizontal: 20, paddingTop: 24 },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    budgetsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 16,
    },
    budgetCard: {
      width: cardWidth,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    budgetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    budgetCategory: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    budgetAmounts: { marginBottom: 12 },
    spentAmount: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
    },
    allocatedAmount: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    progressTrack: {
      flex: 1,
      height: 6,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
    },
    progressText: {
      fontSize: 12,
      fontWeight: '600',
      minWidth: 40,
      textAlign: 'right',
    },
    budgetPeriod: {
      fontSize: 12,
      color: colors.textSecondary,
      textTransform: 'capitalize',
    },
    goalsList: { gap: 16 },
    goalCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    goalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    goalTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
    },
    goalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    priorityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    priorityText: {
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    goalDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 16,
    },
    goalProgress: { gap: 12 },
    goalAmounts: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    currentAmount: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
    },
    targetAmount: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    goalFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    remainingAmount: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    daysRemaining: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
  });
};