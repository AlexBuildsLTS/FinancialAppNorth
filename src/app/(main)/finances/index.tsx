import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, StatusBar 
} from 'react-native';
import {
  TrendingUp, TrendingDown, DollarSign, Sparkles, ArrowRight, Wallet, Receipt, CreditCard, BarChart3, Activity
} from 'lucide-react-native'; 
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../shared/context/AuthContext';
import { getFinancialSummary, getTransactions } from '../../../services/dataService';
import { generateFinancialInsight } from '../../../services/aiService';
import { generateCashFlowForecast, getCashFlowRiskLevel } from '../../../services/analysisService';
import { LinearGradient } from 'expo-linear-gradient';
import { CashFlowPoint } from '../../../types';

export default function FinanceOverviewScreen() {
    const { user } = useAuth();
    const router = useRouter();
    
    // State
    const [metrics, setMetrics] = useState({ income: 0, expense: 0, balance: 0 });
    const [insight, setInsight] = useState("Analyzing your spending habits...");
    const [cashFlow, setCashFlow] = useState<CashFlowPoint[]>([]);
    const [cashFlowRisk, setCashFlowRisk] = useState<'low' | 'medium' | 'high'>('low');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Load Data
    const loadData = async () => {
        if (!user) return;
        try {
            // 1. Get Numbers
            const summary = await getFinancialSummary(user.id);
            setMetrics(summary);

            // 2. Get Cash Flow Forecast
            const forecast = await generateCashFlowForecast(user.id);
            setCashFlow(forecast);
            setCashFlowRisk(getCashFlowRiskLevel(forecast));

            // 3. Get AI Insight (Only if we have transactions)
            const txs = await getTransactions(user.id);
            if (txs.length > 0) {
                const aiText = await generateFinancialInsight(user.id, txs);
                setInsight(aiText);
            } else {
                setInsight("Start adding transactions to get AI-powered financial advice!");
            }

        } catch (e) {
            console.error("Finance Overview Error:", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => { loadData(); }, [user])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
        <View className="flex-1 bg-[#112240] p-4 rounded-2xl border border-white/5 mx-1 shadow-sm">
            <View className={`w-10 h-10 rounded-full items-center justify-center mb-3 ${bg}`}>
                <Icon size={20} color={color} />
            </View>
            <Text className="text-[#8892B0] text-xs font-bold uppercase mb-1">{title}</Text>
            <Text className="text-xl font-bold text-white" numberOfLines={1}>{value}</Text>
        </View>
    );

    return (
        <View className="flex-1 bg-[#0A192F]">
            <StatusBar barStyle="light-content" />
            <ScrollView 
                className="flex-1 px-5"
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#64FFDA" />}
            >
                {/* Header */}
                <View className="mb-8">
                    <Text className="text-[#8892B0] text-sm font-medium">Financial Overview</Text>
                    <Text className="text-3xl font-extrabold text-white">Your Wealth</Text>
                </View>

                {/* AI Insight Card */}
                <LinearGradient
                    colors={['#1D3255', '#112240']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="p-5 rounded-3xl border border-[#64FFDA]/20 mb-8"
                >
                    <View className="flex-row items-center gap-2 mb-3">
                        <Sparkles size={18} color="#64FFDA" />
                        <Text className="text-[#64FFDA] font-bold text-sm uppercase tracking-widest">AI Insight</Text>
                    </View>
                    <Text className="text-base font-medium leading-6 text-white">
                        "{insight.replace(/"/g, '')}"
                    </Text>
                </LinearGradient>

                {/* Metrics Row */}
                <View className="flex-row justify-between mb-8">
                    <StatCard 
                        title="Income" 
                        value={`$${metrics.income.toFixed(0)}`} 
                        icon={TrendingUp} 
                        color="#4ADE80" 
                        bg="bg-green-500/10"
                    />
                    <StatCard 
                        title="Expense" 
                        value={`$${metrics.expense.toFixed(0)}`} 
                        icon={TrendingDown} 
                        color="#F87171" 
                        bg="bg-red-500/10"
                    />
                    <StatCard 
                        title="Net" 
                        value={`$${metrics.balance.toFixed(0)}`} 
                        icon={DollarSign} 
                        color="#64FFDA" 
                        bg="bg-[#64FFDA]/10"
                    />
                </View>

                {/* Cash Flow Forecast */}
                {cashFlow.length > 0 && (
                    <View className="mb-8">
                        <View className="flex-row items-center mb-4">
                            <BarChart3 size={20} color="#64FFDA" />
                            <Text className="ml-2 text-lg font-bold text-white">30-Day Cash Flow</Text>
                        </View>
                        <View className="bg-[#112240] p-4 rounded-2xl border border-white/5">
                            <View className="flex-row items-center justify-between mb-3">
                                <Text className="text-[#8892B0] text-sm">Risk Level</Text>
                                <View className={`flex-row items-center px-3 py-1 rounded-full ${
                                    cashFlowRisk === 'high' ? 'bg-red-500/20' :
                                    cashFlowRisk === 'medium' ? 'bg-yellow-500/20' : 'bg-green-500/20'
                                }`}>
                                    <TrendingDown size={12} color={
                                        cashFlowRisk === 'high' ? '#F87171' :
                                        cashFlowRisk === 'medium' ? '#F59E0B' : '#10B981'
                                    } />
                                    <Text className={`text-xs font-bold ml-1 ${
                                        cashFlowRisk === 'high' ? 'text-red-400' :
                                        cashFlowRisk === 'medium' ? 'text-yellow-400' : 'text-green-400'
                                    }`}>
                                        {cashFlowRisk.toUpperCase()}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row items-center justify-between">
                                <View>
                                    <Text className="text-[#8892B0] text-sm">Current Balance</Text>
                                    <Text className="text-lg font-bold text-white">
                                        ${metrics.balance.toFixed(2)}
                                    </Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-[#8892B0] text-sm">Projected (30 days)</Text>
                                    <Text className={`font-bold text-lg ${
                                        cashFlow[cashFlow.length - 1]?.balance >= 0 ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                        ${cashFlow[cashFlow.length - 1]?.balance.toFixed(2) || '0.00'}
                                    </Text>
                                </View>
                            </View>

                            <Text className="text-[#8892B0] text-xs mt-2 text-center">
                                *Chart visualization requires react-native-chart-kit
                            </Text>
                        </View>
                    </View>
                )}

                {/* Actions */}
                <Text className="mb-4 text-lg font-bold text-white">Quick Actions</Text>
                <View className="gap-3">
                    
                    {/* NEW: Financial Scorecard Button */}
                    <TouchableOpacity 
                        onPress={() => router.push('/(main)/finances/scorecard')} 
                        className="bg-[#112240] p-5 rounded-2xl border border-white/5 flex-row items-center justify-between active:bg-[#162C52]"
                    >
                        <View className="flex-row items-center gap-4">
                            <View className="items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10">
                                <Activity size={20} color="#10B981" />
                            </View>
                            <View>
                                <Text className="text-base font-bold text-white">Health Scorecard</Text>
                                <Text className="text-[#8892B0] text-xs">Burn Rate, Runway & Profit</Text>
                            </View>
                        </View>
                        <ArrowRight size={20} color="#8892B0" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={() => router.push('/(main)/finances/transactions')} 
                        className="bg-[#112240] p-5 rounded-2xl border border-white/5 flex-row items-center justify-between active:bg-[#162C52]"
                    >
                        <View className="flex-row items-center gap-4">
                            <View className="items-center justify-center w-10 h-10 rounded-full bg-blue-500/10">
                                <Wallet size={20} color="#60A5FA" />
                            </View>
                            <View>
                                <Text className="text-base font-bold text-white">Add Transaction</Text>
                                <Text className="text-[#8892B0] text-xs">Log income or expense</Text>
                            </View>
                        </View>
                        <ArrowRight size={20} color="#8892B0" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        onPress={() => router.push('/(main)/scan')} 
                        className="bg-[#112240] p-5 rounded-2xl border border-white/5 flex-row items-center justify-between active:bg-[#162C52]"
                    >
                        <View className="flex-row items-center gap-4">
                            <View className="items-center justify-center w-10 h-10 rounded-full bg-purple-500/10">
                                <Receipt size={20} color="#A78BFA" />
                            </View>
                            <View>
                                <Text className="text-base font-bold text-white">Scan Receipt</Text>
                                <Text className="text-[#8892B0] text-xs">AI-powered extraction</Text>
                            </View>
                        </View>
                        <ArrowRight size={20} color="#8892B0" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/(main)/finances/subscriptions')}
                        className="bg-[#112240] p-5 rounded-2xl border border-white/5 flex-row items-center justify-between active:bg-[#162C52]"
                    >
                        <View className="flex-row items-center gap-4">
                            <View className="items-center justify-center w-10 h-10 rounded-full bg-orange-500/10">
                                <CreditCard size={20} color="#F59E0B" />
                            </View>
                            <View>
                                <Text className="text-base font-bold text-white">Track Subscriptions</Text>
                                <Text className="text-[#8892B0] text-xs">Detect recurring bills</Text>
                            </View>
                        </View>
                        <ArrowRight size={20} color="#8892B0" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}