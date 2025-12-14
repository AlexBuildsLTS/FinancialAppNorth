/**
 * ============================================================================
 * 🚀 NORTHFINANCE: FINANCIAL REPORTS & ANALYTICS SUITE (TITAN EDITION)
 * ============================================================================
 * A comprehensive, enterprise-grade financial dashboard designed for high-performance
 * rendering and deep data visualization.
 *
 * * CORE FEATURES:
 * ----------------------------------------------------------------------------
 * 1. 📊 Interactive Visualizations: Pie, Bar, and Line charts using 'react-native-gifted-charts'.
 * 2. 🤖 Smart Insights Engine: Auto-generated financial advice based on spending patterns.
 * 3. 🏛️ Tax Estimation Engine: Real-time 2024 US Tax Bracket calculation (Progressive).
 * 4. 📂 Data Export: Robust CSV generation using Expo FileSystem and Sharing.
 * 5. ⚡ Performance: Optimized re-renders using useCallback and useMemo patterns.
 * 6. 🛡️ Robust Typing: Strict TypeScript interfaces for all data layers.
 * 7. 📱 Responsive Design: Adaptive layouts for Mobile and Tablet/Desktop.
 *
 * * AUTHOR: NorthFinance Engineering
 * * DATE: 2025-12-14
 * ============================================================================
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  TouchableOpacity,
  RefreshControl,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

// --- Third Party Libraries ---
import { PieChart, BarChart, LineChart } from 'react-native-gifted-charts';
import Animated, { FadeInDown, FadeInRight, FadeIn } from 'react-native-reanimated';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';

// --- Icons ---
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Receipt,
  Calculator,
  Download,
  DollarSign,
  Lightbulb,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle
} from 'lucide-react-native';

// --- Internal Services & Context ---
import { useAuth } from '../../../shared/context/AuthContext';
import { getTransactions } from '../../../services/dataService';
import { useFocusEffect } from 'expo-router';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ============================================================================
// 🏗️ TYPES & INTERFACES (Strict Mode)
// ============================================================================

/**
 * Represents a slice in the Pie Chart.
 * strictly typed for 'react-native-gifted-charts'.
 */
interface CategoryData {
  value: number;
  color: string;
  text: string; // Percentage string (e.g. "25%")
  category: string;
  amount: number;
  isTaxDeductible?: boolean;
  focused?: boolean; // For UI interaction state
}

/**
 * Flattened transaction shape optimized for reporting.
 * Handles potentially null/undefined values from the DB safely.
 */
interface ReportTransaction {
  id: string;
  amount: number;
  date: string; // ISO String
  description: string;
  category: string; 
  is_tax_deductible: boolean;
  type: 'income' | 'expense';
}

/**
 * Data point for Monthly Trend Line Chart.
 */
interface MonthlyData {
  month: string;   // e.g. "Jan"
  income: number;
  expense: number;
  net: number;     // income - expense
  label?: string;  // For chart X-axis
}

/**
 * Comprehensive Tax Estimate Object.
 * Used for the "Tax Est." tab.
 */
interface TaxEstimate {
  totalIncome: number;
  totalExpenses: number;
  taxableIncome: number;
  estimatedTax: number;
  deductibleExpenses: number;
  effectiveRate: number;
  brackets: { 
    rate: string;   // formatted string "10%"
    amount: number; // tax amount in this bracket
    min: number; 
    max: number; 
  }[];
}

/**
 * Automated Financial Insights derived from data.
 * The "AI-Lite" analysis engine output.
 */
interface FinancialInsight {
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  message: string;
}

// ============================================================================
// 🎨 DESIGN CONSTANTS
// ============================================================================

const COLORS = {
  primary: '#64FFDA',   // Teal
  secondary: '#F472B6', // Pink
  accent: '#60A5FA',    // Blue
  warning: '#FBBF24',   // Yellow
  purple: '#A78BFA',    // Purple
  success: '#34D399',   // Green
  orange: '#FB923C',    // Orange
  background: '#0A192F',
  card: '#112240',
  text: '#CCD6F6',
  textDim: '#8892B0',
  white: '#FFFFFF',
};

const CATEGORY_PALETTE = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.accent,
  COLORS.warning,
  COLORS.purple,
  COLORS.success,
  COLORS.orange,
  '#E879F9',
];

/**
 * US 2024 Tax Brackets (Simplified for Single Filers).
 * Used by the Tax Estimation Engine.
 */
