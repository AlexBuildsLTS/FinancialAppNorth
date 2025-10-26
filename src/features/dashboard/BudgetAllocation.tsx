// src/features/dashboard/BudgetAllocation.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Cards } from '@/shared/components/Cards';
import { useTheme } from '@/shared/context/ThemeProvider';
import { formatCurrency } from '@/shared/utils/formatters';

// Define expected data structure
interface AllocationDataPoint {
  category: string;
  value: number; // e.g., amount spent or allocated
  color?: string; // Optional color override
  percentage?: number;
}

interface BudgetAllocationProps {
  allocationData?: AllocationDataPoint[];
}

const defaultColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#54A0FF'];

export default function BudgetAllocation({ allocationData = [] }: BudgetAllocationProps) {
  const { theme } = useTheme();

  const pieData = allocationData.map((item, index) => ({
    value: item.value,
    color: item.color || defaultColors[index % defaultColors.length],
    text: `${item.percentage?.toFixed(0) ?? ''}%`,
  }));

  const renderLegendItem = ({ item, index }: { item: AllocationDataPoint, index: number }) => (
    <View style={styles.legendItem}>
      <View style={[styles.legendColorBox, { backgroundColor: item.color || defaultColors[index % defaultColors.length] }]} />
      <Text style={[styles.legendText, { color: theme.colors.text, fontFamily: theme.fonts.regular }]} numberOfLines={1}>
        {item.category}
      </Text>
      <Text style={[styles.legendValue, { color: theme.colors.textSecondary, fontFamily: theme.fonts.medium }]}>
        {formatCurrency(item.value)}
      </Text>
    </View>
  );

  return (
    <Cards style={styles.container}>
      <Text style={[styles.title, { fontFamily: theme.fonts.semiBold, fontSize: 18, color: theme.colors.text }]}>
        Budget Allocation
      </Text>
      <View style={styles.contentContainer}>
         {pieData.length > 0 ? (
            <>
               <View style={styles.chartContainer}>
                 <PieChart
                   donut // Make it a Donut chart
                   innerRadius={40} // Adjust inner radius
                   radius={80} // Adjust outer radius
                   data={pieData}
                   showText // Show text labels on slices
                   textColor={theme.colors.background} // Text color on slices
                   textSize={10}
                   focusOnPress // Allow interaction
                   // Add animation props if available/needed
                 />
               </View>
               <View style={styles.legendContainer}>
                 <FlatList
                   data={allocationData}
                   renderItem={renderLegendItem}
                   keyExtractor={(item) => item.category}
                   showsVerticalScrollIndicator={false}
                 />
               </View>
            </>
         ) : (
             <Text style={{color: theme.colors.textSecondary, textAlign: 'center', marginTop: 50}}>No budget data available.</Text>
         )}
      </View>
    </Cards>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, // Ensure Cards takes available space
  title: { fontSize: 18, marginBottom: 16 },
  contentContainer: {
    flex: 1, // Ensure content fills Cards
    flexDirection: 'row', // Chart and Legend side-by-side
    alignItems: 'center',
  },
  chartContainer: {
    flex: 1.2, // Give chart slightly more space
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    flex: 1, // Legend takes remaining space
    height: '100%', // Allow FlatList to scroll if needed
    paddingLeft: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 8,
  },
  legendText: {
    flex: 1, // Allow text to take available space
    fontSize: 13,
    marginRight: 8,
  },
  legendValue: {
    fontSize: 13,
    textAlign: 'right',
  },
});