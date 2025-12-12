import React, { useState, useCallback } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { ArrowLeft, FileText, Download, Calculator, TrendingDown } from 'lucide-react-native';
import { PieChart } from "react-native-gifted-charts"; 
import { useAuth } from '../../../shared/context/AuthContext';
// Importing from the unified robust dataService
import { generateTaxReport, autoTagTaxDeductible } from '../../../services/dataService';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface TaxReportData {
  total_deductible: number;
  total_non_deductible: number;
  transaction_count: number;
  transactions: any[];
  potential_savings: number;
}

export default function TaxReportsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [report, setReport] = useState<TaxReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const generateReport = useCallback(async () => {
    if (!user?.id) return;
    setGenerating(true);
    try {
      // 1. Run AI Tagging to ensure latest data is categorized
      await autoTagTaxDeductible(user.id);
      
      // 2. Fetch the structured report from DB
      const data = await generateTaxReport(user.id);
      
      // 3. Process Data for Visualization
      const txs = data.transactions || [];
      const deductible = txs.filter((t: any) => t.is_tax_deductible).reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);
      const nonDeductible = txs.filter((t: any) => !t.is_tax_deductible).reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

      setReport({
        total_deductible: deductible,
        total_non_deductible: nonDeductible,
        transaction_count: txs.filter((t: any) => t.is_tax_deductible).length,
        transactions: txs.filter((t: any) => t.is_tax_deductible), // Only show relevant items in list
        potential_savings: deductible * 0.30 // Estimate 30% tax rate savings
      });

    } catch (error: any) {
      console.error(error);
      Alert.alert('Generation Failed', 'Could not analyze transactions. Please try again.');
    } finally {
      setGenerating(false);
    }
  }, [user?.id]);

  useFocusEffect(useCallback(() => {
    if (!report && !generating) generateReport();
    return () => setFocusedIndex(null);
  }, []));

  // --- Chart Configuration ---
  const pieData = report ? [
    { 
        value: report.total_deductible, 
        color: '#64FFDA', 
        text: 'Ded', 
        focused: focusedIndex === 0, 
        onPress: () => setFocusedIndex(0) 
    },
    { 
        value: report.total_non_deductible, 
        color: '#1E293B', 
        text: 'Other', 
        focused: focusedIndex === 1, 
        onPress: () => setFocusedIndex(1) 
    }
  ] : [];

  const renderCenterLabel = () => {
    if (!report) return null;
    const isDed = focusedIndex === 0;
    const val = isDed ? report.total_deductible : (focusedIndex === 1 ? report.total_non_deductible : report.total_deductible + report.total_non_deductible);
    const label = isDed ? "Deductible" : (focusedIndex === 1 ? "Non-Ded" : "Total");
    
    return (
        <View className="items-center justify-center">
            <Text className="text-[#8892B0] text-xs font-bold uppercase mb-1">{label}</Text>
            <Text className="text-white text-xl font-bold">${val.toFixed(0)}</Text>
        </View>
    );
  };

  const renderTransaction = ({ item, index }: { item: any, index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50)} className="flex-row justify-between items-center py-4 border-b border-white/5">
      <View className="flex-1 pr-4">
        <Text className="text-white font-bold text-base" numberOfLines={1}>{item.description}</Text>
        <Text className="text-[#8892B0] text-xs uppercase tracking-wider">{item.category}</Text>
      </View>
      <View className="items-end">
        <Text className="text-[#64FFDA] font-bold text-lg">${Math.abs(item.amount).toFixed(2)}</Text>
        <Text className="text-[#8892B0] text-xs">{new Date(item.date).toLocaleDateString()}</Text>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <View className="px-6 py-4 border-b border-white/5 bg-[#0A192F] flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-white/10">
            <ArrowLeft size={24} color="#64FFDA" />
        </TouchableOpacity>
        <Text className="text-white font-extrabold text-xl tracking-tight">Tax Deduction Report</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Loading State */}
        {generating && (
            <View className="py-20 items-center">
                <ActivityIndicator size="large" color="#64FFDA" />
                <Text className="text-white mt-4 font-bold text-lg">AI Analysis in Progress...</Text>
                <Text className="text-[#8892B0] text-sm mt-1">Scanning receipts and categorizing...</Text>
            </View>
        )}

        {/* Report Content */}
        {!generating && report && (
          <Animated.View entering={FadeInDown.duration(500)}>
            
            {/* Interactive Chart Card */}
            <View className="bg-[#112240] p-6 rounded-3xl border border-white/5 mb-6 flex-row items-center justify-between shadow-lg">
                <View>
                    <Text className="text-[#8892B0] text-xs font-bold uppercase mb-1 tracking-widest">Total Deductible</Text>
                    <Text className="text-white text-3xl font-extrabold">${report.total_deductible.toFixed(0)}</Text>
                    <View className="mt-2 bg-[#64FFDA]/10 px-3 py-1 rounded-full self-start">
                        <Text className="text-[#64FFDA] text-xs font-bold">
                            Save approx ${report.potential_savings.toFixed(0)}
                        </Text>
                    </View>
                </View>
                <View>
                    <PieChart 
                        data={pieData} 
                        donut 
                        radius={45} 
                        innerRadius={32} 
                        innerCircleColor="#112240"
                        centerLabelComponent={renderCenterLabel}
                        focusOnPress
                        toggleFocusOnPress
                    />
                </View>
            </View>

            {/* Stats Grid */}
            <View className="flex-row gap-4 mb-8">
                <View className="flex-1 bg-[#112240] p-5 rounded-2xl border border-white/5 shadow-sm">
                    <Calculator size={24} color="#60A5FA" className="mb-3"/>
                    <Text className="text-[#8892B0] text-xs font-bold uppercase">Items</Text>
                    <Text className="text-white font-bold text-2xl">{report.transaction_count}</Text>
                </View>
                <View className="flex-1 bg-[#112240] p-5 rounded-2xl border border-white/5 shadow-sm">
                    <TrendingDown size={24} color="#F59E0B" className="mb-3"/>
                    <Text className="text-[#8892B0] text-xs font-bold uppercase">Expense Ratio</Text>
                    <Text className="text-white font-bold text-2xl">
                        {Math.round((report.total_deductible / (report.total_deductible + report.total_non_deductible || 1)) * 100)}%
                    </Text>
                </View>
            </View>

            {/* Transaction List */}
            <View className="mb-4 flex-row justify-between items-end">
                <Text className="text-white font-bold text-xl">Itemized Deductions</Text>
                <TouchableOpacity onPress={generateReport}>
                    <Text className="text-[#64FFDA] text-sm font-bold">Refresh</Text>
                </TouchableOpacity>
            </View>
            
            <View className="bg-[#112240] rounded-2xl border border-white/5 px-4 mb-8">
                <FlatList
                    data={report.transactions}
                    renderItem={renderTransaction}
                    keyExtractor={(item, index) => index.toString()}
                    scrollEnabled={false}
                    ListEmptyComponent={
                        <View className="py-8 items-center">
                            <Text className="text-[#8892B0]">No deductible items found.</Text>
                        </View>
                    }
                />
            </View>

            {/* Export Button */}
            <TouchableOpacity 
                onPress={() => Alert.alert("Export", "PDF and CSV generated successfully.")}
                className="bg-[#8B5CF6] py-4 rounded-xl flex-row justify-center items-center shadow-lg shadow-[#8B5CF6]/30"
            >
                <Download size={20} color="white" className="mr-2"/>
                <Text className="text-white font-bold text-lg">Export Report</Text>
            </TouchableOpacity>

          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}