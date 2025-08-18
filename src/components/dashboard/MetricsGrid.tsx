import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { DollarSign, TrendingUp, TrendingDown, Target, LucideIcon } from 'lucide-react-native';

interface Metric {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: LucideIcon;
}

const { width } = Dimensions.get('window');

export default function MetricsGrid() {
  const { colors, isDark } = useTheme();

  const METRICS_DATA: Metric[] = [
    {
      id: '1',
      title: 'Total Balance',
      value: '$124,592',
      change: '+12.5%',
      isPositive: true,
      icon: DollarSign,
    },
    {
      id: '2',
      title: 'Monthly Income',
      value: '$8,450',
      change: '+8.2%',
      isPositive: true,
      icon: TrendingUp,
    },
    {
      id: '3',
      title: 'Monthly Expenses',
      value: '$5,230',
      change: '-3.1%',
      isPositive: false,
      icon: TrendingDown,
    },
    {
      id: '4',
      title: 'Savings Goal',
      value: '62%',
      change: '+5%',
      isPositive: true,
      icon: Target,
    },
  ];

  const styles = createStyles(colors, width);

  const renderMetric = (item: Metric, index: number) => {
    const IconComponent = item.icon;
    const changeBgColor = item.isPositive
      ? `${colors.success}20`
      : `${colors.error}20`;
    const changeTextColor = item.isPositive ? colors.success : colors.error;
    const iconColor = colors.primary;

    return (
      <Animated.View
        key={item.id}
        entering={FadeInUp.delay(index * 100)
          .duration(600)
          .springify()}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
            <IconComponent size={24} color={iconColor} />
          </View>
          <View style={[styles.changeContainer, { backgroundColor: changeBgColor }]}>
            <Text style={[styles.changeText, { color: changeTextColor }]}>
              {item.change}
            </Text>
          </View>
        </View>
        <Text style={styles.value}>{item.value}</Text>
        <Text style={styles.title}>{item.title}</Text>
      </Animated.View>
    );
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Financial Overview</Text>
      <View style={styles.grid}>
        {METRICS_DATA.map((item, index) => renderMetric(item, index))}
      </View>
    </View>
  );
}

const createStyles = (colors: any, screenWidth: number) => {
  const cardWidth = (screenWidth - 48) / 2; // Account for padding and gap
  
  return StyleSheet.create({
    sectionTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 16,
    },
    card: {
      width: cardWidth,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          boxboxShadowdowColor: '#000',
          boxboxShadowdowOffset: { width: 0, height: 2 },
          boxboxShadowdowOpacity: 0.1,
          boxboxShadowdowRadius: 8,
        },
        android: {
          elevation: 4,
        },
        web: {
          boxboxboxShadowdow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      }),
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    changeContainer: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    changeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    value: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 4,
    },
    title: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
    },
  });
};
