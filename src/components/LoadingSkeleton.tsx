import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface SkeletonProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  style?: any;
}

function SkeletonItem({ width: itemWidth, height, borderRadius = 8, style }: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(opacity.value, [0.3, 1], [0.3, 0.7]),
  }));

  return (
    <Animated.View
      style={[
        {
          width: itemWidth,
          height,
          borderRadius,
          backgroundColor: colors.surfaceVariant,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function DashboardSkeleton() {
  const { colors } = useTheme();
  const styles = createStyles(colors, width);

  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.headerSkeleton}>
        <SkeletonItem width={200} height={32} borderRadius={8} />
        <SkeletonItem width={80} height={24} borderRadius={12} />
      </View>

      {/* Metrics Grid Skeleton */}
      <View style={styles.metricsGrid}>
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <SkeletonItem width={48} height={48} borderRadius={24} />
              <SkeletonItem width={60} height={20} borderRadius={10} />
            </View>
            <SkeletonItem width={120} height={28} borderRadius={6} style={{ marginBottom: 8 }} />
            <SkeletonItem width={80} height={16} borderRadius={4} />
          </View>
        ))}
      </View>

      {/* Chart Skeleton */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <SkeletonItem width={120} height={20} borderRadius={6} />
          <SkeletonItem width={80} height={16} borderRadius={4} />
        </View>
        <SkeletonItem width={width - 64} height={200} borderRadius={12} />
      </View>

      {/* Quick Actions Skeleton */}
      <View style={styles.actionsGrid}>
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.actionCard}>
            <SkeletonItem width={56} height={56} borderRadius={28} style={{ marginBottom: 12 }} />
            <SkeletonItem width={80} height={16} borderRadius={4} />
          </View>
        ))}
      </View>
    </View>
  );
}

const createStyles = (colors: any, screenWidth: number) => {
  const cardWidth = (screenWidth - 48) / 2;
  const actionWidth = (screenWidth - 64) / 2;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    headerSkeleton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 16,
      marginBottom: 24,
    },
    metricCard: {
      width: cardWidth,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    metricHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    chartCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 24,
    },
    chartHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    actionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 16,
    },
    actionCard: {
      width: actionWidth,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      minHeight: 120,
      justifyContent: 'center',
    },
  });
};