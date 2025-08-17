import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Plus, BookOpen, CircleCheck as CheckCircle, Clock, CircleAlert as AlertCircle } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeProvider';
import { getJournalEntries } from '@/services/accountingService';
import { JournalEntry } from '@/types/accounting';
import ScreenContainer from '@/components/ScreenContainer';
import Card from '@/components/common/Card';
import JournalEntryModal from '@/components/forms/JournalEntryModal';

export default function JournalScreen() {
  const { colors, isDark } = useTheme();
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const styles = createStyles(colors);

  useEffect(() => {
    loadJournalEntries();
  }, []);

  const loadJournalEntries = async () => {
    try {
      const entries = await getJournalEntries();
      setJournalEntries(entries);
    } catch (error) {
      console.error('Failed to load journal entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEntryAdded = () => {
    setShowModal(false);
    loadJournalEntries();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'posted':
        return <CheckCircle size={16} color={colors.success} />;
      case 'draft':
        return <Clock size={16} color={colors.warning} />;
      case 'reversed':
        return <AlertCircle size={16} color={colors.error} />;
      default:
        return <Clock size={16} color={colors.textSecondary} />;
    }
  };

  const renderJournalEntry = ({ item, index }: { item: JournalEntry; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 100).springify()}>
      <Card style={styles.entryCard}>
        <View style={styles.entryHeader}>
          <View style={styles.entryInfo}>
            <Text style={styles.entryReference}>{item.reference}</Text>
            <Text style={styles.entryDate}>{new Date(item.date).toLocaleDateString()}</Text>
          </View>
          <View style={styles.statusContainer}>
            {getStatusIcon(item.status)}
            <Text style={[styles.statusText, { 
              color: item.status === 'posted' ? colors.success : 
                     item.status === 'draft' ? colors.warning : colors.error 
            }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
        
        <Text style={styles.entryDescription}>{item.description}</Text>
        
        <View style={styles.entryAmounts}>
          <View style={styles.amountColumn}>
            <Text style={styles.amountLabel}>Total Debit</Text>
            <Text style={[styles.amountValue, { color: colors.text }]}>
              ${item.totalDebit.toLocaleString()}
            </Text>
          </View>
          <View style={styles.amountColumn}>
            <Text style={styles.amountLabel}>Total Credit</Text>
            <Text style={[styles.amountValue, { color: colors.text }]}>
              ${item.totalCredit.toLocaleString()}
            </Text>
          </View>
        </View>
        
        <View style={styles.entryLines}>
          {item.entries.slice(0, 2).map((line) => (
            <View key={line.id} style={styles.entryLine}>
              <Text style={styles.accountName}>{line.accountCode} - {line.accountName}</Text>
              <View style={styles.lineAmounts}>
                <Text style={styles.lineAmount}>
                  {line.debitAmount > 0 ? `$${line.debitAmount.toLocaleString()}` : '—'}
                </Text>
                <Text style={styles.lineAmount}>
                  {line.creditAmount > 0 ? `$${line.creditAmount.toLocaleString()}` : '—'}
                </Text>
              </View>
            </View>
          ))}
          {item.entries.length > 2 && (
            <Text style={styles.moreLines}>
              +{item.entries.length - 2} more lines
            </Text>
          )}
        </View>
      </Card>
    </Animated.View>
  );

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading journal entries...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BookOpen size={28} color={colors.primary} />
          <Text style={styles.headerTitle}>General Journal</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowModal(true)}
        >
          <Plus size={24} color={colors.surface} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <FlatList
            data={journalEntries}
            renderItem={renderJournalEntry}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <Card style={styles.emptyState}>
                <BookOpen size={48} color={colors.textSecondary} />
                <Text style={styles.emptyTitle}>No Journal Entries</Text>
                <Text style={styles.emptyDescription}>
                  Start by creating your first journal entry to record transactions.
                </Text>
              </Card>
            }
          />
        </View>
      </ScrollView>

      <JournalEntryModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleEntryAdded}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
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
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    addButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 20,
      paddingBottom: 100,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    entryCard: {
      marginBottom: 16,
    },
    entryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    entryInfo: {
      flex: 1,
    },
    entryReference: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    entryDate: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    entryDescription: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 16,
    },
    entryAmounts: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 16,
      paddingVertical: 12,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 8,
    },
    amountColumn: {
      alignItems: 'center',
    },
    amountLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    amountValue: {
      fontSize: 18,
      fontWeight: '700',
    },
    entryLines: {
      gap: 8,
    },
    entryLine: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 4,
    },
    accountName: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },
    lineAmounts: {
      flexDirection: 'row',
      gap: 20,
      minWidth: 120,
    },
    lineAmount: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'right',
      minWidth: 50,
    },
    moreLines: {
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: 8,
    },
    emptyState: {
      alignItems: 'center',
      padding: 40,
      gap: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    emptyDescription: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
  });