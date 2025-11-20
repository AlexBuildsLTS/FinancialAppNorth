import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import ScreenContainer from '@/shared/components/ScreenContainer';
import { Cards } from '@/shared/components/Cards';
import { router } from 'expo-router';
import { Download, Send } from 'lucide-react-native'; // Icons for Export Report (Download) and Send Announcement
import { AdminOverview } from './AdminOverview'; // Import AdminOverview
import { AdminUserManagement } from './AdminUserManagement'; // Import AdminUserManagement
import { AdminSystemSettings } from './AdminSystemSettings'; // Import AdminSystemSettings
import { AdminFeatureManagement } from './AdminFeatureManagement'; // Import AdminFeatureManagement
import { AdminAuditLogs } from './AdminAuditLogs'; // Import AdminAuditLogs

// Removed children prop as the layout manages its own content
interface AdminPanelLayoutProps {}

type AdminTab = 'overview' | 'users' | 'system' | 'features' | 'audit';

export const AdminPanelLayout: React.FC<AdminPanelLayoutProps> = () => {
  const { theme: { colors } } = useTheme();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview'); // Default to overview

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />;
      case 'users':
        return <AdminUserManagement />;
      case 'system':
        return <AdminSystemSettings />;
      case 'features':
        return <AdminFeatureManagement />;
      case 'audit':
        return <AdminAuditLogs />;
      default:
        return null;
    }
  };

  return (
    <ScreenContainer>
      <View style={[styles.headerContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Administrator Panel</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>System management and platform oversight</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={() => console.log('Export Report')}>
            <Download size={18} color={colors.surfaceContrast} /> {/* Changed to Download icon */}
            <Text style={[styles.actionButtonText, { color: colors.surfaceContrast }]}>Export Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.accent }]} onPress={() => console.log('Send Announcement')}>
            <Send size={18} color={colors.surfaceContrast} />
            <Text style={[styles.actionButtonText, { color: colors.surfaceContrast }]}>Send Announcement</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
        {['overview', 'users', 'system', 'features', 'audit'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && { borderBottomColor: colors.accent, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(tab as AdminTab)}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? colors.accent : colors.textSecondary }]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {renderTabContent()}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    marginLeft: 5,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 16,
  },
});
