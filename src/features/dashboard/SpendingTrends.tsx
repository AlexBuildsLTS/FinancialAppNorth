// src/features/dashboard/SpendingTrends.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Cards } from '@/shared/components/Cards';
import { useTheme } from '@/shared/context/ThemeProvider';
import { formatCurrency } from '@/shared/utils/formatters'; // Assuming exists

// Define expected data structure
interface TrendDataPoint {
  value: number;
  label: string; // Changed from date to label to match useDashboardData output
  date?: string; // Optional date property if needed elsewhere
  // Add other properties if needed by gifted-charts for labels/tooltips
}

interface SpendingTrendsProps {
  // Adapt based on how useDashboardData provides chartData
  incomeData?: TrendDataPoint[];
  expenseData?: TrendDataPoint[];
}

export default function SpendingTrends({ incomeData = [], expenseData = [] }: SpendingTrendsProps) {
  const { theme } = useTheme();
  const [timePeriod, setTimePeriod] = useState('Month'); // Or manage globally

  // Prepare data for gifted-charts (ensure correct format)
  // Example: Add labels if not present in incomeData/expenseData
  const processData = (data: TrendDataPoint[]): any[] => {
     return data.map(item => ({
       value: item.value,
       label: item.label, // Use label directly as it's already formatted
     }));
  };

  const formattedIncomeData = processData(incomeData);
  const formattedExpenseData = processData(expenseData);

  return (
    <Cards style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontFamily: theme.fonts.semiBold, fontSize: 18, color: theme.colors.text }]}>
          Spending Habits
        </Text>
        {/* Time Period Toggle Buttons */}
        <View style={styles.buttonGroup}>
          {['Week', 'Month', 'Year'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.button,
                { borderColor: theme.colors.border },
                timePeriod === period && { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => setTimePeriod(period)}
            >
              <Text style={[
                styles.buttonText,
                { fontFamily: theme.fonts.medium, fontSize: 12 },
                timePeriod === period ? { color: theme.colors.primaryContrast } : { color: theme.colors.textSecondary },
              ]}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Gifted Line Chart */}
      <View style={styles.chartContainer}>
         {formattedIncomeData.length > 0 || formattedExpenseData.length > 0 ? (
            <LineChart
               areaChart // Optional: fill area below line
               curved // Make lines smooth
               data={formattedIncomeData}
               data2={formattedExpenseData}
               height={200}
               // Styling based on theme and inspiration
               color1={theme.colors.success} // Income color
               color2={theme.colors.error} // Expense color
               startFillColor1={theme.colors.success + '40'} // Area fill
               endFillColor1={theme.colors.success + '10'}
               startFillColor2={theme.colors.error + '40'} // Area fill
               endFillColor2={theme.colors.error + '10'}
               dataPointsColor1={theme.colors.success} // Dots on line
               dataPointsColor2={theme.colors.error}
               // Axes styling
               xAxisColor={theme.colors.border}
               yAxisColor={theme.colors.border}
               xAxisLabelTextStyle={{ color: theme.colors.textSecondary, fontSize: 10 }}
               yAxisLabelTextStyle={{ color: theme.colors.textSecondary, fontSize: 10 }}
               yAxisTextStyle={{ color: theme.colors.textSecondary, fontSize: 10 }}
               rulesColor={theme.colors.border + '50'} // Grid lines
               rulesType="dashed"
               // Tooltips / Pointer
               pointerConfig={{
                 pointerStripHeight: 160,
                 pointerStripColor: theme.colors.primary + '20',
                 pointerStripWidth: 2,
                 pointerColor: theme.colors.primary,
                 radius: 6,
                 pointerLabelWidth: 100,
                 pointerLabelHeight: 90,
                 activatePointersOnLongPress: true,
                 autoAdjustPointerLabelPosition: false,
                 pointerLabelComponent: (items: any[]) => {
                   // Custom tooltip component
                   return (
                     <View style={[styles.tooltipContainer, { backgroundColor: theme.colors.surface }]}>
                       <Text style={{ color: theme.colors.textSecondary, fontSize: 10 }}>{items[0]?.label}</Text>
                       <Text style={[styles.tooltipText, { color: theme.colors.success }]}>Inc: {formatCurrency(items[0]?.value)}</Text>
                       {items[1] && <Text style={[styles.tooltipText, { color: theme.colors.error }]}>Exp: {formatCurrency(items[1]?.value)}</Text>}
                     </View>
                   );
                 },
               }}
               // Add more props for fine-tuning appearance & animation
            />
         ) : (
             <Text style={{color: theme.colors.textSecondary, textAlign: 'center', marginTop: 50}}>No spending data available for this period.</Text>
         )}

      </View>
       {/* Legend */}
       <View style={styles.legendContainer}>
           <View style={styles.legendItem}>
               <View style={[styles.legendColorBox, {backgroundColor: theme.colors.success}]} />
               <Text style={[styles.legendText, { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular }]}>Income</Text>
           </View>
           <View style={styles.legendItem}>
               <View style={[styles.legendColorBox, {backgroundColor: theme.colors.error}]} />
               <Text style={[styles.legendText, { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular }]}>Expenses</Text>
           </View>
       </View>
    </Cards>
  );
}

// Add/Update Styles (similar to previous SpendingTrends, adjust as needed)
const styles = StyleSheet.create({
    container: { /* Uses Cards styles */ },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 18 },
    buttonGroup: { flexDirection: 'row', borderRadius: 8, borderWidth: 1, overflow: 'hidden' },
    button: { paddingVertical: 6, paddingHorizontal: 12, borderLeftWidth: 1 },
    buttonText: { fontSize: 12 },
    chartContainer: { height: 220, paddingVertical: 10, alignItems: 'center' }, // Adjust height as needed
    tooltipContainer: { padding: 6, borderRadius: 4, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)', elevation: 3 },
    tooltipText: { fontSize: 12, fontWeight: 'bold' },
    legendContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
    legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 },
    legendColorBox: { width: 10, height: 10, borderRadius: 2, marginRight: 5 },
    legendText: { fontSize: 12 },
});