import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { useAuth } from '@/shared/context/AuthContext';
import { useRouter } from 'expo-router';
import { supabase } from '@/shared/lib/supabase';
import {
  MessageCircle,
  Plus,
  Paperclip,
  Send,
  FileText,
  Download,
  User,
  Shield,
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface SupportTicket {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  last_message: string;
  assigned_to?: string;
}

interface SupportMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  attachments?: string[];
  created_at: string;
  user: {
    display_name: string;
    role: string;
  };
}

export default function SupportScreen() {
  const { theme } = useTheme();
  const { colors } = theme;
  const { profile } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select(`
          *,
          user:profiles(display_name, role)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const createTicket = async () => {
    if (!newTicketTitle.trim() || !newTicketMessage.trim()) {
      Alert.alert('Error', 'Please fill in both title and message');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: profile?.id,
          title: newTicketTitle,
          status: 'open',
          priority: 'medium',
        })
        .select()
        .single();

      if (error) throw error;

      // Add initial message
      await supabase
        .from('support_messages')
        .insert({
          ticket_id: data.id,
          user_id: profile?.id,
          message: newTicketMessage,
        });

      setNewTicketTitle('');
      setNewTicketMessage('');
      setShowNewTicketForm(false);
      loadTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      Alert.alert('Error', 'Failed to create support ticket');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    setSending(true);
    try {
      await supabase
        .from('support_messages')
        .insert({
          ticket_id: selectedTicket.id,
          user_id: profile?.id,
          message: newMessage,
        });

      setNewMessage('');
      loadMessages(selectedTicket.id);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const attachFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.ms-excel', 'text/csv', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        // In a real implementation, you would upload this to storage
        Alert.alert('File Selected', `Selected: ${result.assets[0].name}`);
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const exportData = async () => {
    try {
      // Generate sample export data
      const exportData = [
        { Date: '2025-01-15', Description: 'Sample Transaction', Amount: 100.00, Category: 'Income' },
        { Date: '2025-01-14', Description: 'Sample Expense', Amount: -50.00, Category: 'Food' },
      ];

      const csvContent = [
        Object.keys(exportData[0]).join(','),
        ...exportData.map(row => Object.values(row).join(','))
      ].join('\n');

      const fileUri = FileSystem.cacheDirectory + 'financial_data.csv';
      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return colors.warning;
      case 'in_progress': return colors.primary;
      case 'resolved': return colors.success;
      case 'closed': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return colors.error;
      case 'high': return '#FF6B35';
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (selectedTicket) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={() => setSelectedTicket(null)}>
            <Text style={[styles.backButton, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{selectedTicket.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedTicket.status), minWidth: 80, alignItems: 'center' }]}>
            <Text style={styles.statusText}>{selectedTicket.status}</Text>
          </View>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[
              styles.messageContainer,
              item.user_id === profile?.id ? styles.userMessage : styles.supportMessage,
              { backgroundColor: item.user_id === profile?.id ? colors.primary : colors.surface }
            ]}>
              <View style={styles.messageHeader}>
                <Text style={[styles.messageSender, { 
                  color: item.user_id === profile?.id ? colors.primaryContrast : colors.text 
                }]}>
                  {item.user.display_name} {item.user.role === 'Support' && '(Support)'}
                </Text>
                <Text style={[styles.messageTime, { 
                  color: item.user_id === profile?.id ? colors.primaryContrast : colors.textSecondary 
                }]}>
                  {new Date(item.created_at).toLocaleTimeString()}
                </Text>
              </View>
              <Text style={[styles.messageText, { 
                color: item.user_id === profile?.id ? colors.primaryContrast : colors.text 
              }]}>
                {item.message}
              </Text>
            </View>
          )}
          style={styles.messagesList}
        />

        <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.inputRow}>
            <TouchableOpacity onPress={attachFile} style={styles.attachButton}>
              <Paperclip color={colors.primary} size={20} />
            </TouchableOpacity>
            <TextInput
              style={[styles.messageInput, { color: colors.text }]}
              placeholder="Type your message..."
              placeholderTextColor={colors.textSecondary}
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
            />
            <TouchableOpacity 
              onPress={sendMessage} 
              disabled={sending || !newMessage.trim()}
              style={[styles.sendButton, { backgroundColor: colors.primary }]}
            >
              {sending ? (
                <ActivityIndicator color={colors.primaryContrast} size={16} />
              ) : (
                <Send color={colors.primaryContrast} size={16} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (showNewTicketForm) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={() => setShowNewTicketForm(false)}>
            <Text style={[styles.backButton, { color: colors.primary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>New Support Ticket</Text>
          <TouchableOpacity onPress={createTicket}>
            <Text style={[styles.backButton, { color: colors.primary }]}>Create</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.text }]}>Subject</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder="Brief description of your issue"
            placeholderTextColor={colors.textSecondary}
            value={newTicketTitle}
            onChangeText={setNewTicketTitle}
          />

          <Text style={[styles.label, { color: colors.text }]}>Message</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder="Describe your issue in detail..."
            placeholderTextColor={colors.textSecondary}
            value={newTicketMessage}
            onChangeText={setNewTicketMessage}
            multiline
            numberOfLines={6}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Support Center</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={exportData} style={styles.headerButton}>
            <Download color={colors.primary} size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowNewTicketForm(true)} style={styles.headerButton}>
            <Plus color={colors.primary} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity 
          onPress={exportData}
          style={[styles.quickAction, { backgroundColor: colors.surface }]}
        >
          <FileText color={colors.primary} size={24} />
          <Text style={[styles.quickActionText, { color: colors.text }]}>Export Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setShowNewTicketForm(true)}
          style={[styles.quickAction, { backgroundColor: colors.surface }]}
        >
          <MessageCircle color={colors.primary} size={24} />
          <Text style={[styles.quickActionText, { color: colors.text }]}>New Ticket</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setSelectedTicket(item);
              loadMessages(item.id);
            }}
            style={[styles.ticketCard, { backgroundColor: colors.surface }]}
          >
            <View style={styles.ticketHeader}>
              <Text style={[styles.ticketTitle, { color: colors.text }]}>{item.title}</Text>
              <View style={styles.ticketBadges}>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
                  <Text style={styles.badgeText}>{item.priority}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.badgeText}>{item.status}</Text>
                </View>
              </View>
            </View>
            <Text style={[styles.ticketDate, { color: colors.textSecondary }]}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
            {item.last_message && (
              <Text style={[styles.lastMessage, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.last_message}
              </Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MessageCircle size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Support Tickets</Text>
            <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              Create a support ticket to get help from our team
            </Text>
          </View>
        }
        contentContainerStyle={styles.ticketsList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.1)',
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: 12 },
  headerButton: { padding: 8 },
  backButton: { fontSize: 16, fontWeight: '600' },
  quickActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  quickActionText: { fontSize: 14, fontWeight: '600' },
  ticketsList: { padding: 16 },
  ticketCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.1)',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ticketTitle: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 12 },
  ticketBadges: { flexDirection: 'row', gap: 6 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  statusText: { color: '#FFFFFF', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' }, // Added statusText style
  ticketDate: { fontSize: 12, marginBottom: 8 }, 
  lastMessage: { fontSize: 14 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyDescription: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
  form: { padding: 16 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
  },
  textArea: {
    minHeight: 120,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
    textAlignVertical: 'top',
  },
  messagesList: { flex: 1, padding: 16 },
  messageContainer: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessage: { alignSelf: 'flex-end' },
  supportMessage: { alignSelf: 'flex-start' },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  messageSender: { fontSize: 12, fontWeight: '600' },
  messageTime: { fontSize: 10 },
  messageText: { fontSize: 14 },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.1)',
  },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  attachButton: { padding: 8 },
  messageInput: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
    borderRadius: 20,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
