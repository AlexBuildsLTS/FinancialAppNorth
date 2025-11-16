import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { getMonthlyCashFlow, ChartDataPoint } from '@/features/dashboard/services/analyticsService';
import { Cards } from '@/components/Cards';
import { BarChart3 } from 'lucide-react-native';

export default function ChartSection({ userId }: { userId?: string }) {
    const { theme: { colors }, isDark } = useTheme();
    const { session } = useAuth();
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const targetUserId = userId || session?.user?.id;
        if (targetUserId) {
            setLoading(true);
            getMonthlyCashFlow(targetUserId)
                .then(setChartData)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [session, userId]);

    const chartColor = isDark ? colors.accent : colors.accent;

    return (
        <Cards style={styles.container}>
            <View style={styles.header}>
                <BarChart3 color={colors.textSecondary} size={22} />
                <Text style={[styles.title, { color: colors.textPrimary }]}>Cash Flow Analysis</Text>
            </View>
            {loading ? (
                <View style={styles.placeholder}>
                    <ActivityIndicator size="large" color={chartColor} />
                </View>
            ) : chartData.length > 1 ? ( // Require at least 2 data points to draw a line
                <LineChart
                    data={chartData}
                    height={220}
                    spacing={45}
                    initialSpacing={15}
                    endSpacing={15}
                    color1={chartColor}
                    textColor1={colors.textPrimary}
                    textShiftY={-8}
                    textShiftX={-10}
                    textFontSize={13}
                    dataPointsHeight={6}
                    dataPointsWidth={6}
                    dataPointsColor1={chartColor}
                    xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 11, fontFamily: 'Inter-Regular' }}
                    yAxisTextStyle={{ color: colors.textSecondary, fontSize: 11, fontFamily: 'Inter-Regular' }}
                    xAxisColor={colors.border}
                    yAxisColor={colors.border}
                    areaChart
                    startFillColor1={chartColor}
                    endFillColor1={isDark ? colors.background : colors.surface}
                    startOpacity={0.3}
                    endOpacity={0.05}
                    pointerConfig={{
                        pointerStripHeight: 180,
                        pointerStripColor: chartColor,
                        pointerStripWidth: 2,
                        pointerColor: chartColor,
                        radius: 6,
                        pointerLabelWidth: 100,
                        pointerLabelHeight: 50,
                        activatePointersOnLongPress: true,
                        autoAdjustPointerLabelPosition: true,
                        pointerLabelComponent: (items: any) => (
                            <View style={[styles.pointerLabel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Text style={{ color: colors.textSecondary, fontSize: 12, fontFamily: 'Inter-Regular' }}>{items[0].date}</Text>
                                <Text style={[styles.pointerValue, { color: chartColor }]}>${items[0].value.toFixed(2)}k</Text>
                            </View>
                        ),
                    }}
                />
            ) : (
                <View style={styles.placeholder}>
                    <Text style={{ color: colors.textSecondary, fontFamily: 'Inter-Regular' }}>Not enough data to display chart.</Text>
                </View>
            )}
        </Cards>
    );
}

const styles = StyleSheet.create({
    container: { marginHorizontal: 16, marginTop: 20, padding: 20 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 10 },
    title: { fontSize: 20, fontWeight: 'bold', fontFamily: 'Inter-Bold' },
    placeholder: { height: 220, justifyContent: 'center', alignItems: 'center' },
    pointerLabel: { height: 50, width: 110, borderRadius: 12, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10, borderWidth: 1, },
    pointerValue: { fontFamily: 'Inter-Bold', fontSize: 16, marginTop: 4 },
});
