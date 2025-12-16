import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, PiggyBank } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/shared/context/AuthContext';
import { getFinancialSummary, getFinancialHealthScore } from '@/services/dataService';
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
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [healthScore, setHealthScore] = useState(0);

  const calculateFinancialHealth = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      
      // Use unified data service
      const summary = await getFinancialSummary(user.id);
      const score = await getFinancialHealthScore(user.id);
      
      const income = summary.income;
      const expense = summary.expense;
      const balance = summary.balance;
      const netIncome = income - expense;

      // Calculate Ratios
      const profitMargin = income > 0 ? (netIncome / income) * 100 : 0;
      let marginStatus: KPI['status'] = 'critical';
      if (profitMargin > 20) marginStatus = 'healthy';
      else if (profitMargin > 0) marginStatus = 'warning';

      // Monthly burn rate (assuming expense is monthly)
      const monthlyBurn = expense;
      const runway = monthlyBurn > 0 ? balance / monthlyBurn : 99;
      let runwayStatus: KPI['status'] = 'critical';
      if (runway > 6) runwayStatus = 'healthy';
      else if (runway > 3) runwayStatus = 'warning';

      const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
      let savingsStatus: KPI['status'] = 'critical';
      if (savingsRate > 15) savingsStatus = 'healthy';
      else if (savingsRate > 5) savingsStatus = 'warning';
      
      // Construct KPIs
      const computedKPIs: KPI[] = [
        {
          label: 'Net Profit Margin',
          value: `${profitMargin.toFixed(1)}%`,
          status: marginStatus,
          benchmark: '> 20%',
          description: 'Percentage of revenue kept as profit.'
        },
        {
          label: 'Cash Runway',
          value: `${runway.toFixed(1)} Months`,
          status: runwayStatus,
          benchmark: '> 6 Months',
          description: 'Time until cash runs out at current spend rate.'
        },
        {
          label: 'Monthly Burn',
          value: `$${monthlyBurn.toLocaleString()}`,
          status: monthlyBurn > 5000 ? 'warning' : 'healthy',
          benchmark: '< $5k',
          description: 'Total cash spent in the last 30 days.'
        },
        {
          label: 'Savings Rate',
          value: `${savingsRate.toFixed(1)}%`,
          status: savingsStatus,
          benchmark: '> 15%',
          description: 'Percentage of income saved after expenses.'
        }
      ];

      setKpis(computedKPIs);
      setHealthScore(score);

    } catch (e) {
      console.error('Scorecard Error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    calculateFinancialHealth();
  }, [calculateFinancialHealth]);

  useFocusEffect(useCallback(() => {
    if (!loading) calculateFinancialHealth();
  }, [calculateFinancialHealth, loading]));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#10B981'; // Emerald
      case 'warning': return '#F59E0B'; // Amber
      case 'critical': return '#EF4444'; // Red
      default: return '#64748B';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <Stack.Screen 
        options={{ 
          title: "Financial Health Scorecard", 
          headerStyle: { backgroundColor: '#0A192F' },
          headerTintColor: '#fff'
        }} 
      />
      
      {/* Hero Section: The Score */}
      <LinearGradient
        colors={['#112240', '#0A192F']}
        className="px-6 pt-8 pb-10 shadow-lg"
      >
        <View className="items-center">
          <Text className="text-xs font-bold tracking-widest uppercase text-[#8892B0]">
            Overall Health Score
          </Text>
          <Text className="mt-2 text-6xl font-extrabold text-white">
            {healthScore}
          </Text>
          <View className={`px-4 py-2 mt-3 rounded-full ${
            healthScore > 80 ? 'bg-green-500/20 border border-green-500/30' :
            healthScore > 50 ? 'bg-yellow-500/20 border border-yellow-500/30' :
            'bg-red-500/20 border border-red-500/30'
          }`}>
             <Text className={`text-sm font-bold ${
               healthScore > 80 ? 'text-green-400' :
               healthScore > 50 ? 'text-yellow-400' :
               'text-red-400'
             }`}>
               {healthScore > 80 ? 'Excellent' : healthScore > 50 ? 'Needs Work' : 'Critical'}
             </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={{ padding: 24, paddingTop: 16 }} 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={calculateFinancialHealth} tintColor="#64FFDA" />}
      >
        {loading ? (
           <View className="items-center justify-center py-20">
             <ActivityIndicator size="large" color="#64FFDA" />
             <Text className="text-[#8892B0] mt-4">Calculating health metrics...</Text>
           </View>
        ) : (
          <>
            <Text className="mb-6 text-xl font-bold text-white">
              Key Performance Indicators
            </Text>

            {/* KPI Cards */}
            <View className="gap-4 mb-8">
              {kpis.map((kpi, index) => (
                <View 
                  key={index} 
                  className="bg-[#112240] p-5 rounded-2xl border border-white/5"
                  style={{ borderLeftWidth: 4, borderLeftColor: getStatusColor(kpi.status) }}
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-xs font-bold uppercase text-[#8892B0] tracking-wider">{kpi.label}</Text>
                      <Text className="mt-2 text-3xl font-extrabold text-white">{kpi.value}</Text>
                    </View>
                    <View className="bg-[#0A192F] px-3 py-1.5 rounded-lg border border-white/5">
                       <Text className="text-xs text-[#8892B0] font-medium">Target: {kpi.benchmark}</Text>
                    </View>
                  </View>
                  <Text className="text-xs text-[#8892B0] leading-5">{kpi.description}</Text>
                </View>
              ))}
            </View>

            {/* Strategic Insights Section */}
            <View className="mb-8">
              <Text className="mb-4 text-xl font-bold text-white">
                Strategic Insights
              </Text>
              <View className="bg-[#112240] p-5 rounded-2xl border border-white/5">
                 <View className="flex-row items-center gap-3 mb-3">
                   <View className="w-10 h-10 rounded-full bg-yellow-500/10 items-center justify-center border border-yellow-500/20">
                     <AlertTriangle size={20} color="#F59E0B" />
                   </View>
                   <Text className="text-lg font-bold text-white">AI CFO Analysis</Text>
                 </View>
                 <Text className="leading-6 text-[#8892B0]">
                   {healthScore > 80 
                     ? "Your financial health is strong. Consider optimizing tax deductions and exploring investment opportunities."
                     : healthScore > 50
                     ? "Your burn rate is manageable but could be optimized. Review subscription spending and consider increasing revenue streams."
                     : "Immediate action required. Your cash runway is critical. Focus on reducing expenses and increasing income immediately."}
                 </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}