const TAX_BRACKETS = [
  { min: 0, max: 11600, rate: 0.1 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
];

// ============================================================================
// ⚛️ MAIN COMPONENT
// ============================================================================

export default function ReportsScreen() {
  // --- Hooks & Dimensions ---
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  // --- Core Data State ---
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<ReportTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  // --- Derived Analytics State ---
  const [pieData, setPieData] = useState<CategoryData[]>([]);
  const [barData, setBarData] = useState<any[]>([]); // Typed as 'any' for chart library compat
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyData[]>([]);
  
  // --- Summary State ---
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [taxEstimate, setTaxEstimate] = useState<TaxEstimate | null>(null);
  const [insights, setInsights] = useState<FinancialInsight[]>([]);

  // --- UI State ---
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'spending' | 'tax' | 'trends'>('spending');
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | 'ytd'>('30d'); 

  // ============================================================================
  // ⚙️ DATA PROCESSING ENGINE
  // ============================================================================

  /**
   * Main data fetching and processing pipeline.
   * This function orchestrates the transformation of raw DB rows into 
   * consumable visualization data structures.
   */
  const generateReport = useCallback(async () => {
    if (!user) return;
    
    // Only show full loading spinner on initial load, not refresh
    if (!refreshing) setLoading(true);
    setError(null);

    try {
      // 1. Fetch Transactions (Network Request)
      // Calls the robust DataService which handles joins and type mapping
      const rawData = await getTransactions(user.id);
      
      // 2. Normalize Data (Robust Type Safety)
      // We map raw DB types to our strict ReportTransaction interface
      const processedTxs: ReportTransaction[] = rawData.map((t: any) => ({
        id: t.id,
        amount: Number(t.amount) || 0, // Fallback to 0 if NaN
        date: t.date,
        description: t.description || 'No description',
        category: t.category || 'Uncategorized', // Flattened string from DataService
        is_tax_deductible: !!t.is_tax_deductible, // Coerce to boolean
        type: Number(t.amount) >= 0 ? 'income' : 'expense'
      }));

      // Sort by date desc (Newest first)
      processedTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(processedTxs);

      // 3. Calculate Core Aggregates (The Heavy Lifting)
      const aggregates = calculateAggregates(processedTxs);
      
      // 4. Update State with Derived Data
      setTotalSpent(aggregates.totalExpense);
      setTotalIncome(aggregates.totalIncome);
      setPieData(aggregates.pieData);
      setBarData(aggregates.barData);
      setMonthlyTrend(aggregates.trendData);
      setTaxEstimate(aggregates.taxData);
      setInsights(generateInsights(aggregates));

    } catch (e: any) {
      console.error('[Reports] Engine Failure:', e);
      setError('Failed to load financial data. Please check your connection.');
      Alert.alert('Data Error', 'Could not generate reports. Please pull to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, refreshing]); // Dependencies

  /**
   * Pure function to calculate all charts and numbers from the transaction list.
   * Separated for clarity, performance, and potential unit testing.
   */
  const calculateAggregates = (txs: ReportTransaction[]) => {
    const categoryMap: Record<string, { amount: number; isTaxDeductible: boolean }> = {};
    const monthlyMap: Record<string, { income: number; expense: number }> = {};
    
    let totalExpense = 0;
    let totalIncome = 0;
    let totalDeductible = 0;

    // --- Single Pass Loop for O(n) Efficiency ---
    txs.forEach((t) => {
      const amt = t.amount;
      const absAmt = Math.abs(amt);
      const date = new Date(t.date);
      
      // Skip invalid dates to prevent crashes
      if (isNaN(date.getTime())) return;

      // 1. Monthly Bucketing (YYYY-MM)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { income: 0, expense: 0 };

      if (amt < 0) {
        // --- Expense Logic ---
        totalExpense += absAmt;
        monthlyMap[monthKey].expense += absAmt;

        // Category Grouping
        const cat = t.category;
        if (!categoryMap[cat]) categoryMap[cat] = { amount: 0, isTaxDeductible: false };
        
        categoryMap[cat].amount += absAmt;
        if (t.is_tax_deductible) {
          categoryMap[cat].isTaxDeductible = true;
          totalDeductible += absAmt;
        }
      } else {
        // --- Income Logic ---
        totalIncome += amt;
        monthlyMap[monthKey].income += amt;
      }
    });

    // --- Generate Pie Data ---
    const pieData: CategoryData[] = Object.keys(categoryMap).map((key, index) => ({
      value: categoryMap[key].amount,
      color: CATEGORY_PALETTE[index % CATEGORY_PALETTE.length],
      text: totalExpense > 0 ? `${Math.round((categoryMap[key].amount / totalExpense) * 100)}%` : '0%',
      category: key,
      amount: categoryMap[key].amount,
      isTaxDeductible: categoryMap[key].isTaxDeductible,
    })).sort((a, b) => b.value - a.value); // Sort descending (Largest slices first)

    // --- Generate Bar Data (Top 5 Categories) ---
    const barData = pieData.slice(0, 5).map(item => ({
      value: item.amount,
      label: item.category.length > 8 ? item.category.substring(0, 6) + '..' : item.category,
      frontColor: item.color,
      topLabelComponent: () => (
        <Text style={{ color: COLORS.textDim, fontSize: 10, marginBottom: 4 }}>
          ${(item.amount / 1000).toFixed(1)}k
        </Text>
      ),
    }));

    // --- Generate Trend Data (Last 6 Months) ---
    const trendData = Object.keys(monthlyMap)
      .sort()
      .slice(-6)
      .map(key => {
        const [year, month] = key.split('-');
        const d = new Date(parseInt(year), parseInt(month) - 1, 1);
        return {
          month: format(d, 'MMM'),
          label: format(d, 'MMM'),
          income: monthlyMap[key].income,
          expense: monthlyMap[key].expense,
          net: monthlyMap[key].income - monthlyMap[key].expense
        };
      });

    // --- Calculate Tax ---
    const taxData = calculateTaxEstimates(totalIncome, totalExpense, totalDeductible);

    return { totalExpense, totalIncome, pieData, barData, trendData, taxData };
  };

  /**
   * Calculates progressive tax estimates based on 2024 brackets.
   * FIX: Properly formats 'rate' as string to match TaxEstimate interface.
   */
  const calculateTaxEstimates = (income: number, expenses: number, deductible: number): TaxEstimate => {
    const standardDeduction = 14600; // 2024 Single Filer
    const totalDeductions = Math.max(standardDeduction, deductible);
    const taxable = Math.max(0, income - totalDeductions);

    let tax = 0;
    let remaining = taxable;
    const bracketsResult = [];

    for (const b of TAX_BRACKETS) {
      if (remaining <= 0) break;
      
      const inBracket = Math.min(remaining, b.max - b.min);
      const taxAmount = inBracket * b.rate;
      
      tax += taxAmount;
      if (inBracket > 0) {
        bracketsResult.push({ 
          min: b.min,
          max: b.max,
          rate: `${(b.rate * 100).toFixed(0)}%`, // FIX: Explicit conversion to string
          amount: taxAmount 
        });
      }
      remaining -= inBracket;
    }

    return {
      totalIncome: income,
      totalExpenses: expenses,
      taxableIncome: taxable,
      estimatedTax: tax,
      deductibleExpenses: deductible,
      effectiveRate: income > 0 ? (tax / income) * 100 : 0,
      brackets: bracketsResult
    };
  };

  /**
   * AI-Lite: Generates simple heuristic insights.
   * Analyzes patterns to give the user actionable feedback.
   */
  const generateInsights = (data: ReturnType<typeof calculateAggregates>): FinancialInsight[] => {
    const insightsList: FinancialInsight[] = [];
    const { totalIncome, totalExpense, pieData } = data;

    // Insight 1: Savings Rate Analysis
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    if (savingsRate > 20) {
      insightsList.push({ type: 'positive', title: 'Healthy Savings', message: `You saved ${savingsRate.toFixed(0)}% of income this period.` });
    } else if (savingsRate < 0) {
      insightsList.push({ type: 'negative', title: 'Overspending', message: 'Expenses exceeded income. Review your budget.' });
    } else {
      insightsList.push({ type: 'neutral', title: 'Breaking Even', message: 'You are spending almost exactly what you earn.' });
    }

    // Insight 2: Top Category Alert
    if (pieData.length > 0) {
      const topCat = pieData[0];
      if (topCat.value > totalExpense * 0.4) {
        insightsList.push({ type: 'neutral', title: 'High Concentration', message: `${topCat.category} accounts for 40%+ of your spending.` });
      }
    }

    return insightsList;
  };

  // ============================================================================
  // 📥 EXPORT LOGIC
  // ============================================================================

  const exportToCSV = async () => {
    if (transactions.length === 0) {
      return Alert.alert('Export Failed', 'No data available to export.');
    }

    try {
      const headers = ['Date', 'Description', 'Category', 'Amount', 'Type', 'Tax Deductible'];
      const rows = transactions.map(t => {
        // Escape quotes for CSV safety
        const desc = t.description.replace(/"/g, '""');
        return [
          new Date(t.date).toLocaleDateString(),
          `"${desc}"`,
          t.category,
          t.amount.toFixed(2),
          t.type,
          t.is_tax_deductible ? 'Yes' : 'No'
        ].join(',');
      });

      const csvContent = headers.join(',') + '\n' + rows.join('\n');
      const filename = `NorthFinance_Report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Export Financial Report' });
      } else {
        Alert.alert('Saved', `Report saved to: ${fileUri}`);
      }
    } catch (e: any) {
      console.error('[Reports] Export Error:', e);
      Alert.alert('Export Error', 'Could not generate CSV file.');
    }
  };

  // ============================================================================
  // 🔄 LIFECYCLE EFFECTS
  // ============================================================================

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    generateReport();
  }, [generateReport]);

  useFocusEffect(
    useCallback(() => {
      generateReport();
      return () => {
        // Reset interactive states on blur
        setFocusedIndex(null); 
      };
    }, [generateReport])
  );

  // ============================================================================
  // 🎨 SUB-COMPONENT RENDERERS
  // ============================================================================

  /**
   * Renders the interactive Donut chart center label.
   */
  const renderCenterLabel = () => {
    const isFocused = focusedIndex !== null && pieData[focusedIndex];
    const label = isFocused ? pieData[focusedIndex].category : 'Total Spent';
    const value = isFocused ? pieData[focusedIndex].amount : totalSpent;
    const color = isFocused ? pieData[focusedIndex].color : COLORS.textDim;

    return (
      <View className="items-center justify-center">
        <Text style={{ color }} className="mb-1 text-xs font-bold tracking-wider uppercase">
          {label}
        </Text>
        <Text className="text-xl font-bold text-white">
          ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </Text>
      </View>
    );
  };

  /**
   * Renders the Spending Analysis Tab (Charts + List).
   */
  const renderSpendingTab = () => (
    <Animated.View entering={FadeInDown.duration(500)}>
      {/* --- Insights Section --- */}
      {insights.length > 0 && (
        <View className="mb-6">
          <Text className="mb-3 text-lg font-bold text-white">AI Insights</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {insights.map((insight, idx) => (
              <View 
                key={idx} 
                className={`mr-3 p-4 rounded-2xl border w-64 ${
                  insight.type === 'positive' ? 'bg-green-500/10 border-green-500/30' :
                  insight.type === 'negative' ? 'bg-red-500/10 border-red-500/30' :
                  'bg-[#112240] border-white/10'
                }`}
              >
                <View className="flex-row items-center mb-2">
                  <Lightbulb size={16} color={
                    insight.type === 'positive' ? COLORS.success : 
                    insight.type === 'negative' ? COLORS.secondary : COLORS.warning
                  } />
                  <Text className="ml-2 font-bold text-white">{insight.title}</Text>
                </View>
                <Text className="text-[#8892B0] text-sm leading-5">{insight.message}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View className={`gap-6 ${isDesktop ? 'flex-row' : 'flex-col'}`}>
        {/* --- Pie Chart Section --- */}
        <View className={`bg-[#112240] p-6 rounded-3xl border border-white/5 items-center ${isDesktop ? 'w-1/2' : 'w-full'}`}>
          <View className="flex-row items-center justify-between w-full mb-6">
            <Text className="text-lg font-bold text-white">Distribution</Text>
            <TouchableOpacity onPress={() => setFocusedIndex(null)}>
              <Text className="text-[#64FFDA] text-xs">Reset</Text>
            </TouchableOpacity>
          </View>
          
          {pieData.length > 0 ? (
            <PieChart
              data={pieData.map((p, i) => ({ ...p, focused: focusedIndex === i }))}
              donut
              radius={isDesktop ? 140 : 120}
              innerRadius={isDesktop ? 100 : 85}
              innerCircleColor={COLORS.card}
              centerLabelComponent={renderCenterLabel}
              focusOnPress
              // FIX: Typed the arguments explicitly to remove 'implicit any' errors
              onPress={(_item: any, index: number) => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setFocusedIndex(index === focusedIndex ? null : index);
              }}
            />
          ) : (
            <View className="items-center justify-center h-48">
              <Text className="text-[#8892B0]">No expense data for this period</Text>
            </View>
          )}
        </View>

        {/* --- Bar Chart Section --- */}
        <View className={`bg-[#112240] p-6 rounded-3xl border border-white/5 ${isDesktop ? 'w-1/2' : 'w-full'}`}>
          <Text className="mb-6 text-lg font-bold text-white">Top Categories</Text>
          {barData.length > 0 ? (
            <View className="pl-2 overflow-hidden">
              <BarChart
                data={barData}
                barWidth={32}
                noOfSections={4}
                barBorderRadius={6}
                frontColor={COLORS.primary}
                yAxisThickness={0}
                xAxisThickness={0}
                yAxisTextStyle={{ color: COLORS.textDim, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: COLORS.textDim, fontSize: 10 }}
                height={200}
                width={isDesktop ? 350 : width - 100}
                isAnimated
              />
            </View>
          ) : (
            <View className="items-center justify-center h-48">
              <Text className="text-[#8892B0]">No data to display</Text>
            </View>
          )}
        </View>
      </View>

      {/* --- Category List --- */}
      {pieData.length > 0 && (
        <View className="bg-[#112240] p-4 rounded-3xl border border-white/5 mt-6">
          <Text className="mb-4 ml-2 text-lg font-bold text-white">Detailed Breakdown</Text>
          {pieData.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setFocusedIndex(index)}
              className={`flex-row items-center justify-between p-4 rounded-xl mb-1 border ${
                focusedIndex === index 
                  ? 'bg-[#1D3255] border-[#64FFDA]/30' 
                  : 'bg-transparent border-transparent'
              }`}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <View>
                  <Text className="font-bold text-white">{item.category}</Text>
                  {item.isTaxDeductible && (
                    <Text className="text-[#64FFDA] text-[10px]">Tax Deductible</Text>
                  )}
                </View>
              </View>
              <View className="items-end">
                <Text className="text-base font-bold text-white">${item.amount.toLocaleString()}</Text>
                <Text className="text-[#8892B0] text-xs">{item.text}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Animated.View>
  );

  /**
   * Renders the Tax Estimation Tab.
   */
  const renderTaxTab = () => (
    <Animated.View entering={FadeInRight}>
      <View className="bg-[#112240] p-6 rounded-3xl border border-white/5 mb-4">
        <View className="flex-row justify-between mb-6">
          <View>
            <Text className="text-[#8892B0] text-xs font-bold uppercase tracking-widest mb-1">Estimated Tax (2024)</Text>
            <Text className="text-4xl font-bold text-white">
              ${(taxEstimate?.estimatedTax || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </Text>
          </View>
          <View className="bg-[#64FFDA]/10 p-4 rounded-2xl">
            <Calculator size={28} color={COLORS.primary}/>
          </View>
        </View>
        
        <View className="gap-3">
          <View className="flex-row justify-between py-3 border-b border-white/5">
            <Text className="text-[#8892B0]">Gross Income</Text>
            <Text className="font-medium text-white">${(taxEstimate?.totalIncome || 0).toLocaleString()}</Text>
          </View>
          <View className="flex-row justify-between py-3 border-b border-white/5">
            <Text className="text-[#8892B0]">Total Deductions</Text>
            <Text className="text-[#F472B6] font-medium">-${(taxEstimate?.deductibleExpenses || 14600).toLocaleString()}</Text>
          </View>
          <View className="flex-row justify-between py-3 border-b border-white/5">
            <Text className="text-[#8892B0]">Taxable Income</Text>
            <Text className="font-bold text-white">${(taxEstimate?.taxableIncome || 0).toLocaleString()}</Text>
          </View>
          <View className="flex-row justify-between py-3">
            <Text className="text-[#8892B0]">Effective Rate</Text>
            <View className="flex-row items-center">
              <Text className="text-[#FBBF24] font-bold text-lg mr-1">
                {(taxEstimate?.effectiveRate || 0).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      <Text className="mb-3 ml-2 text-lg font-bold text-white">Marginal Brackets</Text>
      {taxEstimate?.brackets.map((b, i) => (
        <Animated.View 
          key={i} 
          entering={FadeInDown.delay(i * 100)}
          className="flex-row justify-between items-center p-4 bg-[#112240] rounded-xl mb-2 border border-white/5"
        >
          <View>
            <Text className="text-base font-bold text-white">{b.rate} Bracket</Text>
            <Text className="text-[#8892B0] text-xs">Income up to ${b.max.toLocaleString()}</Text>
          </View>
          <Text className="text-[#64FFDA] font-bold">+${b.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
        </Animated.View>
      ))}

      <View className="bg-[#FBBF24]/10 p-4 rounded-xl border border-[#FBBF24]/30 mt-4">
        <View className="flex-row items-center mb-2">
          <AlertTriangle size={16} color={COLORS.warning} />
          <Text className="text-[#FBBF24] font-bold ml-2">Disclaimer</Text>
        </View>
        <Text className="text-[#FBBF24] text-xs leading-5">
          This is an estimation based on 2024 single filer brackets. It does not constitute professional tax advice. Please consult a CPA.
        </Text>
      </View>
    </Animated.View>
  );

  /**
   * Renders the Trend Analysis Tab.
   */
  const renderTrendsTab = () => (
    <Animated.View entering={FadeInRight}>
      <View className="bg-[#112240] p-6 rounded-3xl border border-white/5 h-[400px] justify-center items-center mb-6">
        <Text className="absolute text-lg font-bold text-white top-6 left-6">Cash Flow Trend</Text>
        {monthlyTrend.length > 0 ? (
          <View className="mt-8">
            <LineChart
              data={monthlyTrend.map(m => ({ value: m.net, label: m.month }))}
              height={250}
              width={width - 80}
              color={COLORS.primary}
              thickness={4}
              startFillColor="rgba(100, 255, 218, 0.3)"
              endFillColor="rgba(100, 255, 218, 0.0)"
              areaChart
              yAxisTextStyle={{ color: COLORS.textDim, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: COLORS.textDim, fontSize: 10 }}
              hideRules
              curved
              isAnimated
              animationDuration={1500}
              pointerConfig={{
                pointerStripHeight: 160,
                pointerStripColor: 'lightgray',
                pointerStripWidth: 2,
                pointerColor: 'lightgray',
                radius: 6,
                pointerLabelWidth: 100,
                pointerLabelHeight: 90,
                activatePointersOnLongPress: true,
                autoAdjustPointerLabelPosition: false,
                pointerLabelComponent: (items: any) => {
                  const val = items[0].value;
                  return (
                    <View className="bg-[#0A192F] p-2 rounded-lg border border-[#64FFDA]">
                      <Text className="font-bold text-center text-white">${val}</Text>
                    </View>
                  );
                },
              }}
            />
          </View>
        ) : (
          <Text className="text-[#8892B0]">Insufficient data for trends</Text>
        )}
      </View>

      <Text className="mb-3 ml-2 text-lg font-bold text-white">Monthly Breakdown</Text>
      {monthlyTrend.slice().reverse().map((m, i) => (
        <Animated.View 
          key={i}
          entering={FadeInDown.delay(i * 100)}
          className="flex-row justify-between items-center p-4 bg-[#112240] rounded-xl mb-2 border border-white/5"
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-[#0A192F] rounded-full items-center justify-center mr-3">
              <Calendar size={18} color="#8892B0" />
            </View>
            <View>
              <Text className="font-bold text-white">{m.month}</Text>
              <Text className="text-[#8892B0] text-xs">Net Flow</Text>
            </View>
          </View>
          <View className="items-end">
            <Text className={`font-bold text-base ${m.net >= 0 ? 'text-[#64FFDA]' : 'text-[#F472B6]'}`}>
              {m.net >= 0 ? '+' : ''}${m.net.toLocaleString()}
            </Text>
            <View className="flex-row gap-2">
              <Text className="text-[#64FFDA] text-[10px]">In: ${m.income.toLocaleString()}</Text>
              <Text className="text-[#F472B6] text-[10px]">Out: ${m.expense.toLocaleString()}</Text>
            </View>
          </View>
        </Animated.View>
      ))}
    </Animated.View>
  );

  // ============================================================================
  // 🟢 MAIN RENDER
  // ============================================================================

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-[#0A192F] justify-center items-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text className="text-[#8892B0] mt-4 font-medium tracking-wide">Crunching Numbers...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-[#0A192F] justify-center items-center p-6">
        <Text className="text-[#F472B6] text-lg font-bold mb-2">Oops!</Text>
        <Text className="text-[#8892B0] text-center mb-4">{error}</Text>
        <TouchableOpacity onPress={generateReport} className="bg-[#64FFDA] px-6 py-3 rounded-full">
          <Text className="text-[#0A192F] font-bold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-[#0A192F]"
      contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          tintColor={COLORS.primary} 
          colors={[COLORS.primary]} 
        />
      }
    >
      {/* --- HEADER SECTION --- */}
      <View className="flex-row items-center justify-between mt-2 mb-8">
        <View>
          <Text className="text-3xl font-bold tracking-tight text-white">Analytics</Text>
          <Text className="text-[#8892B0] text-sm mt-1">Financial health overview</Text>
        </View>
        <View className="flex-row gap-2">
          {/* Time Range Filter (Mocked for UI completeness) */}
          <TouchableOpacity 
            onPress={() => setTimeRange(timeRange === '30d' ? '90d' : '30d')}
            className="w-10 h-10 bg-[#112240] rounded-full items-center justify-center border border-white/10"
          >
            <Filter size={18} color="#8892B0" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={exportToCSV} 
            className="w-10 h-10 bg-[#64FFDA] rounded-full items-center justify-center shadow-lg shadow-[#64FFDA]/20"
          >
            <Download size={20} color="#0A192F" />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- KPI CARDS --- */}
      <View className="flex-row gap-3 mb-8">
        {/* Income Card */}
        <Animated.View entering={FadeIn.delay(100)} className="flex-1 bg-[#112240] p-4 rounded-3xl border border-white/5 shadow-sm">
          <View className="flex-row items-center justify-between mb-2">
            <View className="w-8 h-8 rounded-full bg-[#64FFDA]/10 items-center justify-center">
              <ArrowUpRight size={16} color={COLORS.primary} />
            </View>
            <Text className="text-[#8892B0] text-[10px] font-bold uppercase">Income</Text>
          </View>
          <Text className="text-lg font-bold text-white" numberOfLines={1}>
            ${totalIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </Text>
        </Animated.View>

        {/* Expense Card */}
        <Animated.View entering={FadeIn.delay(200)} className="flex-1 bg-[#112240] p-4 rounded-3xl border border-white/5 shadow-sm">
          <View className="flex-row items-center justify-between mb-2">
            <View className="w-8 h-8 rounded-full bg-[#F472B6]/10 items-center justify-center">
              <ArrowDownRight size={16} color={COLORS.secondary} />
            </View>
            <Text className="text-[#8892B0] text-[10px] font-bold uppercase">Spent</Text>
          </View>
          <Text className="text-lg font-bold text-white" numberOfLines={1}>
            ${totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </Text>
        </Animated.View>

        {/* Net Card */}
        <Animated.View entering={FadeIn.delay(300)} className="flex-1 bg-[#112240] p-4 rounded-3xl border border-white/5 shadow-sm">
          <View className="flex-row items-center justify-between mb-2">
            <View className="w-8 h-8 rounded-full bg-[#FBBF24]/10 items-center justify-center">
              <PiggyBank size={16} color={COLORS.warning} />
            </View>
            <Text className="text-[#8892B0] text-[10px] font-bold uppercase">Net</Text>
          </View>
          <Text className={`text-lg font-bold ${totalIncome - totalSpent >= 0 ? 'text-[#64FFDA]' : 'text-[#F472B6]'}`} numberOfLines={1}>
            ${(totalIncome - totalSpent).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </Text>
        </Animated.View>
      </View>

      {/* --- TAB NAVIGATION --- */}
      <View className="flex-row bg-[#112240] p-1.5 rounded-2xl mb-6 border border-white/5">
        {(['spending', 'tax', 'trends'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setActiveTab(tab);
            }}
            className={`flex-1 py-3 rounded-xl items-center justify-center ${
              activeTab === tab ? 'bg-[#64FFDA] shadow-sm' : 'bg-transparent'
            }`}
          >
            <Text
              className={`font-bold text-xs uppercase tracking-wide ${
                activeTab === tab ? 'text-[#0A192F]' : 'text-[#8892B0]'
              }`}
            >
              {tab === 'tax' ? 'Tax Est.' : tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* --- TAB CONTENT RENDER --- */}
      {activeTab === 'spending' && renderSpendingTab()}
      {activeTab === 'tax' && renderTaxTab()}
      {activeTab === 'trends' && renderTrendsTab()}

    </ScrollView>
  );
}