import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Shield, User, CreditCard, FileText, Settings } from 'lucide-react-native';

interface ClientProfile {
  id: string;
  display_name: string;
  email: string;
  avatar_url: string;
  role: string;
  created_at: string;
}

export default function ClientDashboardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify access permissions
    if (!user || !['Administrator', 'Professional Accountant', 'Support'].includes(user.role)) {
      Alert.alert('Access Denied', 'You do not have permission to access this feature.');
      router.back();
      return;
    }

    if (id) {
      loadClientProfile();
    }
  }, [id, user]);

  const loadClientProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setClientProfile(data);
    } catch (error) {
      console.error('Error loading client profile:', error);
      Alert.alert('Error', 'Failed to load client profile');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleExitClientMode = () => {
    Alert.alert(
      'Exit Client Mode',
      'Are you sure you want to exit client support mode?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', onPress: () => router.back() },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loading} />
      </View>
    );
  }

  if (!clientProfile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Client profile not found
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Custom Header with Client Context */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={handleExitClientMode} style={styles.backButton}>
          <ArrowLeft color={colors.primary} size={24} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {clientProfile.display_name}'s Account
          </Text>
          <View style={styles.supportBadge}>
            <Shield color={colors.warning} size={16} />
            <Text style={[styles.supportText, { color: colors.warning }]}>
              Support Mode - {user?.role}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Client Info Card */}
        <View style={[styles.clientCard, { backgroundColor: colors.surface }]}>
          <View style={styles.clientHeader}>
            <User color={colors.primary} size={24} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Client Information</Text>
          </View>
          <View style={styles.clientDetails}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Name</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {clientProfile.display_name}
            </Text>
            
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Email</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {clientProfile.email}
            </Text>
            
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Role</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {clientProfile.role}
            </Text>
            
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Member Since</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {new Date(clientProfile.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={[styles.actionsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, { borderColor: colors.border }]}
            onPress={() => router.push(`/client-transactions/${id}`)}
          >
            <CreditCard color={colors.primary} size={20} />
            <Text style={[styles.actionText, { color: colors.text }]}>
              View Transactions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { borderColor: colors.border }]}
            onPress={() => router.push(`/client-documents/${id}`)}
          >
            <FileText color={colors.primary} size={20} />
            <Text style={[styles.actionText, { color: colors.text }]}>
              View Documents
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { borderColor: colors.border }]}
            onPress={() => router.push(`/client-settings/${id}`)}
          >
            <Settings color={colors.primary} size={20} />
            <Text style={[styles.actionText, { color: colors.text }]}>
              Account Settings
            </Text>
          </TouchableOpacity>
        </View>

        {/* Warning Notice */}
        <View style={[styles.warningCard, { backgroundColor: colors.surface }]}>
          <Shield color={colors.warning} size={20} />
          <View style={styles.warningContent}>
            <Text style={[styles.warningTitle, { color: colors.text }]}>
              Privacy Notice
            </Text>
            <Text style={[styles.warningText, { color: colors.textSecondary }]}>
              You are accessing this client's account in support mode. All actions are logged 
              and monitored. Only access information necessary to provide assistance.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center' },
  errorText: { textAlign: 'center', fontSize: 16, marginTop: 50 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.1)',
  },
  backButton: { padding: 8 },
  headerCenter: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  supportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  supportText: { fontSize: 12, fontWeight: '600' },
  content: { flex: 1, padding: 16 },
  clientCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.1)',
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  clientDetails: { gap: 12 },
  detailLabel: { fontSize: 14, fontWeight: '600' },
  detailValue: { fontSize: 16, marginBottom: 8 },
  actionsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 12,
  },
  actionText: { fontSize: 16, fontWeight: '500' },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  warningContent: { flex: 1 },
  warningTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  warningText: { fontSize: 14, lineHeight: 20 },
});