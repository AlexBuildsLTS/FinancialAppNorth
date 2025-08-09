import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import {
  VictoryChart,
  VictoryAxis,
  VictoryLine,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from 'victory-native';

const sampleData = [
  { x: 'Jan', y: 2000 },
  { x: 'Feb', y: 3500 },
  { x: 'Mar', y: 2800 },
  { x: 'Apr', y: 4200 },
  { x: 'May', y: 4800 },
  { x: 'Jun', y: 5500 },
];

export function ChartSection() {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Cash Flow</Text>
        <Text style={[styles.legend, { color: colors.textSecondary }]}>
          Last 6 Months
        </Text>
      </View>
      <VictoryChart
        height={250}
        padding={{ top: 40, bottom: 40, left: 50, right: 30 }}
        containerComponent={
          <VictoryVoronoiContainer
            voronoiDimension="x"
            labels={({ datum }) => `$${datum.y.toLocaleString()}`}
            labelComponent={
              <VictoryTooltip
                cornerRadius={6}
                flyoutStyle={{
                  fill: colors.surface,
                  stroke: colors.border,
                  strokeWidth: 1,
                }}
                style={{ fill: colors.text, fontSize: 12, fontWeight: 'bold' }}
              />
            }
          />
        }
      >
        <VictoryLine
          data={sampleData}
          style={{ data: { stroke: colors.primary, strokeWidth: 3 } }}
          animate={{ duration: 1000, onLoad: { duration: 500 } }}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={(tick) => `$${tick / 1000}k`}
          style={{
            axis: { stroke: 'transparent' },
            tickLabels: {
              fill: colors.textSecondary,
              fontSize: 10,
              padding: 5,
            },
            grid: { stroke: colors.border, strokeDasharray: '4, 4' },
          }}
        />
        <VictoryAxis
          style={{
            axis: { stroke: 'transparent' },
            tickLabels: {
              fill: colors.textSecondary,
              fontSize: 10,
              padding: 5,
            },
          }}
        />
      </VictoryChart>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 16, paddingTop: 16, borderWidth: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  legend: { fontSize: 14 },
});
