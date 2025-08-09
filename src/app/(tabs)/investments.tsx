import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { VictoryLine, VictoryChart } from 'victory-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeProvider';

interface Investment {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  currentPrice: number;
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  chartData: { x: number; y: number }[];
}

export default function InvestmentsScreen() {
  const { colors, isDark } = useTheme();
  const [balanceVisible, setBalanceVisible] = useState(true);

  const styles = createStyles(colors, isDark);

  const portfolioValue = 45750.25;
  const portfolioChange = 1250.75;
  const portfolioChangePercent = 2.81;

  const investments: Investment[] = [
    {
      id: '1',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      shares: 25,
      currentPrice: 185.5,
      totalValue: 4637.5,
      dayChange: 125.25,
      dayChangePercent: 2.77,
      chartData: [
        { x: 1, y: 180 },
        { x: 2, y: 182 },
        { x: 3, y: 179 },
        { x: 4, y: 185 },
        { x: 5, y: 188 },
        { x: 6, y: 185.5 },
      ],
    },
    {
      id: '2',
      symbol: 'MSFT',
      name: 'Microsoft Corp.',
      shares: 15,
      currentPrice: 420.75,
      totalValue: 6311.25,
      dayChange: -45.5,
      dayChangePercent: -0.72,
      chartData: [
        { x: 1, y: 425 },
        { x: 2, y: 428 },
        { x: 3, y: 422 },
        { x: 4, y: 418 },
        { x: 5, y: 421 },
        { x: 6, y: 420.75 },
      ],
    },
    {
      id: '3',
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      shares: 10,
      currentPrice: 142.8,
      totalValue: 1428.0,
      dayChange: 8.2,
      dayChangePercent: 0.58,
      chartData: [
        { x: 1, y: 140 },
        { x: 2, y: 141 },
        { x: 3, y: 139 },
        { x: 4, y: 143 },
        { x: 5, y: 144 },
        { x: 6, y: 142.8 },
      ],
    },
    {
      id: '4',
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      shares: 8,
      currentPrice: 245.3,
      totalValue: 1962.4,
      dayChange: -12.8,
      dayChangePercent: -0.52,
      chartData: [
        { x: 1, y: 250 },
        { x: 2, y: 248 },
        { x: 3, y: 252 },
        { x: 4, y: 247 },
        { x: 5, y: 246 },
        { x: 6, y: 245.3 },
      ],
    },
  ];

  const renderInvestment = (investment: Investment, index: number) => {
    const isPositive = investment.dayChange >= 0;
    const changeColor = isPositive ? colors.success : colors.error;

    return (
      <Animated.View
        key={investment.id}
        entering={FadeInUp.delay(400 + index * 50).springify()}
      >
        <TouchableOpacity style={styles.investmentItem}>
          <View style={styles.investmentLeft}>
            <View style={styles.symbolContainer}>
              <Text style={styles.symbolText}>{investment.symbol}</Text>
            </View>
            <View style={styles.investmentInfo}>
              <Text style={styles.investmentName}>{investment.name}</Text>
              <Text style={styles.investmentShares}>
                {investment.shares} shares • ${investment.currentPrice}
              </Text>
            </View>
          </View>

          <View style={styles.investmentChart}>
            <VictoryChart padding={0} width={60} height={30}>
              <VictoryLine
                data={investment.chartData}
                style={{ data: { stroke: changeColor, strokeWidth: 2 } }}
                interpolation="natural"
              />
            </VictoryChart>
          </View>

          <View style={styles.investmentRight}>
            <Text style={styles.investmentValue}>
              ${investment.totalValue.toLocaleString()}
            </Text>
            <View style={styles.changeContainer}>
              {isPositive ? (
                <TrendingUp size={12} color={changeColor} />
              ) : (
                <TrendingDown size={12} color={changeColor} />
              )}
              <Text style={[styles.changeText, { color: changeColor }]}>
                {isPositive ? '+' : ''}$
                {Math.abs(investment.dayChange).toFixed(2)} (
                {investment.dayChangePercent.toFixed(2)}%)
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Investments</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color={isDark ? colors.background : colors.surface} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          entering={FadeInUp.delay(100).springify()}
          style={styles.portfolioCard}
        >
          <View style={styles.portfolioHeader}>
            <Text style={styles.portfolioTitle}>Portfolio Value</Text>
            <TouchableOpacity
              onPress={() => setBalanceVisible(!balanceVisible)}
            >
              {balanceVisible ? (
                <Eye size={20} color={colors.textSecondary} />
              ) : (
                <EyeOff size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.portfolioValue}>
            {balanceVisible ? `$${portfolioValue.toLocaleString()}` : '••••••'}
          </Text>

          <View style={styles.portfolioChange}>
            <TrendingUp size={16} color={colors.success} />
            <Text style={styles.portfolioChangeText}>
              +${portfolioChange.toFixed(2)} (+{portfolioChangePercent}%) today
            </Text>
          </View>
        </Animated.View>

        <View style={styles.holdingsSection}>
          <Text style={styles.sectionTitle}>Holdings</Text>
          <View style={styles.holdingsList}>
            {investments.map((investment, index) =>
              renderInvestment(investment, index)
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: { background: string; surface: string; surfaceVariant: string; text: string; textSecondary: string; border: string; primary: string; success: string; warning?: string; error?: string; tabBarActive?: string; tabBarInactive?: string; }, isDark: boolean) =>
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
    addButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 100, paddingTop: 20 },
    portfolioCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      marginHorizontal: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    portfolioHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    portfolioTitle: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    portfolioValue: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 8,
    },
    portfolioChange: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    portfolioChangeText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.success,
    },
    holdingsSection: { paddingHorizontal: 20, paddingTop: 24 },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    holdingsList: { gap: 12 },
    investmentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    investmentLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    symbolContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    symbolText: { fontSize: 14, fontWeight: '700', color: colors.primary },
    investmentInfo: { flex: 1 },
    investmentName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    investmentShares: { fontSize: 12, color: colors.textSecondary },
    investmentChart: { width: 60, height: 30, marginHorizontal: 12 },
    investmentRight: { alignItems: 'flex-end', flexBasis: 110 },
    investmentValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    changeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flexWrap: 'nowrap',
    },
    changeText: { fontSize: 12, fontWeight: '600' },
  });
