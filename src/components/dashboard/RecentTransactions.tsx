import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useTransactions } from '@/hooks/useTransactions'; // Assuming you have this hook
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react-native';
import Card from '@/components/common/Card';

export default function RecentTransactions() {
  const { colors } = useTheme();
  const { transactions } = useTransactions();
  
  // Get the 5 most recent transactions
  const recent = transactions.slice(0, 5);

  const renderItem = ({ item }: any) => {
    const isIncome = item.type === 'income';
    const Icon = isIncome ? ArrowUpCircle : ArrowDownCircle;
    const amountColor = isIncome ? colors.success : colors.text;

    return (
      <View style={[styles.itemContainer, { borderBottomColor: colors.border }]}>
        <View style={styles.leftContent}>
            <Icon color={isIncome ? colors.success : colors.error} size={32} />
            <View>
                <Text style={[styles.description, { color: colors.text }]}>{item.description}</Text>
                <Text style={[styles.category, { color: colors.textSecondary }]}>{item.category}</Text>
            </View>
        </View>
        <Text style={[styles.amount, { color: amountColor }]}>
          {isIncome ? '+' : '-'}${Math.abs(item.amount).toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <Card style={styles.container}>
      {recent.length > 0 ? (
        <FlatList
            data={recent}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false} // The parent ScrollView handles scrolling
        />
      ) : (
        <Text style={{color: colors.textSecondary, textAlign: 'center', padding: 20}}>No recent transactions.</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    padding: 0, // Padding will be handled by list items
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
  },
  category: {
    fontSize: 14,
    marginTop: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});