import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';

interface ProfitLossStatementProps {
  data: any; // This should be more specific based on the actual data structure
}

const ProfitLossStatement: React.FC<ProfitLossStatementProps> = ({ data }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  if (!data) {
    return <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 20 }}>No data available for Profit & Loss Statement.</Text>;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Profit & Loss Statement</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Revenue</Text>
        {data.revenues?.map((item: any) => (
          <View key={item.name} style={styles.row}>
            <Text style={[styles.itemText, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.itemValue, { color: colors.text }]}>{item.balance.toFixed(2)}</Text>
          </View>
        ))}
        <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.totalText, { color: colors.text }]}>Total Revenue</Text>
          <Text style={[styles.totalValue, { color: colors.text }]}>{data.totalRevenue?.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Expenses</Text>
        {data.expenses?.map((item: any) => (
          <View key={item.name} style={styles.row}>
            <Text style={[styles.itemText, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.itemValue, { color: colors.text }]}>{item.balance.toFixed(2)}</Text>
          </View>
        ))}
        <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.totalText, { color: colors.text }]}>Total Expenses</Text>
          <Text style={[styles.totalValue, { color: colors.text }]}>{data.totalExpenses?.toFixed(2)}</Text>
        </View>
      </View>

      <View style={[styles.netIncomeSection, { borderTopColor: colors.border }]}>
        <Text style={[styles.netIncomeText, { color: colors.text }]}>Net Income</Text>
        <Text style={[styles.netIncomeValue, { color: colors.text }]}>{data.netIncome?.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  itemText: {
    fontSize: 16,
  },
  itemValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    marginTop: 10,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  netIncomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderTopWidth: 2,
    marginTop: 20,
  },
  netIncomeText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  netIncomeValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default ProfitLossStatement;
