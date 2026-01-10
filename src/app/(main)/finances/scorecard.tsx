import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ShieldCheck,
  TrendingUp,
  Zap,
  Info,
  ArrowLeft,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

// --- TITAN SERVICE ARCHITECTURE ---
import { useAuth } from '@/shared/context/AuthContext';
import { FinancialBrain } from '@/services/financialBrain';
import { AnalysisService } from '@/services/analysisService';
import { TaxAgentService } from '@/services/taxAgentService';

interface KPI {
  label: string;
  value: string;
  status: 'healthy' | 'warning' | 'critical';
  benchmark: string;
  description: string;
  icon: any;
}

export default function FinancialScorecard() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [healthScore, setHealthScore] = useState(0);
  const [taxSavings, setTaxSavings] = useState({ total: 0, estimated: 0 });
  const [aiInsight, setAiInsight] = useState<string>('');

  const syncExecutiveData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      // 1. Concurrent execution of heavy analytical logic
      const [health, safeSpend, savings, advisorInsight] = await Promise.all([
        FinancialBrain.calculateHealthMetrics(user.id),
        AnalysisService.calculateSafeToSpend(user.id),
        TaxAgentService.getLiveSavings(user.id),
        FinancialBrain.askAdvisor(
          user.id,
          'Perform a SWOT analysis of my current liquidity and tax position.'
        ),
      ]);

      setHealthScore(health.score);
      setTaxSavings({
        total: savings.totalDeductions,
        estimated: savings.estimatedTaxSavings,
      });
      setAiInsight(advisorInsight);

      // 2. Mapping Service Intelligence to KPIs
      const computedKPIs: KPI[] = [
        {
          label: 'Cash Runway',
          value: `${(safeSpend.daysUntilPayday / 30).toFixed(1)} Months`,
          status:
            safeSpend.daysUntilPayday > 180
              ? 'healthy'
              : safeSpend.daysUntilPayday > 90
              ? 'warning'
              : 'critical',
          benchmark: '> 6 Months',
          description:
            'Projected liquidity based on weighted burn rate analysis.',
          icon: ShieldCheck,
        },
        {
          label: 'Daily Safe-Limit',
          value: `$${safeSpend.safeToSpend.toFixed(2)}`,
          status: safeSpend.risk_level === 'low' ? 'healthy' : 'warning',
          benchmark: 'Sustainable Cap',
          description:
            'Automated spending ceiling to preserve fixed commitments.',
          icon: Zap,
        },
        {
          label: 'Tax Recovery',
          value: `$${savings.estimatedTaxSavings.toFixed(0)}`,
          status: 'healthy',
          benchmark: 'Audit-Defended',
          description:
            'Real-time estimated tax return via AI-verified deductions.',
          icon: TrendingUp,
        },
      ];

      setKpis(computedKPIs);
    } catch (e) {
      console.error('[Scorecard] Critical Sync Error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      syncExecutiveData();
    }, [syncExecutiveData])
  );

  const getStatusColor = (status: string) => {
    if (status === 'healthy') return '#22d3ee'; // Cyan (North Theme)
    if (status === 'warning') return '#f59e0b'; // Amber
    return '#f43f5e'; // Rose
  };

  return (
    <SafeAreaView className="flex-1 bg-[#020617]" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Premium Navigation Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 rounded-full bg-white/5"
        >
          <ArrowLeft size={20} color="#94a3b8" />
        </TouchableOpacity>
        <Text className="text-white font-black text-xs uppercase tracking-[3px]">
          Financial Scorecard
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={syncExecutiveData}
            tintColor="#22d3ee"
          />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* HERO: The Wealth Pulse */}
        <LinearGradient
          colors={['#083344', '#020617']}
          className="px-6 pt-12 pb-16 rounded-b-[48px]"
        >
          <Animated.View
            entering={FadeIn.duration(800)}
            className="items-center"
          >
            <View className="items-center justify-center border-2 rounded-full w-44 h-44 border-white/5">
              <View className="absolute border-4 rounded-full inset-2 border-cyan-500/20" />
              <Text className="font-black text-white text-7xl">
                {healthScore}
              </Text>
              <Text className="text-cyan-400 text-[10px] font-black uppercase tracking-[3px]">
                Vitality Index
              </Text>
            </View>
            <Text className="px-12 mt-8 text-sm font-medium leading-5 text-center text-slate-400">
              Your capital velocity is{' '}
              {healthScore > 75 ? 'optimized' : 'constrained'}.
              {healthScore > 75
                ? ' High potential for reinvestment.'
                : ' Focus on runway extension and tax shielding.'}
            </Text>
          </Animated.View>
        </LinearGradient>

        <View className="px-6 -mt-10">
          {/* AI CFO INSIGHT: Glassmorphism Card */}
          <BlurView
            intensity={30}
            tint="dark"
            className="p-6 rounded-[32px] border border-white/10 overflow-hidden mb-8"
          >
            <View className="flex-row items-center gap-2 mb-4">
              <Info size={16} color="#22d3ee" />
              <Text className="text-cyan-400 font-black text-[10px] uppercase tracking-widest">
                Titan-2 Advisory Insight
              </Text>
            </View>
            <Text className="text-sm italic leading-6 text-slate-200">
              "{aiInsight}"
            </Text>
          </BlurView>

          {/* KPI PERFORMANCE GRID */}
          <Text className="mb-5 ml-1 text-lg font-black text-white">
            Performance Indicators
          </Text>
          {loading ? (
            <ActivityIndicator color="#22d3ee" className="py-20" />
          ) : (
            <View className="gap-4">
              {kpis.map((kpi, idx) => (
                <Animated.View
                  key={idx}
                  entering={FadeInDown.delay(idx * 150).springify()}
                  className="bg-white/5 rounded-[28px] p-6 border border-white/10"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-row items-center gap-4">
                      <View className="p-3 rounded-2xl bg-white/5">
                        <kpi.icon
                          size={22}
                          color={getStatusColor(kpi.status)}
                        />
                      </View>
                      <View>
                        <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                          {kpi.label}
                        </Text>
                        <Text className="mt-1 text-3xl font-black text-white">
                          {kpi.value}
                        </Text>
                      </View>
                    </View>
                    <View className="bg-slate-900/50 px-3 py-1.5 rounded-xl border border-white/5">
                      <Text className="text-[10px] text-slate-400 font-black uppercase">
                        {kpi.benchmark}
                      </Text>
                    </View>
                  </View>
                  <Text className="mt-5 text-xs font-medium leading-5 text-slate-500">
                    {kpi.description}
                  </Text>
                </Animated.View>
              ))}
            </View>
          )}

          {/* TAX RECOVERY ACTION CALL */}
          <TouchableOpacity
            onPress={() => router.push('/(main)/cpa/tax-reports')}
            activeOpacity={0.8}
            className="mt-8 bg-cyan-500 p-6 rounded-[32px] flex-row items-center justify-between"
          >
            <View>
              <Text className="text-xl font-black text-slate-950">
                Tax Shield Active
              </Text>
              <Text className="text-xs font-bold text-slate-900 opacity-70">
                Secured ${taxSavings.estimated} in deductions
              </Text>
            </View>
            <View className="p-3 rounded-full bg-slate-950/20">
              <TrendingUp size={24} color="#020617" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
