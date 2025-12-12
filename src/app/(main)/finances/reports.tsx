import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, useWindowDimensions, TouchableOpacity, RefreshControl } from 'react-native';
import { PieChart, BarChart } from "react-native-gifted-charts";
import { useAuth } from '../../../shared/context/AuthContext';
import { getTransactions } from '../../../services/dataService'; // Unified Import
import { useFocusEffect } from 'expo-router';

export default function ReportsScreen() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pieData, setPieData] = useState<any[]>([]);
  const [barData, setBarData] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  
  // Interaction State
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const generateReport = async () => {
    if (!user) return;
    if (!refreshing) setLoading(true);
    try {
      const txs = await getTransactions(user.id);
      
      const categoryMap: Record<string, number> = {};
      let total = 0;

      txs.forEach((t: any) => {
        const amt = Math.abs(Number(t.amount));
        const catName = typeof t.category === 'string' ? t.category : t.category?.name || 'Uncategorized';
        
        // Only expenses
        if (Number(t.amount) < 0) {
            categoryMap[catName] = (categoryMap[catName] || 0) + amt;
            total += amt;
        }
      });

      setTotalSpent(total);

      const colors = ['#64FFDA', '#F472B6', '#60A5FA', '#FBBF24', '#A78BFA', '#34D399'];
      
      const pData = Object.keys(categoryMap).map((key, index) => ({
        value: categoryMap[key],
        color: colors[index % colors.length],
        text: `${Math.round((categoryMap[key] / total) * 100)}%`,
        category: key,
        amount: categoryMap[key],
        onPress: () => setFocusedIndex(index),
        focused: false,
        shiftTextX: -10,
      }));

      pData.sort((a, b) => b.value - a.value);
      setPieData(pData);

      const bData = pData.map((item) => ({
        value: item.amount,
        label: item.category.substring(0, 3).toUpperCase(),
        frontColor: item.color,
        topLabelComponent: () => (
            <Text style={{ color: '#8892B0', fontSize: 10, marginBottom: 2 }}>${item.amount.toFixed(0)}</Text>
        )
      }));
      setBarData(bData);

    } catch (e) {
      console.error("Report Error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
      setRefreshing(true);
      generateReport();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (user) generateReport();
      return () => setFocusedIndex(null);
    }, [user])
  );

  const renderCenterLabel = () => {
    let labelText = "Total";
    let valueText = `$${totalSpent.toFixed(0)}`;
    let color = "#8892B0";

    if (focusedIndex !== null && pieData[focusedIndex]) {
        const item = pieData[focusedIndex];
        labelText = item.category;
        valueText = `$${item.amount.toFixed(0)}`;
        color = item.color;
    }

    return (
      <View className="items-center justify-center">
          <Text style={{ color }} className="text-xs uppercase font-bold mb-1">{labelText}</Text>
          <Text className="text-white text-2xl font-bold">{valueText}</Text>
      </View>
    );
  };

  if (loading && !refreshing && pieData.length === 0) {
    return (
        <View className="flex-1 bg-[#0A192F] justify-center items-center">
            <ActivityIndicator size="large" color="#64FFDA" />
        </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#0A192F] p-6" contentContainerStyle={{ paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#64FFDA"/>}>
      <View className="mb-8">
        <Text className="text-white text-3xl font-bold">Analytics</Text>
        <Text className="text-[#8892B0]">Spending Breakdown</Text>
      </View>

      {pieData.length > 0 ? (
        <View className={`gap-6 ${isDesktop ? 'flex-row' : 'flex-col'}`}>
          
          <View className={`bg-[#112240] p-8 rounded-3xl border border-white/5 items-center justify-center ${isDesktop ? 'w-1/2' : 'w-full'}`}>
             <View className="items-center justify-center">
                <PieChart
                  data={pieData.map((item, index) => ({ ...item, focused: focusedIndex === index }))}
                  donut
                  radius={isDesktop ? 140 : 120}
                  innerRadius={isDesktop ? 100 : 80}
                  innerCircleColor="#112240"
                  centerLabelComponent={renderCenterLabel}
                  focusOnPress
                  toggleFocusOnPress
                  onPress={(item: any, index: number) => setFocusedIndex(index)}
                  strokeColor="#112240"
                  strokeWidth={4}
                />
                <Text className="text-[#8892B0] text-xs mt-6">Tap slices for details</Text>
             </View>
          </View>

          <View className={`bg-[#112240] p-6 rounded-3xl border border-white/5 ${isDesktop ? 'w-1/2' : 'w-full'} justify-center`}>
             <Text className="text-white text-lg font-bold mb-6">Top Categories</Text>
             <View className="overflow-hidden">
                <BarChart
                    data={barData}
                    barWidth={30}
                    noOfSections={3}
                    barBorderRadius={4}
                    frontColor="lightgray"
                    yAxisThickness={0}
                    xAxisThickness={0}
                    yAxisTextStyle={{color: '#8892B0'}}
                    xAxisLabelTextStyle={{color: '#8892B0'}}
                    hideRules
                    isAnimated
                    animationDuration={1000}
                    height={250}
                    width={isDesktop ? 400 : 280}
                />
             </View>
          </View>
        </View>
      ) : (
        <View className="py-20 items-center bg-[#112240] rounded-3xl border border-white/5">
            <Text className="text-[#8892B0] text-xl">No expenses found.</Text>
        </View>
      )}

      {pieData.length > 0 && (
          <View className="bg-[#112240] p-6 rounded-3xl border border-white/5 mt-6">
            <Text className="text-white text-xl font-bold mb-4">Detailed Breakdown</Text>
            <View className="gap-3">
                {pieData.map((item: any, index: number) => (
                    <TouchableOpacity 
                        key={index} 
                        onPress={() => setFocusedIndex(index)}
                        className={`flex-row items-center justify-between p-3 rounded-xl border ${focusedIndex === index ? `bg-[#1D3255] border-[${item.color}]` : 'bg-[#0A192F] border-white/5'}`}
                        style={focusedIndex === index ? { borderColor: item.color, borderWidth: 1 } : {}}
                    >
                        <View className="flex-row items-center gap-3">
                            <View className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                            <Text className={`font-medium text-base ${focusedIndex === index ? 'text-white font-bold' : 'text-[#8892B0]'}`}>{item.category}</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-white font-bold">${item.amount.toFixed(2)}</Text>
                            <Text className="text-[#8892B0] text-xs">{item.text}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
          </View>
      )}
    </ScrollView>
  );
}