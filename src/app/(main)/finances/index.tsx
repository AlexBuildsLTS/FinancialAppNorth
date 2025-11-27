import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Zap, TrendingUp, DollarSign, List, PieChart } from 'lucide-react-native'; 
import { useRouter } from 'expo-router';
import { useAuth } from '../../../shared/context/AuthContext';
import { getFinancialSummary, getTransactions } from '../../../services/dataService';
import { generateFinancialInsight } from '../../../services/aiService';
import "../../../../global.css"; 

export default function FinanceOverviewScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [metrics, setMetrics] = useState({ income: 0, expense: 0, balance: 0 });
    const [insight, setInsight] = useState("Analyzing your spending...");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) loadData();
    }, [user]);

    const loadData = async () => {
        if (!user) return;
        try {
            // 1. Get Numbers
            const summary = await getFinancialSummary(user.id);
            setMetrics(summary);

            // 2. Get AI Insight
            const txs = await getTransactions(user.id);
            const aiText = await generateFinancialInsight(user.id, txs);
            setInsight(aiText);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color }: any) => (
        <View className="bg-[#112240] p-4 rounded-xl border border-white/5 flex-1 min-w-[150px]">
            <View className="flex-row items-center mb-2">
                <View className={`p-2 rounded-lg ${color === 'green' ? 'bg-[#64FFDA]/10' : 'bg-red-500/10'}`}>
                    <Icon size={20} color={color === 'green' ? '#64FFDA' : '#F87171'} />
                </View>
                <Text className="text-[#8892B0] text-xs font-medium uppercase ml-2">{title}</Text>
            </View>
            <Text className="text-2xl font-bold text-white">{value}</Text>
        </View>
    );

    if (loading) return <View className="flex-1 bg-[#0A192F] justify-center items-center"><ActivityIndicator color="#64FFDA"/></View>;

    return (
        <View className="flex-1 bg-[#0A192F]">
            <ScrollView className="p-6">
                <View className="mb-8">
                    <Text className="text-white text-3xl font-bold">Financial Health</Text>
                    <Text className="text-[#8892B0]">AI-powered spending insights</Text>
                </View>

                {/* Stat Cards */}
                <View className="flex-row justify-between gap-4 mb-6">
                    <StatCard 
                        title="Income (Mo)" 
                        value={`$${metrics.income.toFixed(2)}`} 
                        icon={TrendingUp} 
                        color="green" 
                    />
                    <StatCard 
                        title="Expense (Mo)" 
                        value={`$${metrics.expense.toFixed(2)}`} 
                        icon={DollarSign} 
                        color="red" 
                    />
                </View>

                {/* AI Insight Card */}
                <View className="bg-[#112240] p-5 rounded-2xl border border-[#64FFDA]/20 mb-6">
                    <View className="flex-row items-center mb-3">
                        <Zap size={24} color="#64FFDA" className="mr-2" />
                        <Text className="text-white font-bold text-lg">NorthFinance AI Analysis</Text>
                    </View>
                    <Text className="text-[#8892B0] text-sm leading-6 italic">
                        "{insight}"
                    </Text>
                    <TouchableOpacity onPress={() => router.push('/(main)/finances/budgets')} className="mt-4 self-start flex-row items-center">
                        <Text className="text-[#64FFDA] font-bold text-sm mr-1">Manage Budgets</Text>
                        <TrendingUp size={14} color="#64FFDA" />
                    </TouchableOpacity>
                </View>

                {/* Navigation Links */}
                <View className="gap-3">
                    <TouchableOpacity 
                        onPress={() => router.push('/(main)/finances/transactions')} 
                        className="bg-white/5 p-4 rounded-xl border border-white/10 flex-row items-center justify-between"
                    >
                        <Text className="text-white font-bold text-base">View Transactions</Text>
                        <List size={20} color="white" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        onPress={() => router.push('/(main)/finances/reports')} 
                        className="bg-white/5 p-4 rounded-xl border border-white/10 flex-row items-center justify-between"
                    >
                        <Text className="text-white font-bold text-base">View Full Reports</Text>
                        <PieChart size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}