import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { VictoryPie, VictoryLabel, VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native';
import { useTheme } from '@/context/ThemeProvider';
import { useTransactions } from '@/hooks/useTransactions'; // Corrected import path
import ScreenContainer from '@/components/ScreenContainer';
import { Card } from '@/components/common/Card'; // use named import
import { ArrowUp, ArrowDown } from 'lucide-react-native';

const categoryColors: { [key: string]: string } = {
  Groceries: '#FF6384', Transportation: '#36A2EB', 'Food & Dining': '#FFCE56',
  Housing: '#4BC0C0', Salary: '#9966FF', Other: '#C9CBCF',
};

const MetricCard = ({ title, value, icon: Icon, color }: any) => {
    const { colors } = useTheme();
    return (
        <Card style={styles.metricCard}>
            <Icon color={color || colors.primary} size={24} />
            <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
            <Text style={[styles.metricTitle, { color: colors.textSecondary }]}>{title}</Text>
        </Card>
    );
}

const processAnalytics = (rawData: any) => {
	return {
		totalIncome: 0,
		totalExpenses: 0,
		expenseByCategory: [],
		incomeVsExpenseData: [],
		// ...other derived metrics...
	};
};

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const { transactions, isLoading } = useTransactions();
  
  if (isLoading) {
    return <ScreenContainer style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></ScreenContainer>;
  }

  const analyticsData = processAnalytics(transactions);

  return (
    <ScreenContainer>
        <View style={styles.header}><Text style={[styles.title, { color: colors.text }]}>Analytics</Text></View>
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.metricsGrid}>
                <MetricCard title="Total Income" value={`$${analyticsData.totalIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}`} icon={ArrowUp} color={colors.success} />
                <MetricCard title="Total Expenses" value={`$${analyticsData.totalExpenses.toLocaleString(undefined, {minimumFractionDigits: 2})}`} icon={ArrowDown} color={colors.error} />
            </View>

            <Card>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Expense Breakdown</Text>
                {analyticsData.expenseByCategory.length > 0 ? (
                    <VictoryPie
                        data={analyticsData.expenseByCategory}
                        x="category"
                        y="amount"
                        colorScale={analyticsData.expenseByCategory.map((d: { category: string | number; }) => categoryColors[d.category] || categoryColors.Other)}
                        width={Dimensions.get('window').width - 64}
                        height={250}
                        innerRadius={60}
                        labelComponent={<VictoryLabel style={{ fill: colors.text, fontSize: 12 }} />}
                        animate={{ duration: 500 }}
                    />
                ) : <Text style={{color: colors.textSecondary, textAlign: 'center', paddingVertical: 40}}>No expense data available to display chart.</Text>}
            </Card>

             <Card>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Cash Flow</Text>
                 {analyticsData.incomeVsExpenseData.length > 0 ? (
                    <VictoryChart theme={VictoryTheme.material} domainPadding={{ x: 20 }} height={250}>
                        <VictoryBar
                            data={analyticsData.incomeVsExpenseData}
                            x="month"
                            y={(d) => d.income - d.expenses}
                            style={{ data: { fill: ({ datum }) => (datum.income - datum.expenses >= 0 ? colors.success : colors.error) } }}
                            animate={{ duration: 500 }}
                            cornerRadius={{ topLeft: 4, topRight: 4 }}
                        />
                        <VictoryAxis style={{ tickLabels: { fill: colors.textSecondary, fontSize: 10 }, axis: {stroke: 'transparent'} }} />
                        <VictoryAxis dependentAxis style={{ tickLabels: { fill: colors.textSecondary, fontSize: 10 }, grid: {stroke: colors.border, strokeDasharray: '4, 8'}, axis: {stroke: 'transparent'} }} />
                    </VictoryChart>
                 ) : <Text style={{color: colors.textSecondary, textAlign: 'center', paddingVertical: 40}}>No cash flow data available to display chart.</Text>}
            </Card>
        </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
    centered: { justifyContent: 'center', alignItems: 'center' },
    header: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10 },
    title: { fontSize: 32, fontWeight: 'bold' },
    container: { padding: 16, paddingBottom: 50, gap: 16 },
    metricsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
    metricCard: { flex: 1, padding: 16, alignItems: 'center' },
    metricValue: { fontSize: 22, fontWeight: 'bold', marginVertical: 8 },
    metricTitle: { fontSize: 12 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
});
