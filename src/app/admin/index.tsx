// src/app/(tabs)/index.tsx

import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import ScreenContainer from '@/components/ScreenContainer';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useTheme } from '@/context/ThemeProvider';
// Import your components for metrics and charts here
// import MetricsGrid from '@/components/dashboard/MetricsGrid';
// import ChartSection from '@/components/dashboard/ChartSection';

export default function DashboardScreen() {
    const { colors } = useTheme();

    return (
        <ScreenContainer>
            <DashboardHeader />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* This is where you will place your dashboard widgets.
                  The structure is ready for you to add the components.
                */}
                
                {/* Example: Metrics Grid */}
                {/* <MetricsGrid /> */}

                {/* Example: Chart Section */}
                {/* <ChartSection /> */}

                {/* Example: Recent Transactions */}
                {/* <RecentTransactions /> */}

                <View style={styles.placeholder}>
                  <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                    Dashboard Widgets (Charts, Metrics, etc.) will go here.
                  </Text>
                </View>

            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        padding: 24,
    },
    placeholder: {
      height: 400,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#333',
      borderRadius: 12,
      borderStyle: 'dashed',
    },
    placeholderText: {
      fontSize: 16,
      fontWeight: '500',
    }
});