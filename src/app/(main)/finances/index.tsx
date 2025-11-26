import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Zap, TrendingUp, DollarSign, List, PieChart } from 'lucide-react-native'; 
import { useRouter } from 'expo-router';
// FIX: Corrected the path to go up four levels (app/main/finances/index.tsx -> global.css)
import "../../../../global.css"; 

export default function FinanceOverviewScreen() {
    const router = useRouter();

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

    return (
        <View className="flex-1 bg-[#0A192F]">
            <ScrollView className="p-6">
                <View className="mb-8">
                    <Text className="text-white text-3xl font-bold">Financial Health Dashboard</Text>
                    <Text className="text-[#8892B0]">Your AI-powered spending insights</Text>
                </View>

                {/* Stat Cards */}
                <View className="flex-row justify-between gap-4 mb-6">
                    <StatCard 
                        title="Net Flow (AI Est.)" 
                        value="+$1,250.00" 
                        icon={TrendingUp} 
                        color="green" 
                    />
                    <StatCard 
                        title="Month-to-Date Expense" 
                        value="-$2,100.00" 
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
                    <Text className="text-[#8892B0] text-sm leading-6">
                        "Your non-essential spending is 20% over budget. The largest increase was in 'Entertainment' (up $300). 
                        Consider reducing spending here or reviewing your Budget tab."
                    </Text>
                    <TouchableOpacity onPress={() => router.push('/(main)/finances/budgets')} className="mt-4 self-start flex-row items-center">
                        <Text className="text-[#64FFDA] font-bold text-sm mr-1">View Budget Recommendations</Text>
                        <TrendingUp size={14} color="#64FFDA" />
                    </TouchableOpacity>
                </View>

                {/* Chart Placeholder */}
                <View className="bg-[#112240] p-5 rounded-2xl border border-white/10 h-64 justify-center items-center mb-6">
                    <PieChart size={32} color="#8892B0" />
                    <Text className="text-white mt-2 font-medium">Spending Distribution Chart Here</Text>
                    <Text className="text-[#8892B0] text-xs mt-1">Data from Transactions & Scan</Text>
                </View>

                {/* Link to Full Transactions List */}
                <TouchableOpacity 
                    onPress={() => router.push('/(main)/finances/transactions')} 
                    className="bg-white/5 p-4 rounded-xl border border-white/10 flex-row items-center justify-between"
                >
                    <Text className="text-white font-bold text-base">Go to Full Transactions List</Text>
                    <List size={20} color="white" />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}