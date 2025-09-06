import { useTheme } from '@/context/ThemeProvider';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LineChart as GiftedLineChart, lineDataItem } from 'react-native-gifted-charts';

interface ChartProps {
  title: string;
  data: Array<lineDataItem>;
}

const LineChart: React.FC<ChartProps> = ({ title, data }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <GiftedLineChart
        data={data}
        isAnimated
        animationDuration={1200}
        color={colors.primary}
        thickness={3}
        yAxisTextStyle={{ color: colors.textSecondary, fontFamily: 'Inter_400Regular' }}
        xAxisLabelTextStyle={{ color: colors.textSecondary, fontFamily: 'Inter_400Regular' }}
        rulesColor={colors.border}
        dataPointsColor={colors.primary}
        pointerConfig={{
          pointerStripColor: colors.primary,
          pointerStripWidth: 2,
          strokeDashArray: [2, 5],
          pointerColor: colors.background,
          radius: 6,
          pointerLabelWidth: 100,
          pointerLabelHeight: 90,
          activatePointersOnLongPress: true,
          autoAdjustPointerLabelPosition: true,
          pointerLabelComponent: (items: lineDataItem[]) => {
            if (!items[0]) return null;
            return (
              <View style={[styles.tooltip, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.tooltipLabel, { color: colors.text }]}>{items[0].label}</Text>
                <Text style={[styles.tooltipValue, { color: colors.primary }]}> 
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
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 20,
  },
  tooltip: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  tooltipLabel: {
    fontFamily: 'Inter_600SemiBold'
  },
  tooltipValue: {
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  }
});

export default React.memo(LineChart);