import React, { useState } from 'react';
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
import {
  Calendar,
  Download,
  TrendingUp,
  DollarSign,
} from 'lucide-react-native';
import {
  VictoryBar,
  VictoryChart,
  VictoryPie,
  VictoryAxis,
} from 'victory-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeProvider';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { colors, isDark } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('6M');

  const incomeVsExpenseData = [
    { x: 'Jul', y: 5200 },
    { x: 'Aug', y: 5400 },
    { x: 'Sep', y: 5200 },
    { x: 'Oct', y: 5600 },
    { x: 'Nov', y: 5300 },
    { x: 'Dec', y: 5800 },
  ];

  const expenseData = [
    { x: 'Jul', y: 3800 },
    { x: 'Aug', y: 4100 },
    { x: 'Sep', y: 3900 },
    { x: 'Oct', y: 4200 },
    { x: 'Nov', y: 3700 },
    { x: 'Dec', y: 4500 },
  ];

  const categoryData = [
    { x: 'Housing', y: 35, amount: 1750 },
    { x: 'Food', y: 25, amount: 1250 },
    { x: 'Transport', y: 20, amount: 1000 },
    { x: 'Entertainment', y: 12, amount: 600 },
    { x: 'Other', y: 8, amount: 400 },
  ];

  const pieColors = [colors.primary, colors.success, colors.warning, '#8b5cf6', colors.error];
  const periods = ['1M', '3M', '6M', '1Y'];
  const styles = createStyles(colors, width);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
            <Calendar size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
            <Download size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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
              activeOpacity={0.7}
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

        <View style={styles.summaryGrid}>
          <Animated.View
            entering={FadeInUp.delay(200).springify()}
            style={styles.summaryCard}
          >
            <View style={styles.summaryHeader}>
              <TrendingUp size={24} color={colors.success} />
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
              <DollarSign size={24} color={colors.primary} />
              <Text style={styles.summaryTitle}>Avg. Daily Spend</Text>
            </View>
            <Text style={styles.summaryValue}>$145.20</Text>
            <Text style={styles.summaryChange}>-5.2% from last month</Text>
          </Animated.View>
        </View>

        <Animated.View
          entering={FadeInUp.delay(300).springify()}
          style={styles.chartCard}
        >
          <Text style={styles.chartTitle}>Income vs Expenses</Text>
          <Text style={styles.chartSubtitle}>Monthly comparison</Text>
          <VictoryChart domainPadding={{ x: 20 }} height={250} width={width - 40}>
            <VictoryAxis
              tickValues={incomeVsExpenseData.map((d) => d.x)}
              style={{
                axis: { stroke: 'transparent' },
                tickLabels: {
                  fill: colors.textSecondary,
                  fontSize: 10,
                  padding: 5,
                },
              }}
            />
            <VictoryAxis
              dependentAxis
              tickFormat={(t) => `$${t / 1000}k`}
              style={{
                axis: { stroke: 'transparent' },
                grid: { stroke: colors.border, strokeDasharray: '4,4' },
                tickLabels: {
                  fill: colors.textSecondary,
                  fontSize: 10,
                  padding: 5,
                },
              }}
            />
            <VictoryBar
              data={incomeVsExpenseData}
              style={{ data: { fill: colors.primary } }}
              barWidth={8}
              cornerRadius={{ topLeft: 4, topRight: 4 }}
            />
            <VictoryBar
              data={expenseData}
              style={{ data: { fill: colors.warning } }}
              barWidth={8}
              cornerRadius={{ topLeft: 4, topRight: 4 }}
            />
          </VictoryChart>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(400).springify()}
          style={styles.chartCard}
        >
          <Text style={styles.chartTitle}>Expense Categories</Text>
          <Text style={styles.chartSubtitle}>This month's breakdown</Text>
          <View style={styles.pieChartContainer}>
            <VictoryPie
              data={categoryData}
              colorScale={pieColors}
              width={width - 80}
              height={220}
              innerRadius={50}
              padAngle={2}
              labelComponent={<View />}
            />
          </View>
          <View style={styles.categoryList}>
            {categoryData.map((category, index) => (
              <View key={category.x} style={styles.categoryItem}>
                <View style={styles.categoryLeft}>
                  <View
                    style={[
                      styles.categoryColor,
                      { backgroundColor: pieColors[index] },
                    ]}
                  />
                  <Text style={styles.categoryLabel}>{category.x}</Text>
                </View>
                <View style={styles.categoryRight}>
                  <Text style={styles.categoryAmount}>${category.amount}</Text>
                  <Text style={styles.categoryPercentage}>{category.y}%</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, screenWidth: number) =>
  StyleSheet.create({
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
    headerActions: { flexDirection: 'row', gap: 12 },
    headerButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollView: { flex: 1 },
    scrollContent: {
      paddingBottom: 100,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    periodSelector: { 
      flexDirection: 'row', 
      gap: 8, 
      marginBottom: 20,
      flexWrap: 'wrap',
    },
    periodButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.surfaceVariant,
      minWidth: 60,
      alignItems: 'center',
    },
    activePeriodButton: { backgroundColor: colors.primary },
    periodButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    activePeriodButtonText: {
      color: colors.surface,
    },
    summaryGrid: { 
      flexDirection: 'row', 
      gap: 12, 
      marginBottom: 20,
      flexWrap: 'wrap',
    },
    summaryCard: {
      flex: 1,
      minWidth: (screenWidth - 52) / 2,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1, // Corrected typo
      shadowRadius: 8, // Corrected typo
      elevation: 4,
    },
    summaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    summaryTitle: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    summaryValue: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 4,
    },
    summaryChange: { fontSize: 12, color: colors.success, fontWeight: '500' },
    chartCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingVertical: 20,
      paddingHorizontal: 20,
      marginBottom: 20,
      borderWidth: 1, // Corrected typo
      borderColor: colors.border, // Corrected typo
      shadowColor: '#000', // Corrected typo
      shadowOffset: { width: 0, height: 2 }, // Corrected typo
      shadowOpacity: 0.1, // Corrected typo
      shadowRadius: 8, // Corrected typo
      elevation: 4,
    },
    chartTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    chartSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 20,
    },
    pieChartContainer: { alignItems: 'center', marginBottom: 20 },
    categoryList: { gap: 12 },
    categoryItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    categoryLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    categoryColor: { width: 12, height: 12, borderRadius: 6 },
    categoryLabel: { fontSize: 14, color: colors.text, fontWeight: '500' },
    categoryRight: { alignItems: 'flex-end' },
    categoryAmount: { fontSize: 16, fontWeight: '700', color: colors.text },
    categoryPercentage: { fontSize: 12, color: colors.textSecondary },
  });