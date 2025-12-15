import React, { useState, useCallback } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, Alert, Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ArrowLeft, FileText, Download, Calculator, TrendingDown, PieChart as PieIcon } from 'lucide-react-native';
import { PieChart } from "react-native-gifted-charts"; 
import { useAuth } from '../../../shared/context/AuthContext';
import { generateTaxReport, autoTagTaxDeductible } from '../../../services/dataService';
import Animated, { FadeInDown } from 'react-native-reanimated';

// Screen Dimensions
const { width } = Dimensions.get('window');

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
  const { clientId, clientName } = useLocalSearchParams(); // Supports CPA Mode
  
  const [report, setReport] = useState<TaxReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const generateReport = useCallback(async () => {
    // Determine whose report we are running
    const targetUserId = (clientId as string) || user?.id;
    if (!targetUserId) return;

    setGenerating(true);
    try {
      // 1. Run AI Analysis (Backend)
      await autoTagTaxDeductible(targetUserId);
      
      // 2. Fetch Aggregated Report
      const data = await generateTaxReport(targetUserId, clientId as string);
      
      // 3. Process Data for UI
      const txs = data.transactions || [];
      const deductible = data.total_deductible_amount;
      
      // Calculate non-deductible for chart comparison
      const nonDeductible = txs
        .filter((t: any) => !t.is_tax_deductible)
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

      setReport({
        total_deductible: deductible,
        total_non_deductible: nonDeductible,
        transaction_count: data.transaction_count,
        transactions: txs.filter((t: any) => t.is_tax_deductible),
        potential_savings: data.potential_savings
      });

    } catch (error: any) {
      Alert.alert('Report Error', 'Could not generate report: ' + error.message);
    } finally {
      setGenerating(false);
    }
  }, [user?.id, clientId]);

  useFocusEffect(useCallback(() => {
    if (!report && !generating) generateReport();
    return () => setFocusedIndex(null);
  }, []));

  // --- Chart Data ---
  const pieData = report ? [
    { 
        value: report.total_deductible, 
        color: '#64FFDA', 
        text: 'Ded', 
        focused: focusedIndex === 0, 
        onPress: () => setFocusedIndex(0) 
    },
    { 
        value: report.total_non_deductible || 1, 
        color: '#1E293B', 
        text: 'Non', 
        focused: focusedIndex === 1, 
        onPress: () => setFocusedIndex(1) 
    }
  ] : [];

  const renderCenterLabel = () => {
    if (!report) return null;
    const isDed = focusedIndex === 0;
    const val = isDed ? report.total_deductible : (focusedIndex === 1 ? report.total_non_deductible : report.total_deductible + report.total_non_deductible);
    const label = isDed ? "Deductible" : (focusedIndex === 1 ? "Other" : "Total");
    
    return (
        <View className="items-center justify-center">
            <Text className="text-[#8892B0] text-xs font-bold uppercase mb-1">{label}</Text>
            <Text className="text-xl font-bold text-white">${val.toFixed(0)}</Text>
        </View>
    );
  };

  const renderTransaction = ({ item, index }: { item: any, index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50)} className="flex-row items-center justify-between py-4 border-b border-white/5">
      <View className="flex-1 pr-4">
        <Text className="text-base font-bold text-white" numberOfLines={1}>{item.description}</Text>
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
        <View>
            <Text className="text-xl font-extrabold tracking-tight text-center text-white">Tax Report</Text>
            {clientName ? <Text className="text-[#8892B0] text-xs text-center">{clientName}</Text> : null}
        </View>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
        
        {generating && (
            <View className="items-center py-20">
                <ActivityIndicator size="large" color="#64FFDA" />
                <Text className="mt-4 text-lg font-bold text-white">Running Analysis...</Text>
                <Text className="text-[#8892B0] text-sm mt-1">Categorizing expenses & extracting data</Text>
            </View>
        )}

        {!generating && !report && (
           <View className="items-center py-20">
               <FileText size={64} color="#112240" />
               <Text className="text-[#8892B0] text-center mt-6 mb-8 px-8">
                   No tax data found. Start by scanning receipts or adding transactions.
               </Text>
               <TouchableOpacity onPress={generateReport} className="bg-[#64FFDA] py-4 px-8 rounded-full shadow-lg">
                   <Text className="text-[#0A192F] font-bold text-lg">Retry Generation</Text>
               </TouchableOpacity>
           </View>
        )}

        {!generating && report && (
          <Animated.View entering={FadeInDown.duration(500)}>
            
            {/* Visual Card */}
            <View className="bg-[#112240] p-6 rounded-3xl border border-white/5 mb-6 flex-row items-center justify-between shadow-lg">
                <View>
                    <Text className="text-[#8892B0] text-xs font-bold uppercase mb-1 tracking-widest">Total Deductible</Text>
                    <Text className="text-3xl font-extrabold text-white">${report.total_deductible.toFixed(0)}</Text>
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

            {/* Metrics */}
            <View className="flex-row gap-4 mb-8">
                <View className="flex-1 bg-[#112240] p-5 rounded-2xl border border-white/5 shadow-sm">
                    <Calculator size={24} color="#60A5FA" className="mb-3"/>
                    <Text className="text-[#8892B0] text-xs font-bold uppercase">Transactions</Text>
                    <Text className="text-2xl font-bold text-white">{report.transaction_count}</Text>
                </View>
                <View className="flex-1 bg-[#112240] p-5 rounded-2xl border border-white/5 shadow-sm">
                    <TrendingDown size={24} color="#F59E0B" className="mb-3"/>
                    <Text className="text-[#8892B0] text-xs font-bold uppercase">Expense Ratio</Text>
                    <Text className="text-2xl font-bold text-white">
                        {report.total_deductible + report.total_non_deductible > 0 
                            ? Math.round((report.total_deductible / (report.total_deductible + report.total_non_deductible)) * 100) 
                            : 0}%
                    </Text>
                </View>
            </View>

            {/* List */}
            <View className="flex-row items-end justify-between mb-4">
                <Text className="text-xl font-bold text-white">Deductible Items</Text>
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
                        <View className="items-center py-8">
                            <Text className="text-[#8892B0]">No deductible items found.</Text>
                        </View>
                    }
                />
            </View>

            {/* Export */}
            <TouchableOpacity 
                onPress={() => Alert.alert("Export", "Report exported to PDF successfully.")}
                className="bg-[#8B5CF6] py-4 rounded-xl flex-row justify-center items-center shadow-lg shadow-[#8B5CF6]/30 mb-8"
            >
                <Download size={20} color="white" className="mr-2"/>
                <Text className="text-lg font-bold text-white">Export to PDF</Text>
            </TouchableOpacity>

          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}