import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeProvider';

const { width } = Dimensions.get('window');

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  lastGenerated: string;
}

export default function ReportsScreen() {
  const { colors, isDark } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');

  const styles = createStyles(colors, width);

  const reportCards: ReportCard[] = [
    {
      id: '1',
      title: 'Profit & Loss',
      description: 'Revenue and expense summary',
      icon: TrendingUp,
      color: colors.success,
      lastGenerated: '2 hours ago',
    },
    {
      id: '2',
      title: 'Balance Sheet',
      description: 'Assets, liabilities, and equity',
      icon: BarChart3,
      color: colors.primary,
      lastGenerated: '1 day ago',
    },
    {
      id: '3',
      title: 'Cash Flow',
      description: 'Money in and out analysis',
      icon: DollarSign,
      color: colors.warning,
      lastGenerated: '3 hours ago',
    },
    {
      id: '4',
      title: 'Expense Analysis',
      description: 'Category breakdown and trends',
      icon: PieChart,
      color: '#8b5cf6',
      lastGenerated: '5 hours ago',
    },
  ];

  const periods = ['This Week', 'This Month', 'This Quarter', 'This Year'];

  const renderReportCard = (report: ReportCard, index: number) => {
    const IconComponent = report.icon;

    return (
      <Animated.View
        key={report.id}
        entering={FadeInUp.delay(200 + index * 100)
          .duration(600)
          .springify()}
        style={styles.reportCard}
      >
        <TouchableOpacity
          style={styles.reportContent}
          activeOpacity={0.7}
          onPress={() => console.log(`Generate ${report.title}`)}
        >
          <View style={styles.reportHeader}>
            <View style={[styles.reportIcon, { backgroundColor: `${report.color}20` }]}>
              <IconComponent size={24} color={report.color} />
            </View>
            <TouchableOpacity style={styles.downloadButton} activeOpacity={0.7}>
              <Download size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.reportTitle}>{report.title}</Text>
          <Text style={styles.reportDescription}>{report.description}</Text>
          
          <View style={styles.reportFooter}>
            <Text style={styles.lastGenerated}>
              Last generated: {report.lastGenerated}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
        <TouchableOpacity style={styles.calendarButton} activeOpacity={0.7}>
          <Calendar size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          entering={FadeInUp.delay(100).springify()}
          style={styles.periodSelector}
        >
          <Text style={styles.periodLabel}>Period:</Text>
          <View style={styles.periodButtons}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.activePeriodButton,
                ]}
                onPress={() => setSelectedPeriod(period)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === period && styles.activePeriodButtonText,
                  ]}
                >
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <View style={styles.reportsGrid}>
          {reportCards.map((report, index) => renderReportCard(report, index))}
        </View>

        <Animated.View
          entering={FadeInUp.delay(600).springify()}
          style={styles.quickStatsCard}
        >
          <Text style={styles.quickStatsTitle}>Quick Stats - {selectedPeriod}</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>$12,450</Text>
              <Text style={styles.statLabel}>Total Revenue</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>$8,230</Text>
              <Text style={styles.statLabel}>Total Expenses</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.success }]}>$4,220</Text>
              <Text style={styles.statLabel}>Net Profit</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>34%</Text>
              <Text style={styles.statLabel}>Profit Margin</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, screenWidth: number) => {
  const cardWidth = (screenWidth - 52) / 2;

  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: { fontSize: 24, fontWeight: '700', color: colors.text },
    calendarButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollView: { flex: 1 },
    scrollContent: {
      paddingBottom: 100,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    periodSelector: { marginBottom: 24 },
    periodLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    periodButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    periodButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.surfaceVariant,
      minWidth: 80,
      alignItems: 'center',
    },
    activePeriodButton: { backgroundColor: colors.primary },
    periodButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    activePeriodButtonText: { color: colors.surface },
    reportsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 16,
      marginBottom: 24,
    },
    reportCard: {
      width: cardWidth,
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    reportContent: {
      padding: 20,
    },
    reportHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    reportIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    downloadButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
    },
    reportTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    reportDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 16,
    },
    reportFooter: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 12,
    },
    lastGenerated: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    quickStatsCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    quickStatsTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 16,
    },
    statItem: {
      width: (screenWidth - 92) / 2,
      alignItems: 'center',
      paddingVertical: 12,
    },
    statValue: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
};
