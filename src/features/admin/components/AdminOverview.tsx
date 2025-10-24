import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { Cards } from '@/shared/components/Cards';
import { Search, Filter, MoreVertical, UserPlus, Users, TrendingUp, DollarSign, Activity, Database, Clock, Server, HardDrive, Wifi, AlertTriangle, RefreshCw, Settings, MessageSquare, BarChart3, ShieldCheck, Download, Send } from 'lucide-react-native';
import { AdminUserManagement } from './AdminUserManagement';
import { AdminSystemSettings } from './AdminSystemSettings';
import { AdminFeatureManagement } from './AdminFeatureManagement';
import { AdminAuditLogs } from './AdminAuditLogs';
import { fetchAdminOverviewMetrics, fetchUserManagementData, fetchSystemHealthData, fetchUserGrowthData, fetchPlatformActivityData, fetchFeatureFlagData, fetchAuditLogData } from '../services/adminService'; // Import data fetching functions

interface MetricCardsProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  Icon: React.ComponentType<any>;
  colors: any;
}

const MetricCards: React.FC<MetricCardsProps> = ({ title, value, change, changeType, Icon, colors }) => (
  <Cards style={styles.metricCards}>
    <View style={styles.metricHeader}>
      <Icon size={20} color={colors.textSecondary} />
      {change && (
        <View style={[styles.changeContainer, { backgroundColor: changeType === 'positive' ? colors.success + '20' : colors.error + '20' }]}>
          <Text style={[styles.changeText, { color: changeType === 'positive' ? colors.success : colors.error }]}>{change}</Text>
        </View>
      )}
    </View>
    <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{value}</Text>
    <Text style={[styles.metricTitle, { color: colors.textSecondary }]}>{title}</Text>
  </Cards>
);

interface SystemHealthItemProps {
  label: string;
  value: string;
  status: 'optimal' | 'warning' | 'critical';
  Icon: React.ComponentType<any>;
  colors: any;
}

const SystemHealthItem: React.FC<SystemHealthItemProps> = ({ label, value, status, Icon, colors }) => {
  const statusColor = status === 'optimal' ? colors.success : status === 'warning' ? colors.warning : colors.error;
  return (
    <View style={styles.healthItem}>
      <Icon size={20} color={colors.textSecondary} />
      <Text style={[styles.healthLabel, { color: colors.textPrimary }]}>{label}</Text>
      <Text style={[styles.healthValue, { color: colors.textSecondary }]}>{value}</Text>
      <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
        <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
      </View>
    </View>
  );
};

interface UserGrowthItemProps {
  label: string;
  value: number;
  colors: any;
}

const UserGrowthItem: React.FC<UserGrowthItemProps> = ({ label, value, colors }) => (
  <View style={styles.userGrowthItem}>
    <Text style={[styles.userGrowthLabel, { color: colors.textSecondary }]}>{label}</Text>
    <View style={[styles.userGrowthValueBadge, { backgroundColor: colors.primary + '20' }]}>
      <Text style={[styles.userGrowthValue, { color: colors.primary }]}>{value}</Text>
    </View>
  </View>
);

interface PlatformActivityItemProps {
  label: string;
  value: string;
  colors: any;
}

const PlatformActivityItem: React.FC<PlatformActivityItemProps> = ({ label, value, colors }) => (
  <View style={styles.platformActivityItem}>
    <Text style={[styles.platformActivityLabel, { color: colors.textSecondary }]}>{label}</Text>
    <Text style={[styles.platformActivityValue, { color: colors.textPrimary }]}>{value}</Text>
  </View>
);


