import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import ScreenContainer from '@/components/ScreenContainer';
import { useTheme } from '@/context/ThemeProvider';
import { supabase, adminChangeUserRole, adminDeactivateUser, adminDeleteUser, subscribe } from '@/lib/supabase';
import RoleBadge from '@/components/common/RoleBadge';
import { UserRole } from '@/types';
import { useRouter } from 'expo-router';

export default function ManageUsersScreen() {
  const { colors } = useTheme();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any).from('profiles').select('*');
      if (error) throw error;
      setUsers(data ?? []);
    } catch (e) {
      console.error('Failed to load users', e);
      Alert.alert('Error', 'Could not load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // subscribe to realtime changes on profiles to update admin UI live
    const unsub = subscribe('profiles', (payload: any) => {
      const { eventType, new: n, old: o } = payload;
      if (eventType === 'INSERT') {
        setUsers(prev => [n, ...prev]);
      } else if (eventType === 'UPDATE') {
        setUsers(prev => prev.map(u => (u.id === n.id ? n : u)));
      } else if (eventType === 'DELETE') {
        setUsers(prev => prev.filter(u => u.id !== o?.id));
      }
    });
    return () => unsub();
  }, []);

  const onChangeRole = async (userId: string, newRole: UserRole) => {
    try {
      // cast to any to avoid Role/UserRole mismatch until types are unified
      await (adminChangeUserRole as any)(userId, newRole as any);
      Alert.alert('Success', 'Role changed.');
      // loadUsers(); // realtime subscription will update list
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to change role.');
    }
  };

  const onToggleDeactivate = async (userId: string) => {
    try {
      await (adminDeactivateUser as any)(userId);
      Alert.alert('Success', 'User deactivated (tokens revoked).');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to deactivate.');
    }
  };

  const onDelete = async (userId: string) => {
    Alert.alert('Confirm delete', 'Delete user permanently?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await (adminDeleteUser as any)(userId);
            Alert.alert('Deleted', 'User deleted.');
          } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Delete failed.');
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>{item.display_name ?? item.id}</Text>
        <Text style={{ color: colors.textSecondary }}>{item.email}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <RoleBadge role={item.role as UserRole} />
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          {/* cast path to any to satisfy the router typing in this codebase */}
          <TouchableOpacity onPress={() => router.push((`/admin/edit/${item.id}` as any))} style={styles.actionBtn}><Text style={{ color: colors.primary }}>Edit</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => onToggleDeactivate(item.id)} style={styles.actionBtn}><Text style={{ color: colors.error }}>Block</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.actionBtn}><Text style={{ color: colors.error }}>Delete</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ScreenContainer>
      {loading ? <ActivityIndicator color={colors.primary} /> : (
        <FlatList
          data={users}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { padding: 12, borderRadius: 10, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
  actionBtn: { marginLeft: 10 },
});
