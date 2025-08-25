import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useTheme } from '@/context/ThemeProvider';
import { useChartData } from '@/hooks/useChartData';
import Card from '@/components/common/Card';
import { BarChart3 } from 'lucide-react-native';

export default function ChartSection() {
    const { colors, isDark } = useTheme();
    const { chartData } = useChartData();

    // Use primary accent color for the chart based on the theme
    const chartColor = isDark ? colors.primary : colors.secondary; // Green for dark, Blue for light

    return (
        <Card style={styles.container}>
            <View style={styles.header}>
                <BarChart3 color={colors.textSecondary} size={20} />
                <Text style={[styles.title, { color: colors.text }]}>Cash Flow Analysis</Text>
            </View>
            <LineChart
                data={chartData}
                height={200}
                spacing={32}
                initialSpacing={10}
                endSpacing={10}
                
                // Styling
                color1={chartColor}
                textColor1={colors.text}
                textShiftY={-8}
                textShiftX={-10}
                textFontSize={12}
                
                // Data points
                dataPointsHeight={6}
                dataPointsWidth={6}
                dataPointsColor1={chartColor}

                // Axis
                xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
                yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
                xAxisColor={colors.border}
                yAxisColor={colors.border}
                
                // Area Chart
                areaChart
                startFillColor1={chartColor}
                endFillColor1={isDark ? colors.background : colors.surface}
                startOpacity={0.4}
                endOpacity={0.1}

                // Pointer
                pointerConfig={{
                    pointerStripHeight: 160,
                    pointerStripColor: colors.textSecondary,
                    pointerStripWidth: 2,
                    pointerColor: colors.textSecondary,
                    radius: 6,
                    pointerLabelWidth: 100,
                    pointerLabelHeight: 90,
                    activatePointersOnLongPress: true,
                    autoAdjustPointerLabelPosition: false,
                    pointerLabelComponent: (items: any) => (
                        <View style={[styles.pointerLabel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{items[0].date}</Text>
                            <Text style={[styles.pointerValue, { color: chartColor }]}>${items[0].value.toFixed(2)}k</Text>
                        </View>
                    ),
                }}
            />
        </Card>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginTop: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    pointerLabel: {
        height: 50,
        width: 100,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
        borderWidth: 1,
    },
    pointerValue: {
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 4,
    },
});