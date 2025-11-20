import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { GlassCard } from '@/shared/components/GlassCard';
import { useTheme } from '@/shared/context/ThemeProvider';

interface Props {
  incomeData?: { value: number; label: string }[];
}

export const DashboardCharts = ({ incomeData = [] }: Props) => {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  
  const chartData = incomeData.length > 0 ? incomeData : [
    { value: 0, label: 'Mon' }, { value: 0, label: 'Tue' }, 
    { value: 0, label: 'Wed' }, { value: 0, label: 'Thu' },
    { value: 0, label: 'Fri' }, { value: 0, label: 'Sat' },
  ];

  return (
    <GlassCard intensity={40} style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Spending Trends</Text>
      </View>
      
      <View style={{ paddingVertical: 10, overflow: 'hidden', alignItems: 'center' }}>
        <LineChart
          data={chartData}
          areaChart
          curved
          isAnimated
          animationDuration={1200}
          startFillColor={theme.colors.primary}
          startOpacity={0.3}
          endOpacity={0.0}
          color={theme.colors.primary}
          thickness={3}
          dataPointsColor={theme.colors.primary}
          dataPointsRadius={4}
          hideRules
          xAxisColor="transparent"
          yAxisColor="transparent"
          yAxisTextStyle={{ color: theme.colors.textSecondary, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: theme.colors.textSecondary, fontSize: 10 }}
          width={280} 
          height={180}
          adjustToWidth
          pointerConfig={{
            pointerStripHeight: 160,
            pointerStripColor: theme.colors.border,
            pointerStripWidth: 2,
            pointerColor: theme.colors.primary,
            radius: 6,
            pointerLabelWidth: 100,
            pointerLabelHeight: 90,
            activatePointersOnLongPress: false,
            autoAdjustPointerLabelPosition: false,
            pointerComponent: (items: any) => {
              if (!items || !items[0]) return null;
              return (
                <View style={{
                  height: 50,
                  width: 80,
                  backgroundColor: '#172A45',
                  borderRadius: 8,
                  justifyContent:'center',
                  alignItems:'center',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.2)'
                }}>
                  <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>${items[0].value}</Text>
                </View>
              );
            },
          }}
        />
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: { padding: 20, borderRadius: 24, height: '100%' },
  header: { marginBottom: 20 },
  title: { fontSize: 16, fontWeight: '700' },
});