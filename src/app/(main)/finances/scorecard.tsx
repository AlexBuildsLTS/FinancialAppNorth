import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-gifted-charts';

import { supabase } from '@/lib/supabase';
import { GlassCard } from '@/shared/components/GlassCard';

// --- Types ---
interface KPI {
  label: string;
  value: string;
  status: 'healthy' | 'warning' | 'critical';
  benchmark: string;
  description: string;
}

export default function FinancialScorecard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [healthScore, setHealthScore] = useState(0);

  useEffect(() => {
    calculateFinancialHealth();
  }, []);

  const calculateFinancialHealth = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Data (Last 30 Days)
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', new Date(new Date().setDate(new Date().getDate() - 30)).toISOString());

      const { data: accounts } = await supabase
        .from('accounts')
        .select('balance')
        .eq('user_id', user.id);

      // 2. Compute Raw Numbers
      const totalCash = accounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0;
      
      const income = transactions
        ?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0) || 0;

      const expense = transactions
        ?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0) || 0;

      const netIncome = income - expense;

      // 3. Calculate Ratios (The "Tools & Concepts")
      
      // A. Profit Margin (Target: > 20%)
      const profitMargin = income > 0 ? (netIncome / income) * 100 : 0;
      let marginStatus: KPI['status'] = 'critical';
      if (profitMargin > 20) marginStatus = 'healthy';
      else if (profitMargin > 0) marginStatus = 'warning';

      // B. Burn Rate & Runway (Target: > 6 months)
      // Assuming 'expense' is monthly burn for this calculation
      const burnRate = expense; 
      const runway = burnRate > 0 ? totalCash / burnRate : 99; // 99 months if no spend
      let runwayStatus: KPI['status'] = 'critical';
      if (runway > 6) runwayStatus = 'healthy';
      else if (runway > 3) runwayStatus = 'warning';

      // C. Savings Rate (Target: > 15%)
      const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
      
      // 4. Construct KPIs
      const computedKPIs: KPI[] = [
        {
          label: 'Net Profit Margin',
          value: `${profitMargin.toFixed(1)}%`,
          status: marginStatus,
          benchmark: '> 20%',
          description: 'Percentage of revenue kept as profit.'
        },
        {
          label: 'Runway',
          value: `${runway.toFixed(1)} Months`,
          status: runwayStatus,
          benchmark: '> 6 Months',
          description: 'Time until cash runs out at current spend.'
        },
        {
          label: 'Monthly Burn',
          value: `$${expense.toLocaleString()}`,
          status: expense > 5000 ? 'warning' : 'healthy', // Example static benchmark
          benchmark: '< $5k',
          description: 'Total cash spent in the last 30 days.'
        }
      ];

      setKpis(computedKPIs);
      
      // Simple Average for "Total Score" (0-100)
      const score = (
        (profitMargin > 20 ? 40 : profitMargin > 0 ? 20 : 0) +
        (runway > 6 ? 40 : runway > 3 ? 20 : 0) + 
        20 // Base points for showing up
      );
      setHealthScore(Math.min(100, score));

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#10B981'; // Emerald
      case 'warning': return '#F59E0B'; // Amber
      case 'critical': return '#EF4444'; // Red
      default: return '#64748B';
    }
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      <Stack.Screen options={{ title: "Financial Health", headerTransparent: true, headerTintColor: '#fff' }} />
      
      {/* Hero Section: The Score */}
      <LinearGradient
        colors={['#4F46E5', '#312E81']}
        className="px-6 pt-32 pb-10 shadow-lg rounded-b-3xl"
      >
        <View className="items-center">
          <Text className="text-xs font-medium tracking-widest uppercase text-white/80">
            Overall Health Score
          </Text>
          <Text className="mt-2 text-6xl font-bold text-white">
            {healthScore}
          </Text>
          <View className="px-4 py-1 mt-2 rounded-full bg-white/20">
             <Text className="text-sm font-medium text-white">
               {healthScore > 80 ? 'Excellent' : healthScore > 50 ? 'Needs Work' : 'Critical'}
             </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16 }} className="-mt-6">
        {loading ? (
           <ActivityIndicator size="large" color="#4F46E5" className="mt-10" />
        ) : (
          <>
            <Text className="mb-4 ml-1 text-xl font-bold text-slate-900 dark:text-white">
              Key Performance Indicators
            </Text>

            {/* KPI Cards */}
            <View className="gap-4">
              {kpis.map((kpi, index) => (
                <GlassCard key={index} className="p-4 border-l-4" style={{ borderLeftColor: getStatusColor(kpi.status) }}>
                  <View className="flex-row items-start justify-between">
                    <View>
                      <Text className="text-xs font-bold uppercase text-slate-500">{kpi.label}</Text>
                      <Text className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</Text>
                    </View>
                    <View className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">
                       <Text className="text-xs text-slate-500">Target: {kpi.benchmark}</Text>
                    </View>
                  </View>
                  <Text className="mt-2 text-xs text-slate-400">{kpi.description}</Text>
                </GlassCard>
              ))}
            </View>

            {/* Strategy Section */}
            <View className="mt-8 mb-20">
              <Text className="mb-4 ml-1 text-xl font-bold text-slate-900 dark:text-white">
                Strategic Insights
              </Text>
              <GlassCard className="p-5">
                 <View className="flex-row gap-3 mb-3">
                   <Ionicons name="bulb-outline" size={24} color="#F59E0B" />
                   <Text className="text-lg font-semibold text-slate-900 dark:text-white">AI Observation</Text>
                 </View>
                 <Text className="leading-6 text-slate-600 dark:text-slate-300">
                   Your burn rate is currently higher than your income growth. 
                   Consider auditing your **Subscription** category or increasing 
                   prices for your services to improve your Profit Margin to 25%.
                 </Text>
              </GlassCard>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}