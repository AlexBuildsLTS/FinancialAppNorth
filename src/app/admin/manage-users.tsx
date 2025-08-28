// src/app/admin/manage-users.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { getAllUsers } from '@/services/adminService';
import { Profile } from '@/types';
import ScreenContainer from '@/components/ScreenContainer';
import Avatar from '@/components/common/Avatar';
import { SlidersHorizontal, Trash2, Edit } from 'lucide-react-native';

const UserManagementScreen = () => {
  const { colors } = useTheme();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      // Handle error with a toast message
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const filteredUsers = users.filter(user =>
    user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUserRow = ({ item }: { item: Profile }) => (
    <View style={[styles.row, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={styles.userInfo}>
        <Avatar profile={item} size={40} />
        <View style={{ marginLeft: 12 }}>
          <Text style={[styles.userName, { color: colors.text }]}>{item.display_name}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{item.email}</Text>
        </View>
      </View>
      <View style={styles.roleContainer}>
        <Text style={[styles.roleText, { color: colors.text }]}>{item.role}</Text>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => { /* Open Edit Modal */ }}>
          <Edit color={colors.primary} size={20} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => { /* Open Delete Confirmation */ }}>
          <Trash2 color={'#E53E3E'} size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenContainer>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TextInput
          placeholder="Search by name or email..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
        />
        {/* Add Filter Button Here */}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderUserRow}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  searchInput: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  userInfo: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 12,
  },
  roleContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden', // for iOS
    // Add background color based on role
  },
  actionsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
});

export default UserManagementScreen;