export const AdminOverview: React.FC = () => {
  const { theme: { colors } } = useTheme();
  const [metrics, setMetrics] = useState<any>(null); // Use 'any' for now, will refine later
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [userGrowth, setUserGrowth] = useState<any>(null);
  const [platformActivity, setPlatformActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [metricsData, systemHealthData, userGrowthData, platformActivityData] = await Promise.all([
          fetchAdminOverviewMetrics(),
          fetchSystemHealthData(),
          fetchUserGrowthData(),
          fetchPlatformActivityData(),
        ]);
        setMetrics(metricsData);
        setSystemHealth(systemHealthData);
        setUserGrowth(userGrowthData);
        setPlatformActivity(platformActivityData);
      } catch (error) {
        console.error("Error loading admin overview data:", error);
        // Handle error display
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: colors.textSecondary }}>Loading admin data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Metrics Grid */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Administrator Panel</Text>
      <View style={styles.metricsGrid}>
        <MetricCards title="Total Users" value={String(metrics?.totalUsers)} change="+10%" changeType="positive" Icon={Users} colors={colors} />
        <MetricCards title="Active CPAs" value={String(metrics?.activeCPAs)} change="-5%" changeType="negative" Icon={TrendingUp} colors={colors} />
        <MetricCards title="Transactions" value={String(metrics?.totalTransactions)} change="+24%" changeType="positive" Icon={Activity} colors={colors} />
        <MetricCards title="Revenue (MRR)" value={metrics?.revenueMRR} change="+16%" changeType="positive" Icon={DollarSign} colors={colors} />
      </View>

      {/* System Health Overview */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 30 }]}>System Health Overview</Text>
      <Cards style={styles.systemHealthCards}>
        <SystemHealthItem label="Database Performance" value={systemHealth?.databasePerformance} status="optimal" Icon={Database} colors={colors} />
        <SystemHealthItem label="API Response Time" value={systemHealth?.apiResponseTime} status="optimal" Icon={Clock} colors={colors} />
        <SystemHealthItem label="Server Load" value={systemHealth?.serverLoad} status="warning" Icon={Server} colors={colors} />
        <SystemHealthItem label="Storage Usage" value={systemHealth?.storageUsage} status="optimal" Icon={HardDrive} colors={colors} />
        <SystemHealthItem label="Active Sessions" value={String(systemHealth?.activeSessions)} status="optimal" Icon={Wifi} colors={colors} />
        <SystemHealthItem label="Error Rate" value={systemHealth?.errorRate} status="optimal" Icon={AlertTriangle} colors={colors} />
      </Cards>

      {/* User Growth & Platform Activity */}
      <View style={styles.bottomSection}>
        <Cards style={styles.userGrowthCards}>
          <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>User Growth</Text>
          <UserGrowthItem label="New Users (Today)" value={userGrowth?.today} colors={colors} />
          <UserGrowthItem label="New Users (Week)" value={userGrowth?.week} colors={colors} />
          <UserGrowthItem label="New Users (Month)" value={userGrowth?.month} colors={colors} />
        </Cards>
        <Cards style={styles.platformActivityCards}>
          <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>Platform Activity</Text>
          <PlatformActivityItem label="Active Sessions" value={platformActivity?.activeSessions} colors={colors} />
          <PlatformActivityItem label="API Calls (24h)" value={platformActivity?.apiCalls24h} colors={colors} />
          <PlatformActivityItem label="Data Processed" value={platformActivity?.dataProcessed} colors={colors} />
        </Cards>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCards: {
    width: '48%', // Two Cards per row
    marginBottom: 15,
    padding: 15,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  changeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  metricTitle: {
    fontSize: 14,
  },
  systemHealthCards: {
    padding: 15,
    marginBottom: 20,
  },
  healthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333', // Placeholder, will use theme colors
  },
  healthLabel: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  healthValue: {
    fontSize: 16,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  userGrowthCards: {
    width: '48%',
    padding: 15,
  },
  userGrowthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userGrowthLabel: {
    fontSize: 14,
  },
  userGrowthValueBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  userGrowthValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  platformActivityCards: {
    width: '48%',
    padding: 15,
  },
  platformActivityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  platformActivityLabel: {
    fontSize: 14,
  },
  platformActivityValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
