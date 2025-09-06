import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';

type ReportItem = { name: string; balance: number };
type BalanceSheetData = {
  assets?: ReportItem[];
  liabilities?: ReportItem[];
  equity?: ReportItem[];
  totalAssets?: number;
  totalLiabilities?: number;
  totalEquity?: number;
};

interface BalanceSheetProps {
  data: BalanceSheetData | null;
}

const BalanceSheet: React.FC<BalanceSheetProps> = ({ data }) => {
  const { colors } = useTheme();

  if (!data) {
    return <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 20 }}>No data available for Balance Sheet.</Text>;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Balance Sheet</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Assets</Text>
  {data.assets?.map((item: ReportItem) => (
          <View key={item.name} style={styles.row}>
            <Text style={[styles.itemText, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.itemValue, { color: colors.text }]}>{item.balance.toFixed(2)}</Text>
          </View>
        ))}
        <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.totalText, { color: colors.text }]}>Total Assets</Text>
          <Text style={[styles.totalValue, { color: colors.text }]}>{data.totalAssets?.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Liabilities</Text>
  {data.liabilities?.map((item: ReportItem) => (
          <View key={item.name} style={styles.row}>
            <Text style={[styles.itemText, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.itemValue, { color: colors.text }]}>{item.balance.toFixed(2)}</Text>
          </View>
        ))}
        <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.totalText, { color: colors.text }]}>Total Liabilities</Text>
          <Text style={[styles.totalValue, { color: colors.text }]}>{data.totalLiabilities?.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Equity</Text>
  {data.equity?.map((item: ReportItem) => (
          <View key={item.name} style={styles.row}>
            <Text style={[styles.itemText, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.itemValue, { color: colors.text }]}>{item.balance.toFixed(2)}</Text>
          </View>
        ))}
        <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.totalText, { color: colors.text }]}>Total Equity</Text>
          <Text style={[styles.totalValue, { color: colors.text }]}>{data.totalEquity?.toFixed(2)}</Text>
        </View>
      </View>

      <View style={[styles.finalTotalRow, { borderTopColor: colors.border }]}>
        <Text style={[styles.finalTotalText, { color: colors.text }]}>Liabilities & Equity</Text>
  <Text style={[styles.finalTotalValue, { color: colors.text }]}>{((data.totalLiabilities || 0) + (data.totalEquity || 0)).toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
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
  finalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderTopWidth: 2,
    marginTop: 20,
  },
  finalTotalText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  finalTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default BalanceSheet;
