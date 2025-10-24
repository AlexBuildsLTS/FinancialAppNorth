// src/features/dashboard/SpendingTrends.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// Assuming Card is correctly imported and fixed
import { Cards } from '@/shared/components/Cards';
// Import useTheme
import { useTheme } from '@/shared/context/ThemeProvider';
// Import Victory Native components
import { VictoryChart, VictoryLine, VictoryAxis, VictoryVoronoiContainer } from 'victory-native'; // Ensure victory-native is installed

// Mock data (Replace with your actual data fetching/hook)
const mockIncomeData = [
  { x: new Date(2025, 9, 1), y: 1000 },
  { x: new Date(2025, 9, 7), y: 1500 },
  { x: new Date(2025, 9, 14), y: 1200 },
  { x: new Date(2025, 9, 21), y: 2000 },
  { x: new Date(2025, 9, 28), y: 3500 },
];
const mockExpenseData = [
  { x: new Date(2025, 9, 1), y: 500 },
  { x: new Date(2025, 9, 7), y: 700 },
  { x: new Date(2025, 9, 14), y: 600 },
  { x: new Date(2025, 9, 21), y: 900 },
  { x: new Date(2025, 9, 28), y: 125.50 },
];

export function SpendingTrends() {
  // Get theme directly in this component
  const { theme } = useTheme();
  const [timePeriod, setTimePeriod] = React.useState('Month'); // Example state

  // Define chart styles using theme colors explicitly
  const chartTheme = {
    axis: {
      axis: { stroke: theme.colors.border, strokeWidth: 1 },
      tickLabels: { fill: theme.colors.textSecondary, fontSize: 10, padding: 5 },
      grid: { stroke: theme.colors.border + '50', strokeDasharray: '4, 4', strokeWidth: 0.5 },
    },
    line: {
      style: {
        data: { strokeWidth: 2 },
      },
    },
  };

  return (
    // Use the fixed Card component
    <Cards style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Spending Trends
        </Text>
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
                timePeriod === period ? { color: theme.colors.primaryContrast || '#FFFFFF' } : { color: theme.colors.textSecondary },
              ]}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.chartContainer}>
        {/* Pass explicit theme styles to Victory components */}
        <VictoryChart
          height={250}
          padding={{ top: 20, bottom: 40, left: 50, right: 30 }}
          containerComponent={
             <VictoryVoronoiContainer
                 voronoiDimension="x"
                 labels={({ datum }) => `$${datum.y.toFixed(2)}`}
                 // Style the tooltip here if needed using theme colors
             />
          }
        >
          {/* Apply themed styles to axes */}
          <VictoryAxis
            dependentAxis
            style={chartTheme.axis}
            tickFormat={(t) => `$${t / 1000}k`} // Example formatting
          />
          <VictoryAxis
            style={chartTheme.axis}
            tickFormat={(t) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} // Example date formatting
            fixLabelOverlap={true}
          />

          {/* Income Line */}
          <VictoryLine
            data={mockIncomeData}
            style={{ data: { stroke: theme.colors.success || '#1DB954' } }} // Use theme success color
            interpolation="natural" // Make line smooth
          />

          {/* Expense Line */}
          <VictoryLine
            data={mockExpenseData}
            style={{ data: { stroke: theme.colors.error || '#EF4444' } }} // Use theme error color
            interpolation="natural" // Make line smooth
          />
        </VictoryChart>
      </View>
      {/* Legend */}
       <View style={styles.legendContainer}>
           <View style={styles.legendItem}>
               <View style={[styles.legendColorBox, {backgroundColor: theme.colors.success || '#1DB954'}]} />
               <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Income</Text>
           </View>
           <View style={styles.legendItem}>
               <View style={[styles.legendColorBox, {backgroundColor: theme.colors.error || '#EF4444'}]} />
               <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Expenses</Text>
           </View>
       </View>
    </Cards>
  );
}

// Add necessary styles, using theme where appropriate
const styles = StyleSheet.create({
  container: {
    // marginBottom: 16, // Use Card's internal padding
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
  },
  buttonGroup: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  buttonText: {
    fontSize: 12,
  },
  chartContainer: {
     // Ensure chart doesn't overflow
     marginLeft: -10, // Adjust positioning if needed
     marginRight: -5,
  },
  legendContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 0, // Reduce space after chart
      marginBottom: 5, // Add space at bottom if needed
  },
  legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 10,
  },
  legendColorBox: {
      width: 10,
      height: 10,
      borderRadius: 2,
      marginRight: 5,
  },
  legendText: {
      fontSize: 12,
  }
});
