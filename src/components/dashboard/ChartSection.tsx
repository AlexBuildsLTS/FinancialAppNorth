import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { getMonthlyCashFlow, ChartDataPoint } from '@/services/analyticsService';
import { Card } from '@/components/common';
import { BarChart3 } from 'lucide-react-native';

export default function ChartSection({ userId }: { userId?: string }) {
    const { colors, isDark } = useTheme();
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

    const chartColor = isDark ? colors.primary : colors.secondary;

    return (
        <Card style={styles.container}>
            <View style={styles.header}>
                <BarChart3 color={colors.textSecondary} size={20} />
                <Text style={[styles.title, { color: colors.text }]}>Cash Flow Analysis</Text>
            </View>
            {loading ? (
                <View style={styles.placeholder}>
                    <ActivityIndicator size="large" color={chartColor} />
                </View>
            ) : chartData.length > 1 ? ( // Require at least 2 data points to draw a line
                <LineChart
                    data={chartData}
                    height={200}
                    spacing={38}
                    initialSpacing={10}
                    endSpacing={10}
                    color1={chartColor}
                    textColor1={colors.text}
                    textShiftY={-8}
                    textShiftX={-10}
                    textFontSize={12}
                    dataPointsHeight={6}
                    dataPointsWidth={6}
                    dataPointsColor1={chartColor}
                    xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10, fontFamily: 'Inter-Regular' }}
                    yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10, fontFamily: 'Inter-Regular' }}
                    xAxisColor={colors.border}
                    yAxisColor={colors.border}
                    areaChart
                    startFillColor1={chartColor}
                    endFillColor1={isDark ? colors.background : colors.surface}
                    startOpacity={0.4}
                    endOpacity={0.1}
                    pointerConfig={{
                        pointerStripHeight: 160,
                        pointerStripColor: chartColor,
                        pointerStripWidth: 2,
                        pointerColor: chartColor,
                        radius: 6,
                        pointerLabelWidth: 100,
                        pointerLabelHeight: 90,
                        activatePointersOnLongPress: true,
                        autoAdjustPointerLabelPosition: false,
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
                    <Text style={{color: colors.textSecondary, fontFamily: 'Inter-Regular'}}>Not enough data to display chart.</Text>
                </View>
            )}
        </Card>
    );
}

const styles = StyleSheet.create({
    container: { marginHorizontal: 16, marginTop: 16 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 8 },
    title: { fontSize: 18, fontWeight: '600', fontFamily: 'Inter-Bold' },
    placeholder: { height: 220, justifyContent: 'center', alignItems: 'center' },
    pointerLabel: { height: 50, width: 100, borderRadius: 12, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8, borderWidth: 1, },
    pointerValue: { fontFamily: 'Inter-Bold', fontSize: 16, marginTop: 4 },
});
