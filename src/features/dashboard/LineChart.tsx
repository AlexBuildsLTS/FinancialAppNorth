// src/components/dashboard/LineChart.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart as GiftedLineChart } from 'react-native-gifted-charts';
import { useTheme } from '@/shared/context/ThemeProvider';

interface ChartProps { // Define ChartProps interface
  title: string;
  data: Array<{ value: number; label?: string; dataPointText?: string }>; // Use a more specific type for data
}

const LineChart = ({ title, data }: ChartProps) => {
  const { theme: { colors } } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <GiftedLineChart
        data={data}
        isAnimated
        animationDuration={1200}
        color={colors.accent}
        thickness={3}
        yAxisTextStyle={{ color: colors.textSecondary }}
        xAxisLabelTextStyle={{ color: colors.textSecondary }}
        rulesColor={colors.border}
        dataPointsColor={colors.accent}
        pointerConfig={{
          pointerStripColor: colors.accent,
          pointerStripWidth: 2,
          strokeDashArray: [2, 5],
          pointerColor: colors.background,
          radius: 6,
          pointerLabelWidth: 100,
          pointerLabelHeight: 90,
          activatePointersOnLongPress: true,
          autoAdjustPointerLabelPosition: true,
          pointerLabelComponent: (items: Array<{ label: string; value: number | null }>) => {
            return (
              <View style={[styles.tooltip, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={{ color: colors.textPrimary, fontWeight: 'bold' }}>{items[0].label}</Text>
                <Text style={{ color: colors.accent }}> 
                  Value: {items[0].value?.toLocaleString()}
                </Text>
              </View>
            );
          },
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  tooltip: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
});

export default LineChart;
