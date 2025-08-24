import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@/context/ThemeProvider';
import { User, UserRole } from '@/context/AuthContext';
import { fetchAllUsers, updateUserRole } from '@/services/adminService';
import { Shield, ChevronDown, X } from 'lucide-react-native';

const ManageUsersScreen = () => {
  const { colors } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>('Member');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const fetchedUsers = await fetchAllUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, []);

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsModalVisible(true);
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;
    try {
      const updatedUser = await updateUserRole(selectedUser.id, newRole);
      // Update the user in the local state
      setUsers((currentUsers) =>
        currentUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
    } catch (error) {
      console.error('Failed to update user role:', error);
      // Here you might show an error toast to the admin
    } finally {
      setIsModalVisible(false);
      setSelectedUser(null);
    }
  };

  const UserItem = ({ user }: { user: User }) => (
    <View style={[styles.userItem, { backgroundColor: colors.surface }]}>
      <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: colors.text }]}>
          {user.displayName}
        </Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
          {user.email}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => openRoleModal(user)}
        style={styles.roleButton}
      >
        <Shield color={colors.primary} size={16} />
        <Text style={[styles.roleText, { color: colors.primary }]}>
          {user.role}
        </Text>
        <ChevronDown color={colors.textSecondary} size={16} />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={users}
        renderItem={({ item }) => <UserItem user={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />

      {/* Role Change Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <X color={colors.textSecondary} size={24} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Change Role for
            </Text>
            <Text style={[styles.modalUser, { color: colors.textSecondary }]}>
              {selectedUser?.displayName}
            </Text>

            <Picker
              selectedValue={newRole}
              onValueChange={(itemValue) => setNewRole(itemValue)}
              style={{ width: '100%', color: colors.text }} // Basic styling
            >
              <Picker.Item label="Member" value="Member" />
              <Picker.Item label="Premium Member" value="Premium Member" />
              <Picker.Item
                label="Professional Accountant"
                value="Professional Accountant"
              />
              <Picker.Item label="Support" value="Support" />
              <Picker.Item label="Administrator" value="Administrator" />
            </Picker>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleRoleChange}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Add extensive styling
const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 16 },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 1,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  userInfo: { flex: 1 },
  userName: { fontFamily: 'Inter-Bold', fontSize: 16 },
  userEmail: { fontFamily: 'Inter-Regular', fontSize: 14 },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  roleText: { fontFamily: 'Inter-Bold', fontSize: 12 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  modalUser: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 20,
  },
  saveButton: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
});

export default ManageUsersScreen;
