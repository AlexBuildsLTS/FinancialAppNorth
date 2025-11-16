import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { Cards } from '@/components/Cards';

interface FeatureFlagItemProps {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (newValue: boolean) => void;
  roles: string[]; // Roles that have access to this feature
  colors: any;
}

const FeatureFlagItem: React.FC<FeatureFlagItemProps> = ({ title, description, enabled, onToggle, roles, colors }) => (
  <Cards style={styles.featureItem}>
    <View style={styles.featureTextContainer}>
      <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>{description}</Text>
      <View style={styles.roleBadges}>
        {roles.map((role) => (
          <View key={role} style={[styles.roleBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.roleBadgeText, { color: colors.primary }]}>{role}</Text>
          </View>
        ))}
      </View>
    </View>
    <Switch
      trackColor={{ false: '#767577', true: colors.accent }}
      thumbColor={enabled ? colors.surface : '#f4f3f4'}
      onValueChange={onToggle}
      value={enabled}
    />
  </Cards>
);

export const AdminFeatureManagement: React.FC = () => {
  const { theme: { colors } } = useTheme();

  // Mock feature flags for now
  const [featureFlags, setFeatureFlags] = useState([
    { id: '1', title: 'Advanced Analytics', description: 'Enable advanced reporting and analytics features', enabled: true, roles: ['Premium', 'CPA', 'Administrator'] },
    { id: '2', title: 'AI Chat Assistant', description: 'Enable AI-powered financial assistant', enabled: true, roles: ['Member', 'Premium', 'CPA'] },
    { id: '3', title: 'Document OCR', description: 'Automatic text extraction from uploaded documents', enabled: false, roles: ['Premium', 'CPA'] },
    { id: '4', title: 'Client Management', description: 'CPA client portfolio management', enabled: true, roles: ['CPA', 'Administrator'] },
  ]);

  const handleToggleFeature = (id: string) => {
    setFeatureFlags(prevFlags =>
      prevFlags.map(flag =>
        flag.id === id ? { ...flag, enabled: !flag.enabled } : flag
      )
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Feature Flags Management</Text>
      <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>Control feature availability across different user roles</Text>
      <View style={styles.featureList}>
        {featureFlags.map((flag) => (
          <FeatureFlagItem
            key={flag.id}
            title={flag.title}
            description={flag.description}
            enabled={flag.enabled}
            onToggle={() => handleToggleFeature(flag.id)}
            roles={flag.roles}
            colors={colors}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 20,
  },
  featureList: {
    // Styles for the list container if needed
  },
  featureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
  },
  featureTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    marginBottom: 5,
  },
  roleBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginRight: 8,
    marginBottom: 5,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
