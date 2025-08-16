import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
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
import Button from '@/components/common/Button';
import { exportToXLSX } from '@/utils/fileUtils';
import { Transaction } from '@/types';
import ScreenContainer from '@/components/ScreenContainer';

const { width: screenWidth } = Dimensions.get('window');

// Re-defining interface from your original file
interface ReportCardData {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  lastGenerated: string;
}

// Mock data for export demonstration
const mockTransactions: Transaction[] = [
    {
      id: '1', date: '2025-08-15', description: 'Monthly Salary', amount: 5000, type: 'income', category: 'Salary',
      accountId: '',
      title: '',
      time: '',
      status: 'completed'
    },
    {
      id: '2', date: '2025-08-15', description: 'Groceries', amount: -75.50, type: 'expense', category: 'Food',
      accountId: '',
      title: '',
      time: '',
      status: 'completed'
    },
    {
      id: '3', date: '2025-08-16', description: 'Stock Dividend', amount: 120, type: 'income', category: 'Investments',
      accountId: '',
      title: '',
      time: '',
      status: 'completed'
    },
    {
      id: '4', date: '2025-08-17', description: 'Gasoline', amount: -50.00, type: 'expense', category: 'Transport',
      accountId: '',
      title: '',
      time: '',
      status: 'completed'
    },
    {
      id: '5', date: '2025-08-18', description: 'Dinner with friends', amount: -120.00, type: 'expense', category: 'Social',
      accountId: '',
      title: '',
      time: '',
      status: 'completed'
    },
];


export default function ReportsScreen() {
  const { colors, isDark } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const styles = createStyles(colors, screenWidth);

  const reportCards: ReportCardData[] = [
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
      lastGenerated: 'Yesterday',
    },
    {
      id: '3',
      title: 'Cash Flow Statement',
      description: 'Inflows and outflows of cash',
      icon: DollarSign,
      color: colors.warning,
      lastGenerated: '3 days ago',
    },
    {
      id: '4',
      title: 'Expense Breakdown',
      description: 'Spending by category',
      icon: PieChart,
      color: colors.error,
      lastGenerated: 'This morning',
    },
  ];

  const timePeriods = ['Today', 'This Week', 'This Month', 'This Year'];

  const handleExport = () => {
    exportToXLSX(mockTransactions, `Transaction_Report_${selectedPeriod.replace(' ', '_')}`);
  };

  return (
    <ScreenContainer>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View entering={FadeInUp.duration(500)}>
          <Text style={styles.headerTitle}>Financial Reports</Text>
          <Text style={styles.headerSubtitle}>
            Generate, view, and export your key financial statements.
          </Text>
        </Animated.View>

        <View style={styles.timeFilterContainer}>
          {timePeriods.map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.timeFilterButton,
                selectedPeriod === period && styles.timeFilterButtonSelected,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.timeFilterText,
                  selectedPeriod === period && styles.timeFilterTextSelected,
                ]}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Animated.View entering={FadeInUp.duration(500).delay(200)} style={styles.exportSection}>
            <Text style={styles.exportTitle}>Export Data</Text>
            <Text style={styles.exportSubtitle}>
                Download a spreadsheet of your transactions for the selected period.
            </Text>
            <Button
                title={`Export ${selectedPeriod} Report`}
                onPress={handleExport}
                icon="download"
            />
        </Animated.View>

        <View style={styles.reportList}>
          {reportCards.map((report, index) => (
            <Animated.View
              key={report.id}
              entering={FadeInUp.duration(500).delay(300 + index * 100)}
            >
              <TouchableOpacity style={styles.reportCard}>
                <View style={styles.reportIconContainer}>
                  <report.icon color={report.color} size={24} />
                </View>
                <View style={styles.reportInfo}>
                  <Text style={styles.reportTitle}>{report.title}</Text>
                  <Text style={styles.reportDescription}>{report.description}</Text>
                  <View style={styles.reportFooter}>
                     <Text style={styles.lastGenerated}>Last generated: {report.lastGenerated}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (colors: any, screenWidth: number) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 20,
      backgroundColor: colors.background,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 16,
    },
    headerSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 8,
      marginBottom: 24,
    },
    timeFilterContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 4,
      marginBottom: 24,
    },
    timeFilterButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: 'center',
    },
    timeFilterButtonSelected: {
      backgroundColor: colors.primary,
    },
    timeFilterText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    timeFilterTextSelected: {
      color: '#FFFFFF',
    },
    exportSection: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: colors.border,
    },
    exportTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    exportSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 16,
    },
    reportList: {
      gap: 16,
    },
    reportCard: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      gap: 16,
    },
    reportIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    reportInfo: {
      flex: 1,
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
      marginBottom: 12,
    },
    reportFooter: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 8,
    },
    lastGenerated: {
      fontSize: 12,
      color: colors.textSecondary,
    },
});