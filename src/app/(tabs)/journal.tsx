 import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Plus, BookCopy, User } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { getJournalEntries } from '@/services/accountingService';
import { JournalEntry } from '@/types/accounting';
import ScreenContainer from '@/components/ScreenContainer';
import JournalEntryModal from '@/components/forms/JournalEntryModal'; // We will create this next

export default function JournalScreen() {
  const { colors } = useTheme();
  const { session } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (!User) return;
    setLoading(true);
    if (session?.user?.id) {
      try {
        // Assuming we're fetching for the logged-in user.
        // In a CPA context, a client ID would be passed here.
        const data = await getJournalEntries(session.user.id);
        setEntries(data);
      } catch (error) {
        console.error('Failed to fetch journal entries:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      fetchEntries();
    }, [fetchEntries])
  );

  const renderEntryItem = ({ item }: { item: JournalEntry }) => (
    <View style={[styles.entryCard, { backgroundColor: colors.surface }]}>
      <View style={styles.entryHeader}>
        <Text style={[styles.entryDate, { color: colors.text }]}>{new Date(item.date).toLocaleDateString()}</Text>
        <Text style={[styles.entryStatus, { color: colors.primary }]}>{item.status}</Text>
      </View>
      <Text style={[styles.entryDescription, { color: colors.textSecondary }]}>{item.description}</Text>
      <View style={styles.lineItemsContainer}>
        {item.entries.map((line, index) => (
          <View key={index} style={styles.lineItem}>
            <Text style={[styles.accountName, { color: colors.text }]}>{line.account_name}</Text>
            <Text style={[styles.lineAmount, { color: colors.text }]}>${line.debit_amount > 0 ? line.debit_amount.toFixed(2) : ''}</Text>
            <Text style={[styles.lineAmount, { color: colors.text }]}>${line.credit_amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>
       <View style={styles.entryFooter}>
         <Text style={[styles.totalAmount, { color: colors.text }]}>${item.total_debit.toFixed(2)}</Text>
         <Text style={[styles.totalAmount, { color: colors.text }]}>${item.total_credit.toFixed(2)}</Text>
       </View>
    </View>
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>General Journal</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Plus color={colors.primary} size={28} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} size="large" />
      ) : (
        <FlatList
          data={entries}
          renderItem={renderEntryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <BookCopy size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No journal entries found.</Text>
            </View>
          }
        />
      )}

      <JournalEntryModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={fetchEntries} // Pass the current user's ID
        clientId={session?.user?.id || ''}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10 },
    title: { fontSize: 32, fontWeight: 'bold' },
    addButton: { padding: 8 },
    list: { paddingHorizontal: 16, paddingBottom: 50 },
    entryCard: { borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#333' },
    entryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    entryDate: { fontSize: 16, fontWeight: 'bold' },
    entryStatus: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
    entryDescription: { fontSize: 14, marginBottom: 12 },
    lineItemsContainer: { borderTopWidth: 1, borderTopColor: '#333', paddingTop: 8 },
    lineItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
    accountName: { flex: 2, fontSize: 14 },
    lineAmount: { flex: 1, textAlign: 'right', fontSize: 14, fontFamily: 'monospace' },
    entryFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#333', paddingTop: 8, marginTop: 8 },
    totalAmount: { flex: 1, textAlign: 'right', fontSize: 14, fontWeight: 'bold', fontFamily: 'monospace' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100, gap: 16 },
    emptyText: { fontSize: 16 },
});