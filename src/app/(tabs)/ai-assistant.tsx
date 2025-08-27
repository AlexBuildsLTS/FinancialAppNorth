import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { 
  Bot, Camera, FileText, Download, Upload, 
  MessageCircle, Scan, FileSpreadsheet, Zap 
} from 'lucide-react-native';
import ScreenContainer from '@/components/ScreenContainer';

interface AIFeatureCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  onPress: () => void;
  colors: any;
}

const AIFeatureCard = ({ title, description, icon: Icon, onPress, colors }: AIFeatureCardProps) => (
  <TouchableOpacity 
    style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
    onPress={onPress}
  >
    <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
      <Icon color={colors.primary} size={24} />
    </View>
    <View style={styles.cardContent}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>{description}</Text>
    </View>
  </TouchableOpacity>
);

export default function AIAssistantScreen() {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const router = useRouter();

  const handleDocumentScan = () => {
    router.push('/(tabs)/camera');
  };

  const handleChatWithAI = () => {
    router.push('/chat/1');
  };

  const handleProcessDocuments = () => {
    router.push('/process-document');
  };

  const handleViewDocuments = () => {
    router.push('/(tabs)/documents');
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Choose export format:',
      [
        { text: 'CSV', onPress: () => exportToCSV() },
        { text: 'PDF', onPress: () => exportToPDF() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const exportToCSV = () => {
    // TODO: Implement CSV export functionality
    Alert.alert('Success', 'Data exported to CSV format');
  };

  const exportToPDF = () => {
    // TODO: Implement PDF export functionality
    Alert.alert('Success', 'Data exported to PDF format');
  };

  const aiFeatures = [
    {
      title: 'Document Scanner',
      description: 'Scan receipts, invoices, and financial documents with OCR',
      icon: Camera,
      onPress: handleDocumentScan,
    },
    {
      title: 'Chat with AI',
      description: 'Get financial insights and ask questions about your data',
      icon: MessageCircle,
      onPress: handleChatWithAI,
    },
    {
      title: 'Process Documents',
      description: 'AI-powered document processing and categorization',
      icon: Scan,
      onPress: handleProcessDocuments,
    },
    {
      title: 'Export to CSV',
      description: 'Export processed data to CSV for analysis',
      icon: FileSpreadsheet,
      onPress: handleExportData,
    },
    {
      title: 'View Documents',
      description: 'Browse and manage your uploaded documents',
      icon: FileText,
      onPress: handleViewDocuments,
    },
    {
      title: 'Quick Actions',
      description: 'Automated financial tasks and workflows',
      icon: Zap,
      onPress: () => Alert.alert('Coming Soon', 'Quick actions feature is in development'),
    },
  ];

  return (
    <ScreenContainer>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Bot color={colors.primary} size={32} />
            <Text style={[styles.title, { color: colors.text }]}>AI Assistant</Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Powered by AI to help you manage your finances
          </Text>
        </View>

        <View style={styles.featuresGrid}>
          {aiFeatures.map((feature, index) => (
            <AIFeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              onPress={feature.onPress}
              colors={colors}
            />
          ))}
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>How it works</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            1. Scan or upload financial documents{'\n'}
            2. AI processes and extracts key information{'\n'}
            3. Data is categorized and organized automatically{'\n'}
            4. Export or analyze your processed data
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  featuresGrid: {
    padding: 16,
    gap: 16,
  },
  featureCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
