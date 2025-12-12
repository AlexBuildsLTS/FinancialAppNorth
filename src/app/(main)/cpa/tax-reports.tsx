import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { ArrowLeft, FileText, Download, Calculator, TrendingDown } from 'lucide-react-native';
import { useAuth } from '../../../shared/context/AuthContext';
import { generateTaxReport, autoTagTaxDeductible } from '../../../services/dataService';

interface TaxReportData {
  user_id: string;
  generated_at: string;
  total_deductible_amount: number;
  transaction_count: number;
  transactions: Array<{
    date: string;
    description: string;
    amount: number;
    category: string;
  }>;
  summary: {
    business_expenses: number;
    potential_tax_savings: number;
  };
}

export default function TaxReportsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [report, setReport] = useState<TaxReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const generateReport = useCallback(async () => {
    if (!user?.id) return;
    setGenerating(true);
    try {
      // First auto-tag any untagged transactions
      await autoTagTaxDeductible(user.id);

      // Then generate the report
      const data = await generateTaxReport(user.id);
      setReport(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate tax report');
    } finally {
      setGenerating(false);
    }
  }, [user?.id]);

  useFocusEffect(useCallback(() => {
    if (!report) generateReport();
  }, [generateReport, report]));

  const exportReport = useCallback(() => {
    if (!report) return;

    const csvContent = [
      'Date,Description,Amount,Category',
      ...report.transactions.map(t =>
        `${t.date},${t.description},${t.amount},${t.category}`
      )
    ].join('\n');

    // In a real app, you'd use expo-sharing or similar
    Alert.alert('Export', 'CSV export would be implemented here');
  }, [report]);

  const renderTransaction = ({ item }: { item: any }) => (
    <View className="flex-row justify-between items-center py-3 border-b border-white/5">
      <View className="flex-1">
        <Text className="text-white font-medium">{item.description}</Text>
        <Text className="text-[#8892B0] text-sm">{item.category}</Text>
      </View>
      <View className="items-end">
        <Text className="text-[#64FFDA] font-bold">${item.amount.toFixed(2)}</Text>
        <Text className="text-[#8892B0] text-xs">{new Date(item.date).toLocaleDateString()}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      {/* Header */}
      <View className="px-6 py-4 border-b border-white/5 bg-[#0A192F]">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <ArrowLeft size={24} color="#64FFDA" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-xl">Tax Reports</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-4">
        {/* Summary Cards */}
        {report && (
          <View className="space-y-4 mb-6">
            <View className="bg-[#112240] rounded-xl p-4 border border-white/5">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-[#8892B0] text-sm">Business Expenses</Text>
                  <Text className="text-white font-bold text-2xl">${report.total_deductible_amount.toFixed(2)}</Text>
                </View>
                <View className="bg-blue-500/20 p-3 rounded-full">
                  <Calculator size={24} color="#3B82F6" />
                </View>
              </View>
            </View>

            <View className="bg-[#112240] rounded-xl p-4 border border-white/5">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-[#8892B0] text-sm">Potential Tax Savings</Text>
                  <Text className="text-[#64FFDA] font-bold text-2xl">${report.summary.potential_tax_savings.toFixed(2)}</Text>
                  <Text className="text-[#8892B0] text-xs">Based on 30% tax rate</Text>
                </View>
                <View className="bg-green-500/20 p-3 rounded-full">
                  <TrendingDown size={24} color="#10B981" />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Actions */}
        <View className="flex-row space-x-3 mb-6">
          <TouchableOpacity
            onPress={generateReport}
            disabled={generating}
            className="flex-1 bg-[#64FFDA]/20 border border-[#64FFDA]/30 rounded-xl py-3 items-center"
          >
            {generating ? (
              <ActivityIndicator size="small" color="#64FFDA" />
            ) : (
              <>
                <FileText size={20} color="#64FFDA" />
                <Text className="text-[#64FFDA] font-bold mt-1">Generate Report</Text>
              </>
            )}
          </TouchableOpacity>

          {report && (
            <TouchableOpacity
              onPress={exportReport}
              className="flex-1 bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 rounded-xl py-3 items-center"
            >
              <Download size={20} color="#8B5CF6" />
              <Text className="text-[#8B5CF6] font-bold mt-1">Export CSV</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Transactions List */}
        {report && (
          <View className="bg-[#112240] rounded-xl border border-white/5">
            <View className="p-4 border-b border-white/5">
              <Text className="text-white font-bold text-lg">Deductible Transactions</Text>
              <Text className="text-[#8892B0] text-sm">{report.transaction_count} transactions</Text>
            </View>

            <FlatList
              data={report.transactions}
              renderItem={renderTransaction}
              keyExtractor={(item, index) => `${item.date}-${index}`}
              scrollEnabled={false}
              ListEmptyComponent={
                <View className="items-center py-8">
                  <FileText size={32} color="#112240" />
                  <Text className="text-[#8892B0] mt-2">No deductible transactions found</Text>
                </View>
              }
            />
          </View>
        )}

        {loading && !report && (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#64FFDA" />
            <Text className="text-[#8892B0] mt-4">Generating tax report...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}