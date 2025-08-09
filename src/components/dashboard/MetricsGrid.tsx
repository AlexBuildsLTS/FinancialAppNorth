import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { DollarSign, TrendingUp, TrendingDown, Users } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
// Calculate width for two columns with a 16px gap, respecting container padding
const cardWidth = (width - 16 * 3) / 2;

const MetricCard = ({ icon: Icon, title, value, change, isPositive, index }: { icon: any, title: string, value: string, change: string, isPositive: boolean, index: number }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const changeColor = isPositive ? colors.success : colors.error;

  return (
    <Animated.View entering={FadeInUp.delay(index * 100).springify()} style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: `${changeColor}20` }]}>
        <Icon color={changeColor} size={22} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        <Text style={[styles.change, { color: changeColor }]}>{change}</Text>
      </View>
    </Animated.View>
  );
};

export default function MetricsGrid() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const metrics = [
    { id: '1', icon: DollarSign, title: "Total Balance", value: "$124,592", change: "+12.5%", isPositive: true },
    { id: '2', icon: TrendingUp, title: "Monthly Income", value: "$8,450", change: "+8.2%", isPositive: true },
    { id: '3', icon: TrendingDown, title: "Monthly Expenses", value: "$5,230", change: "-3.1%", isPositive: false },
    { id: '4', icon: Users, title: "Active Clients", value: "47", change: "+2", isPositive: true },
  ];

  return (
    <View>
      <Text style={styles.header}>Financial Overview</Text>
      <View style={styles.grid}>
        {metrics.map((metric, index) => (
          <MetricCard key={metric.id} {...metric} index={index} />
        ))}
      </View>
    </View>
  );
}

const createStyles = (colors: { background?: string; surface: any; surfaceVariant?: string; text: any; textSecondary: any; border: any; primary?: string; success?: string; warning?: string; error?: string; tabBarActive?: string; tabBarInactive?: string; }) => StyleSheet.create({
  header: { fontFamily: 'Inter-Bold', fontSize: 22, color: colors.text, marginBottom: 16 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    width: cardWidth,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  value: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: colors.text,
  },
  change: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    marginBottom: 2,
  },
});