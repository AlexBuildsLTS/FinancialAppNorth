import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { User, Crown, Briefcase, HandHelping } from 'lucide-react-native';
import { TierCard } from './TierCard';
import { useTheme } from '../../context/ThemeProvider';

export function MembershipTiers() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const itemWidth = width >= 768 ? '50%' : '100%';

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
        Membership Tiers
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular }]}>
        Choose the membership level that fits your needs. From individuals tracking personal finances to certified professionals managing client portfolios, we have a plan for everyone.
      </Text>
      <View style={styles.gridContainer}>
        <View style={{ width: itemWidth, paddingHorizontal: 8 }}>
          <TierCard
            icon={User}
            title="Member"
            description="Perfect for individuals starting their financial journey"
            color="#3B82F6"
            features={[
              'Basic transaction tracking',
              'Budget creation and monitoring',
              'Financial document storage',
              'Monthly spending reports',
            ]}
          />
        </View>
        <View style={{ width: itemWidth, paddingHorizontal: 8 }}>
          <TierCard
            icon={Crown}
            title="Premium"
            description="For serious financial planners who want advanced insights"
            color="#1DB954"
            features={[
              'Everything in Member',
              'Advanced analytics and reports',
              'AI-powered financial insights',
              'Custom budget categories',
              'CPA consultation requests',
              'Priority support',
            ]}
          />
        </View>
        <View style={{ width: itemWidth, paddingHorizontal: 8 }}>
          <TierCard
            icon={Briefcase}
            title="CPA"
            description="Certified professionals managing multiple clients"
            color="#F59E0B"
            features={[
              'Everything in Premium',
              'Client management dashboard',
              'Multi-client oversight',
              'Professional reporting tools',
              'Dedicated CPA resources',
            ]}
          />
        </View>
        <View style={{ width: itemWidth, paddingHorizontal: 8 }}>
          <TierCard
            icon={HandHelping}
            title="Support"
            description="Team members helping users succeed"
            color="#8B5CF6"
            features={[
              'Everything in Premium',
              'Ticket management system',
              'User assistance tools',
              'Community moderation',
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
});
