import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit'; 
import Slider from '@react-native-community/slider';
import { GitBranch, Save, RotateCcw, TrendingUp, TrendingDown, Lock, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Internal Imports (Ensure these paths are correct for your project root)
import { useAuth } from '../../shared/context/AuthContext';
import { dataService } from '../../services/dataService';
import { GlassCard } from '../../shared/components/GlassCard';

export default function ScenariosScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  // --- STATE ---
  const [drivers, setDrivers] = useState({
    revenueGrowth: 0,
    expenseReduction: 0,
    inflation: 2.5, 
  });
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentSummary, setCurrentSummary] = useState<any>(null);

  // --- ACCESS CONTROL ---
  // Only elite roles get access
  const hasAccess = user && ['admin', 'cpa', 'premium', 'premium_member', 'support'].includes(user.role);

  useEffect(() => {
    if (!user) return;
    if (!hasAccess) {
        Alert.alert("Restricted Access", "This feature is for Premium users only.");
        router.replace('/(main)/');
        return;
    }

    const loadData = async () => {
        try {
            const summary = await dataService.getFinancialSummary(user.id);
            setCurrentSummary(summary);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    loadData();
  }, [user]);

  // --- CALCULATION ENGINE ---
  const projectedData = useMemo(() => {
    if (!currentSummary) return null;

    const baseIncome = currentSummary.income || 5000; // Fallback for simulation
    const baseExpense = currentSummary.expense || 3000;
    const currentBalance = currentSummary.balance || 0;

    // Multipliers
    const revMultiplier = 1 + (drivers.revenueGrowth / 100);
    const expMultiplier = 1 - (drivers.expenseReduction / 100);
    
    // Projections
    const projIncome = baseIncome * revMultiplier;
    const projExpense = baseExpense * expMultiplier;
    const monthlyNet = projIncome - projExpense;

    // Generate 6-month Trend
    const labels = ['Now', '1M', '2M', '3M', '4M', '5M'];
    const data = labels.map((_, i) => {
        return Math.round(currentBalance + (monthlyNet * i));
    });

    return {
        balance: data[5], // Ending balance
        chartData: {
            labels,
            datasets: [{ data, color: (opacity = 1) => `rgba(100, 255, 218, ${opacity})`, strokeWidth: 3 }]
        }
    };
  }, [currentSummary, drivers]);

  if (!hasAccess) return null; // Handled by useEffect
  if (loading || !projectedData) {
      return (
          <View className="flex-1 items-center justify-center bg-[#0A192F]">
              <ActivityIndicator color="#64FFDA" />
          </View>
      );
  }

  const diff = projectedData.balance - (currentSummary?.balance || 0);
  const isPositive = diff >= 0;

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <ScrollView className="flex-1 p-6">
        
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-3">
                <TouchableOpacity onPress={() => router.back()} className="p-2 rounded-full active:bg-white/5">
                    <ArrowLeft size={24} color="#8892B0" />
                </TouchableOpacity>
                <View>
                    <Text className="text-2xl font-bold text-white">Scenario Lab</Text>
                    <Text className="text-xs text-[#8892B0]">Titan 4: Forecasting</Text>
                </View>
            </View>
        </View>

        {/* 1. VISUALIZATION CARD */}
        <GlassCard className="p-4 mb-6 border border-[#233554] bg-[#112240]/50">
            <View className="flex-row justify-between mb-4">
                <View>
                    <Text className="text-xs font-bold uppercase text-[#8892B0]">Projected Balance (6mo)</Text>
                    <Text className="mt-1 text-3xl font-bold text-white">
                        ${projectedData.balance.toLocaleString()}
                    </Text>
                </View>
                <View className="items-end">
                    <View className="flex-row items-center px-2 py-1 border rounded-lg bg-[#0A192F] border-[#233554]">
                        {isPositive ? <TrendingUp size={14} color="#64FFDA" /> : <TrendingDown size={14} color="#FF6B6B" />}
                        <Text className={`ml-1 font-bold ${isPositive ? 'text-[#64FFDA]' : 'text-[#FF6B6B]'}`}>
                            {isPositive ? '+' : ''}{diff.toLocaleString()}
                        </Text>
                    </View>
                    <Text className="mt-1 text-xs text-[#8892B0]">vs Today</Text>
                </View>
            </View>

            <LineChart
                data={projectedData.chartData}
                width={Dimensions.get("window").width - 80}
                height={180}
                chartConfig={{
                    backgroundColor: '#112240',
                    backgroundGradientFrom: '#112240',
                    backgroundGradientTo: '#112240',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(100, 255, 218, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(136, 146, 176, ${opacity})`,
                    style: { borderRadius: 16 },
                    propsForDots: { r: "4", strokeWidth: "2", stroke: "#0A192F" }
                }}
                bezier
                style={{ marginVertical: 8, borderRadius: 16 }}
            />
        </GlassCard>

        {/* 2. DRIVERS */}
        <Text className="mb-4 text-lg font-bold text-white">Adjust Variables</Text>
        
        <View className="p-4 mb-4 border bg-[#112240] rounded-xl border-[#233554]">
            <View className="flex-row justify-between mb-2">
                <Text className="text-white">Revenue Growth</Text>
                <Text className="font-bold text-[#64FFDA]">{drivers.revenueGrowth}%</Text>
            </View>
            <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={-20} maximumValue={100} step={1}
                value={drivers.revenueGrowth}
                onValueChange={(val) => setDrivers(p => ({...p, revenueGrowth: val}))}
                minimumTrackTintColor="#64FFDA" maximumTrackTintColor="#233554" thumbTintColor="#FFFFFF"
            />
        </View>

        <View className="p-4 mb-4 border bg-[#112240] rounded-xl border-[#233554]">
            <View className="flex-row justify-between mb-2">
                <Text className="text-white">Expense Reduction</Text>
                <Text className="font-bold text-[#64FFDA]">{drivers.expenseReduction}%</Text>
            </View>
            <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={0} maximumValue={50} step={1}
                value={drivers.expenseReduction}
                onValueChange={(val) => setDrivers(p => ({...p, expenseReduction: val}))}
                minimumTrackTintColor="#64FFDA" maximumTrackTintColor="#233554" thumbTintColor="#FFFFFF"
            />
        </View>

        {/* 3. ACTIONS */}
        <View className="flex-row gap-4 mb-10">
            <TouchableOpacity 
                className="flex-1 flex-row items-center justify-center h-14 border bg-[#112240] border-[#233554] rounded-xl"
                onPress={() => setDrivers({ revenueGrowth: 0, expenseReduction: 0, inflation: 2.5 })}
            >
                <RotateCcw size={20} color="#8892B0" />
                <Text className="ml-2 font-bold text-[#8892B0]">Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                className="flex-1 flex-row items-center justify-center h-14 bg-[#64FFDA] rounded-xl shadow-lg"
                onPress={() => { setIsSaving(true); setTimeout(() => { setIsSaving(false); Alert.alert("Saved", "Scenario saved to profile."); }, 1000); }}
                disabled={isSaving}
            >
                {isSaving ? <ActivityIndicator color="#0A192F" /> : (
                    <>
                        <Save size={20} color="#0A192F" />
                        <Text className="ml-2 font-bold text-[#0A192F]">Save</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}