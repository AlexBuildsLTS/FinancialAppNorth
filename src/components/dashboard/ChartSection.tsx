import { Card } from '@/components/common';
import { useTheme } from '@/context/ThemeProvider';
import { BarChart3 } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

type ChartDataPoint = {
  value: number;
  label: string;
};

// Component now receives props, making it a pure "presentational" component.
interface ChartSectionProps {
  chartData: ChartDataPoint[];
  isLoading: boolean;
}

const ChartSection: React.FC<ChartSectionProps> = ({ chartData, isLoading }) => {
  const { colors, isDark } = useTheme();
  const chartColor = colors.primary;

  const renderChart = () => {
    if (chartData.length < 2) {
      return (
        <View style={styles.placeholder}>
          <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
            Not enough data to display chart.
          </Text>
        </View>
      );
    }
    
    return (
      <LineChart
        data={chartData}
        height={200}
        spacing={45}
        initialSpacing={10}
        color={chartColor}
        textColor={colors.text}
        textShiftY={-8}
        textShiftX={-10}
        textFontSize={12}
        dataPointsHeight={6}
        dataPointsWidth={6}
        dataPointsColor={chartColor}
        xAxisLabelTextStyle={[styles.axisLabel, { color: colors.textSecondary }]}
        yAxisTextStyle={[styles.axisLabel, { color: colors.textSecondary }]}
        xAxisColor={colors.border}
        yAxisColor={colors.border}
        areaChart
        startFillColor={chartColor}
        endFillColor={isDark ? colors.background : colors.surface}
        startOpacity={0.4}
        endOpacity={0.1}
        pointerConfig={{
          pointerStripHeight: 160,
          pointerStripColor: chartColor,
          pointerStripWidth: 2,
          pointerColor: chartColor,
          radius: 6,
          pointerLabelWidth: 100,
          pointerLabelHeight: 50, // Adjusted for better fit
          activatePointersOnLongPress: true,
          autoAdjustPointerLabelPosition: false,
          pointerLabelComponent: (items: ChartDataPoint[]) => (
            <View style={[styles.pointerLabel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.pointerDate, { color: colors.textSecondary }]}>{items[0].label}</Text>
              <Text style={[styles.pointerValue, { color: chartColor }]}>
                ${items[0].value.toFixed(2)}k
              </Text>
            </View>
          ),
        }}
      />
    );
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <BarChart3 color={colors.textSecondary} size={20} />
        <Text style={[styles.title, { color: colors.text }]}>Cash Flow Analysis</Text>
      </View>
      {isLoading ? (
        <View style={styles.placeholder}>
          <ActivityIndicator size="large" color={chartColor} />
        </View>
      ) : (
        renderChart()
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: { 
    marginHorizontal: 16, 
    marginTop: 16, 
    padding: 16 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20, 
    gap: 8 
  },
  title: { 
    fontSize: 18, 
    fontFamily: 'Inter_600SemiBold'
  },
  placeholder: { 
    height: 220, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  placeholderText: {
    fontFamily: 'Inter_400Regular',
  },
  axisLabel: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
  },
  pointerLabel: { 
    height: 50, 
    width: 100, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 4,
    borderWidth: 1, 
  },
  pointerDate: {
    fontSize: 12, 
    fontFamily: 'Inter_400Regular'
  },
  pointerValue: { 
    fontFamily: 'Inter_700Bold', 
    fontSize: 16, 
    marginTop: 4 
  },
});

export default React.memo(ChartSection);