import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Sparkles,
  ArrowRight,
  Wallet,
  Receipt,
  CreditCard,
  Activity,
  Zap,
} from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../shared/context/AuthContext';
import { FinancialBrain } from '../../../services/financialBrain';
import { dataService } from '../../../services/dataService';
import { generateFinancialForecast } from '../../../lib/forecasting';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-gifted-charts';
import { BlurView } from 'expo-blur';
import { FlashList } from '@shopify/flash-list';
import dayjs from 'dayjs';

/**
 * @component FinanceOverview
 * @description The "NorthFinance" Command Center.
 * Combines Titan-2 Predictive Intelligence with a High-Performance Glass UI.
 */
export default function FinanceOverview() {
  const { user } = useAuth();
  const router = useRouter();

  const [metrics, setMetrics] = useState({ income: 0, expense: 0, balance: 0 });
  const [health, setHealth] = useState<any>(null);
  const [insight, setInsight] = useState(
    'Synchronizing with Financial Brain...'
  );
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [recentTxs, setRecentTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!user) return;
    try {
      const [summary, healthData, txs] = await Promise.all([
        dataService.getFinancialSummary(user.id),
        FinancialBrain.calculateHealthMetrics(user.id),
        dataService.getTransactions(user.id, 10),
      ]);

      setMetrics(summary);
      setHealth(healthData);
      setRecentTxs(txs);

      // Titan 2: AI Forecasting Logic
      if (txs.length > 2) {
        const historical = txs
          .map((t) => ({
            date: new Date(t.date),
            value: Math.abs(Number(t.amount)),
          }))
          .sort((a, b) => a.date.getTime() - b.date.getTime());

        const { forecast } = generateFinancialForecast(historical, 3);
        setForecastData(
          forecast.map((f) => ({ value: f.value, label: f.label }))
        );

        const aiText = await FinancialBrain.askAdvisor(
          user.id,
          'Analyze my velocity and safety buffer.'
        );
        setInsight(aiText);
      }
    } catch (e) {
      console.error('[FinanceDashboard] Sync Error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user])
  );

  const ActionButton = ({ title, subtitle, icon: Icon, color, route }: any) => (
    <TouchableOpacity
      onPress={() => router.push(route)}
      activeOpacity={0.7}
      className="mb-3 overflow-hidden border rounded-2xl border-white/10"
    >
      <BlurView
        intensity={20}
        tint="dark"
        className="flex-row items-center justify-between p-4"
      >
        <View className="flex-row items-center gap-4">
          <View
            style={{ backgroundColor: `${color}20` }}
            className="p-3 rounded-xl"
          >
            <Icon size={20} color={color} />
          </View>
          <View>
            <Text className="text-base font-bold text-white">{title}</Text>
            <Text className="text-xs text-slate-400">{subtitle}</Text>
          </View>
        </View>
        <ArrowRight size={18} color="#475569" />
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#020617]">
      <StatusBar barStyle="light-content" />

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadData}
            tintColor="#22d3ee"
          />
        }
      >
        {/* HEADER & HEALTH SCORE */}
        <View className="flex-row items-center justify-between mb-8">
          <View>
            <Text className="text-xs font-bold tracking-widest uppercase text-slate-500">
              Financial OS
            </Text>
            <Text className="text-3xl font-black text-white">Dashboard</Text>
          </View>
          <View className="items-end">
            <View className="px-3 py-1 border rounded-full bg-cyan-500/10 border-cyan-500/20">
              <Text className="text-xs font-bold text-cyan-400">
                SCORE: {health?.score || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* AI INSIGHT CARD (Glassmorphic) */}
        <View className="mb-8 overflow-hidden border rounded-3xl border-white/10">
          <LinearGradient
            colors={['rgba(34,211,238,0.15)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <BlurView intensity={40} tint="dark" className="p-5">
              <View className="flex-row items-center gap-2 mb-3">
                <Sparkles size={16} color="#22d3ee" />
                <Text className="text-cyan-400 font-black text-[10px] uppercase tracking-[2px]">
                  Titan-2 Intelligence
                </Text>
              </View>
              <Text className="text-sm font-medium leading-6 text-slate-200">
                "{insight}"
              </Text>
            </BlurView>
          </LinearGradient>
        </View>

        {/* METRICS GRID */}
        <View className="flex-row gap-3 mb-8">
          {[
            {
              label: 'Inflow',
              val: metrics.income,
              icon: TrendingUp,
              col: '#4ade80',
            },
            {
              label: 'Outflow',
              val: metrics.expense,
              icon: TrendingDown,
              col: '#f87171',
            },
            { label: 'Net', val: metrics.balance, icon: Zap, col: '#22d3ee' },
          ].map((item, i) => (
            <View
              key={i}
              className="flex-1 p-4 border bg-white/5 rounded-2xl border-white/5"
            >
              <item.icon size={16} color={item.col} />
              <Text className="text-slate-500 text-[10px] font-bold uppercase mt-2">
                {item.label}
              </Text>
              <Text className="mt-1 text-lg font-black text-white">
                ${item.val.toFixed(0)}
              </Text>
            </View>
          ))}
        </View>

        {/* TITAN-2 PROJECTION CHART */}
        {forecastData.length > 0 && (
          <View className="p-5 mb-8 border bg-white/5 rounded-3xl border-white/5">
            <Text className="mb-1 text-lg font-bold text-white">
              Cash Flow Projection
            </Text>
            <Text className="mb-6 text-xs text-slate-500">
              AI-driven 90-day trajectory
            </Text>
            <LineChart
              data={forecastData}
              color="#22d3ee"
              thickness={4}
              hideDataPoints
              areaChart
              startFillColor="rgba(34, 211, 238, 0.3)"
              endFillColor="transparent"
              height={150}
              curved
              spacing={100}
              initialSpacing={0}
              xAxisColor="transparent"
              yAxisColor="transparent"
              yAxisTextStyle={{ color: '#475569', fontSize: 10 }}
            />
          </View>
        )}

        {/* QUICK ACTIONS */}
        <Text className="text-white/50 text-[10px] font-black uppercase tracking-[2px] mb-4 ml-1">
          Terminal Operations
        </Text>
        <ActionButton
          title="Scorecard"
          subtitle="Burn rate & Runway"
          icon={Activity}
          color="#10b981"
          route="/(main)/finances/scorecard"
        />
        <ActionButton
          title="Ledger"
          subtitle="Manage transactions"
          icon={Wallet}
          color="#3b82f6"
          route="/(main)/finances/transactions"
        />
        <ActionButton
          title="OCR Scan"
          subtitle="AI Receipt extraction"
          icon={Receipt}
          color="#a855f7"
          route="/(main)/scan"
        />
        <ActionButton
          title="Subscriptions"
          subtitle="Recurring billing"
          icon={CreditCard}
          color="#f59e0b"
          route="/(main)/finances/subscriptions"
        />
      </ScrollView>
    </View>
  );
}
