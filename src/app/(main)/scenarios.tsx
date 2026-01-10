import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-gifted-charts';
import {
  GitBranch,
  Save,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowLeft,
  Layers,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

// --- TITAN ARCHITECTURE IMPORTS ---
import { useAuth } from '../../shared/context/AuthContext';
import { ScenarioService } from '../../services/scenarioService';
import { AnalysisService } from '../../services/analysisService';
import { GlassCard } from '../../shared/components/GlassCard';
import { NFSlider } from '../../shared/components/Slider'; // Corrected Path

/**
 * @component ScenarioLab
 * @description Titan-4 Simulation Engine.
 * Fixes the findDOMNode crash by using the Universal NFSlider.
 */
export default function ScenarioLab() {
  const router = useRouter();
  const { user } = useAuth();
  const screenWidth = Dimensions.get('window').width;

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [baseline, setBaseline] = useState<any>(null);

  const [revenueGrowth, setRevenueGrowth] = useState(10);
  const [expenseMultiplier, setExpenseMultiplier] = useState(1.0);
  const [simulationTrend, setSimulationTrend] = useState<any[]>([]);

  const hasAccess =
    user && ['admin', 'cpa', 'premium', 'premium_member'].includes(user.role);

  const runSimulation = useCallback(
    (startBalance: number, growth: number, burn: number) => {
      const trend = [];
      let rolling = startBalance;
      const monthlyIncome = 5000;
      const monthlyExpense = 3500;

      for (let i = 0; i <= 6; i++) {
        trend.push({
          value: Number(rolling.toFixed(0)),
          label: i === 0 ? 'Now' : `${i}M`,
          dataPointText:
            i === 6 ? `$${Math.round(rolling / 1000)}k` : undefined,
        });
        rolling += monthlyIncome * growth - monthlyExpense * burn;
      }
      setSimulationTrend(trend);
    },
    []
  );

  const initializeLab = useCallback(async () => {
    if (!user) return;
    if (!hasAccess) {
      Alert.alert(
        'Premium Feature',
        'Upgrade to Titan-4 to access the Scenario Lab.'
      );
      router.replace('/(main)/');
      return;
    }

    try {
      const forecast = await AnalysisService.generateCashFlowForecast(user.id);
      const startValue = forecast[0]?.value || 15000;
      setBaseline({ value: startValue });
      runSimulation(startValue, 1.1, 1.0);
    } catch (e) {
      console.error('[ScenarioLab] Init Error:', e);
    } finally {
      setLoading(false);
    }
  }, [user, hasAccess, runSimulation, router]);

  useEffect(() => {
    initializeLab();
  }, [initializeLab]);

  const handleSliderChange = (type: 'growth' | 'burn', val: number) => {
    Haptics.selectionAsync();
    const currentGrowth = type === 'growth' ? val : revenueGrowth;
    const currentBurn = type === 'burn' ? val : expenseMultiplier;

    if (type === 'growth') setRevenueGrowth(val);
    if (type === 'burn') setExpenseMultiplier(val);

    runSimulation(baseline?.value || 0, 1 + currentGrowth / 100, currentBurn);
  };

  const handleSaveScenario = async () => {
    if (!user) return;
    setIsSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      await ScenarioService.createScenario(user.id, {
        name: `Simulation: ${revenueGrowth}% Growth`,
        drivers: [
          {
            name: 'Revenue Growth',
            key: 'rev_growth',
            value: revenueGrowth,
            unit: 'percent',
          },
          {
            name: 'Expense Multiplier',
            key: 'exp_mult',
            value: expenseMultiplier,
            unit: 'count',
          },
        ],
      });
      Alert.alert('Universe Created', 'Scenario synced to your cloud profile.');
    } catch (e) {
      Alert.alert('Sync Failed', 'Could not persist scenario.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <View className="flex-1 bg-[#020617] items-center justify-center">
        <ActivityIndicator color="#22d3ee" />
      </View>
    );

  return (
    <SafeAreaView className="flex-1 bg-[#020617]">
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 border rounded-full bg-white/5 border-white/10"
        >
          <ArrowLeft size={20} color="#94a3b8" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-white font-black text-xs uppercase tracking-[3px]">
            Titan 4 Engine
          </Text>
          <Text className="text-cyan-400 text-[10px] font-bold">
            Scenario Lab v2.1
          </Text>
        </View>
        <TouchableOpacity className="p-2 border rounded-full bg-white/5 border-white/10">
          <Layers size={20} color="#22d3ee" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* CHART CARD */}
        <Animated.View entering={FadeInDown.duration(800)} className="mb-8">
          <BlurView
            intensity={30}
            tint="dark"
            className="rounded-[40px] overflow-hidden border border-white/10 p-6"
          >
            <View className="flex-row justify-between mb-8">
              <View>
                <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  Ending Position (6M)
                </Text>
                <Text className="mt-1 text-4xl font-black text-white">
                  ${simulationTrend[6]?.value.toLocaleString()}
                </Text>
              </View>
              <View className="self-start px-4 py-2 border bg-cyan-500/10 rounded-2xl border-cyan-500/20">
                <Text className="text-xs font-black text-cyan-400">
                  +{revenueGrowth}% VELOCITY
                </Text>
              </View>
            </View>

            <LineChart
              data={simulationTrend}
              height={180}
              width={screenWidth - 100}
              color="#22d3ee"
              thickness={4}
              startFillColor="rgba(34, 211, 238, 0.3)"
              endFillColor="rgba(34, 211, 238, 0.01)"
              areaChart
              curved
              hideDataPoints
              hideRules
              yAxisThickness={0}
              xAxisThickness={0}
              yAxisTextStyle={{ color: '#475569', fontSize: 10 }}
              xAxisLabelTextStyle={{ color: '#475569', fontSize: 10 }}
            />
          </BlurView>
        </Animated.View>

        <Text className="mb-6 text-lg font-black text-white">
          Simulation Levers
        </Text>

        <View className="gap-4 mb-10">
          {/* REVENUE GROWTH */}
          <GlassCard className="p-5">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-3">
                <TrendingUp size={20} color="#22d3ee" />
                <Text className="font-bold text-white">Revenue Growth</Text>
              </View>
              <Text className="font-black text-cyan-400">{revenueGrowth}%</Text>
            </View>
            <NFSlider
              minimumValue={-50}
              maximumValue={200}
              step={1}
              value={revenueGrowth}
              onValueChange={(v) => handleSliderChange('growth', v)}
              minimumTrackTintColor="#22d3ee"
              maximumTrackTintColor="#1e293b"
              thumbTintColor="#ffffff"
            />
          </GlassCard>

          {/* BURN MULTIPLIER */}
          <GlassCard className="p-5">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-3">
                <TrendingDown size={20} color="#f43f5e" />
                <Text className="font-bold text-white">Burn Multiplier</Text>
              </View>
              <Text className="font-black text-rose-400">
                {expenseMultiplier.toFixed(1)}x
              </Text>
            </View>
            <NFSlider
              minimumValue={0.5}
              maximumValue={2.5}
              step={0.1}
              value={expenseMultiplier}
              onValueChange={(v) => handleSliderChange('burn', v)}
              minimumTrackTintColor="#f43f5e"
              maximumTrackTintColor="#1e293b"
              thumbTintColor="#ffffff"
            />
          </GlassCard>
        </View>

        {/* ACTIONS */}
        <View className="flex-row gap-4 mb-12">
          <TouchableOpacity
            onPress={() => {
              setRevenueGrowth(10);
              setExpenseMultiplier(1.0);
              runSimulation(baseline?.value || 0, 1.1, 1.0);
            }}
            className="items-center justify-center flex-1 h-16 border bg-white/5 rounded-3xl border-white/10"
          >
            <RotateCcw size={20} color="#94a3b8" />
            <Text className="text-slate-400 font-bold mt-1 text-[10px] uppercase">
              Reset
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSaveScenario}
            disabled={isSaving}
            className="flex-[2] bg-cyan-500 h-16 rounded-3xl items-center justify-center flex-row gap-3"
          >
            {isSaving ? (
              <ActivityIndicator color="#020617" />
            ) : (
              <>
                <Sparkles size={20} color="#020617" />
                <Text className="font-black tracking-widest uppercase text-slate-950">
                  Sync Universe
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
