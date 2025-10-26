import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { TrendingUp, Target, BarChart3, BrainCircuit, FolderKanban, Users } from 'lucide-react-native';
import { OfferCard } from './OfferCard';
import { useTheme } from '../../context/ThemeProvider';

export function WhatWeOffer() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const numColumns = width >= 1024 ? 3 : width >= 640 ? 2 : 1;
  const itemWidth = width >= 1024 ? '33.33%' : width >= 640 ? '50%' : '100%';

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
        What We Offer
      </Text>
      <View style={styles.gridContainer}>
        <View style={{ width: itemWidth, paddingHorizontal: 8 }}>
          <OfferCard
            icon={TrendingUp}
            title="Smart Transaction Tracking"
            description="Automatically categorize and analyze your financial transactions with AI-powered insights."
          />
        </View>
        <View style={{ width: itemWidth, paddingHorizontal: 8 }}>
          <OfferCard
            icon={Target}
            title="Intelligent Budgeting"
            description="Set custom budgets and receive real-time alerts when approaching spending limits."
          />
        </View>
        <View style={{ width: itemWidth, paddingHorizontal: 8 }}>
          <OfferCard
            icon={BarChart3}
            title="Advanced Analytics"
            description="Visualize your financial health with interactive charts and comprehensive reports."
          />
        </View>
        <View style={{ width: itemWidth, paddingHorizontal: 8 }}>
          <OfferCard
            icon={BrainCircuit}
            title="AI Financial Assistant"
            description="Get instant answers to your financial questions powered by advanced AI technology."
          />
        </View>
        <View style={{ width: itemWidth, paddingHorizontal: 8 }}>
          <OfferCard
            icon={FolderKanban}
            title="Document Management"
            description="Securely store and organize receipts, invoices, and important financial documents."
          />
        </View>
        <View style={{ width: itemWidth, paddingHorizontal: 8 }}>
          <OfferCard
            icon={Users}
            title="CPA Collaboration"
            description="Connect with certified CPAs for professional financial guidance and tax preparation."
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
    marginBottom: 24,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
});
