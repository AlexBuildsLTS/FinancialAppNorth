import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  PieChart,
} from 'lucide-react-native';
import {
  LineChart,
  BarChart,
  PieChart as RNPieChart,
} from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedPeriod, setSelectedPeriod] = useState('6M');

  const styles = createStyles(isDark);

  // Sample data for charts
  const incomeVsExpenseData = [
    { month: 'Jul', income: 5200, expense: 3800 },
    { month: 'Aug', income: 5400, expense: 4100 },
    { month: 'Sep', income: 5200, expense: 3900 },
    { month: 'Oct', income: 5600, expense: 4200 },
    { month: 'Nov', income: 5300, expense: 3700 },
    { month: 'Dec', income: 5800, expense: 4500 },
  ];

  const categoryData = [
    {
      value: 35,
      key: 1,
      svg: { fill: '#3b82f6' },
      label: 'Housing',
      amount: 1750,
    },
    {
      value: 25,
      key: 2,
      svg: { fill: '#10b981' },
      label: 'Food',
      amount: 1250,
    },
    {
      value: 20,
      key: 3,
      svg: { fill: '#f59e0b' },
      label: 'Transportation',
      amount: 1000,
    },
    {
      value: 12,
      key: 4,
      svg: { fill: '#8b5cf6' },
      label: 'Entertainment',
      amount: 600,
    },
    { value: 8, key: 5, svg: { fill: '#ef4444' }, label: 'Other', amount: 400 },
  ];

  const periods = ['1M', '3M', '6M', '1Y'];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Calendar size={20} color={isDark ? '#64ffda' : '#3b82f6'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Download size={20} color={isDark ? '#64ffda' : '#3b82f6'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Period Selector */}
        <Animated.View
          entering={FadeInUp.delay(100).springify()}
          style={styles.periodSelector}
        >
          {periods.map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.activePeriodButton,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.activePeriodButtonText,
                ]}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <Animated.View
            entering={FadeInUp.delay(200).springify()}
            style={styles.summaryCard}
          >
            <View style={styles.summaryHeader}>
              <TrendingUp size={24} color={isDark ? '#64ffda' : '#10b981'} />
              <Text style={styles.summaryTitle}>Net Income</Text>
            </View>
            <Text style={styles.summaryValue}>+$3,220</Text>
            <Text style={styles.summaryChange}>+12.5% from last month</Text>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(250).springify()}
            style={styles.summaryCard}
          >
            <View style={styles.summaryHeader}>
              <TrendingDown size={24} color={isDark ? '#fbbf24' : '#ef4444'} />
              <Text style={styles.summaryTitle}>Avg. Daily Spend</Text>
            </View>
            <Text style={styles.summaryValue}>$145.20</Text>
            <Text style={styles.summaryChange}>-5.2% from last month</Text>
          </Animated.View>
        </View>

        {/* Income vs Expense Chart */}
        <Animated.View
          entering={FadeInUp.delay(300).springify()}
          style={styles.chartCard}
        >
          <Text style={styles.chartTitle}>Income vs Expenses</Text>
          <Text style={styles.chartSubtitle}>Monthly comparison</Text>

          <View style={styles.chartContainer}>
            <BarChart
              style={styles.barChart}
              data={incomeVsExpenseData}
              yAccessor={({ item }) => item.expense}
              svg={{ fill: isDark ? '#fbbf24' : '#ef4444' }}
              contentInset={{ top: 20, bottom: 20 }}
              gridMin={0}
            />
          </View>

          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: isDark ? '#64ffda' : '#3b82f6' },
                ]}
              />
              <Text style={styles.legendText}>Income</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: isDark ? '#fbbf24' : '#ef4444' },
                ]}
              />
              <Text style={styles.legendText}>Expenses</Text>
            </View>
          </View>
        </Animated.View>

        {/* Category Breakdown */}
        <Animated.View
          entering={FadeInUp.delay(400).springify()}
          style={styles.chartCard}
        >
          <Text style={styles.chartTitle}>Expense Categories</Text>
          <Text style={styles.chartSubtitle}>This month's breakdown</Text>

          <View style={styles.pieChartContainer}>
            <RNPieChart
              style={styles.pieChart}
              data={categoryData}
              innerRadius={50}
              outerRadius={100}
            />
          </View>

          <View style={styles.categoryList}>
            {categoryData.map((category) => (
              <View key={category.key} style={styles.categoryItem}>
                <View style={styles.categoryLeft}>
                  <View
                    style={[
                      styles.categoryColor,
                      { backgroundColor: category.svg.fill },
                    ]}
                  />
                  <Text style={styles.categoryLabel}>{category.label}</Text>
                </View>
                <View style={styles.categoryRight}>
                  <Text style={styles.categoryAmount}>${category.amount}</Text>
                  <Text style={styles.categoryPercentage}>
                    {category.value}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0a192f' : '#f8fafc',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: isDark ? '#0a192f' : '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1e293b' : '#e2e8f0',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: isDark ? '#ffffff' : '#1f2937',
    },
    headerActions: {
      flexDirection: 'row',
      gap: 12,
    },
    headerButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    periodSelector: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingTop: 20,
      gap: 8,
    },
    periodButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
    },
    activePeriodButton: {
      backgroundColor: isDark ? '#64ffda' : '#3b82f6',
    },
    periodButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#94a3b8' : '#6b7280',
    },
    activePeriodButtonText: {
      color: isDark ? '#0a192f' : '#ffffff',
    },
    summaryGrid: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingTop: 20,
      gap: 12,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderRadius: 16,
      padding: 20,
      shadowColor: isDark ? '#000000' : '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#e2e8f0',
    },
    summaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    summaryTitle: {
      fontSize: 14,
      color: isDark ? '#94a3b8' : '#6b7280',
      fontWeight: '500',
    },
    summaryValue: {
      fontSize: 24,
      fontWeight: '800',
      color: isDark ? '#ffffff' : '#1f2937',
      marginBottom: 4,
    },
    summaryChange: {
      fontSize: 12,
      color: isDark ? '#64ffda' : '#10b981',
      fontWeight: '500',
    },
    chartCard: {
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 20,
      marginTop: 20,
      shadowColor: isDark ? '#000000' : '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#e2e8f0',
    },
    chartTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: isDark ? '#ffffff' : '#1f2937',
      marginBottom: 4,
    },
    chartSubtitle: {
      fontSize: 14,
      color: isDark ? '#94a3b8' : '#6b7280',
      marginBottom: 20,
    },
    chartContainer: {
      height: 200,
      marginBottom: 16,
    },
    barChart: {
      height: 200,
    },
    chartLegend: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 24,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    legendColor: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    legendText: {
      fontSize: 14,
      color: isDark ? '#ffffff' : '#1f2937',
      fontWeight: '500',
    },
    pieChartContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    pieChart: {
      height: 200,
      width: 200,
    },
    categoryList: {
      gap: 12,
    },
    categoryItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    categoryLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    categoryColor: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    categoryLabel: {
      fontSize: 14,
      color: isDark ? '#ffffff' : '#1f2937',
      fontWeight: '500',
    },
    categoryRight: {
      alignItems: 'flex-end',
    },
    categoryAmount: {
      fontSize: 16,
      fontWeight: '700',
      color: isDark ? '#ffffff' : '#1f2937',
    },
    categoryPercentage: {
      fontSize: 12,
      color: isDark ? '#94a3b8' : '#6b7280',
    },
  });
