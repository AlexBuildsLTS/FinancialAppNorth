// src/app/(tabs)/admin/manage-users.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import ScreenContainer from '@/app/ScreenContainer';
import { Card } from '@/components/common';
import RoleBadge from '@/components/common/RoleBadge';
import Avatar from '@/components/common/Avatar';
import { User, UserRole } from '@/types';
import { Edit, Trash2, UserCheck, UserX } from 'lucide-react-native';
import EditUserModal from '@/app/(tabs)/EditUserModal';
import { adminService } from '@/services/adminService'; // Make sure this is the correct path

interface UserListItemProps {
    user: User;
    onEdit: (user: User) => void;
    onToggleStatus: (userId: string, isActive: boolean) => void;
    onDelete: (userId: string) => void;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, onEdit, onToggleStatus, onDelete }) => {
    const { colors } = useTheme();
    const isActive = user.status === 'active';

    return (
        <Card style={styles.userCard}>
            <View style={styles.userInfo}>
                <Avatar url={user.avatar_url} size={48} />
                <View style={styles.userDetails}>
                    <Text style={[styles.userName, { color: colors.text }]}>{user.full_name || user.display_name}</Text>
                    <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
                </View>
            </View>
            <View style={styles.roleContainer}>
                <RoleBadge role={user.role} />
            </View>
            <View style={styles.actionsContainer}>
                <Pressable onPress={() => onEdit(user)} style={styles.actionButton}>
                    <Edit size={20} color={colors.primary} />
                </Pressable>
                <Pressable onPress={() => onToggleStatus(user.id, isActive)} style={styles.actionButton}>
                    {isActive ? <UserX size={20} color={colors.warning} /> : <UserCheck size={20} color={colors.success} />}
                </Pressable>
                <Pressable onPress={() => onDelete(user.id)} style={styles.actionButton}>
                    <Trash2 size={20} color={colors.error} />
                </Pressable>
            </View>
        </Card>
    );
};

export default function ManageUsersScreen() {
    const { colors } = useTheme();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalVisible, setModalVisible] = useState(false);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const fetchedUsers = await adminService.getUsers();
            setUsers(fetchedUsers);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            // Add toast notification here if needed
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setModalVisible(true);
    };

    const handleToggleStatus = (userId: string, isActive: boolean) => {
        const action = isActive ? 'deactivate' : 'activate';
        Alert.alert(
            `Confirm ${action}`,
            `Are you sure you want to ${action} this user?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: `Yes, ${action}`, onPress: () => console.log(`TODO: ${action} user ${userId}`) }
            ]
        );
    };

    const handleDelete = (userId: string) => {
         Alert.alert(
            `Confirm Deletion`,
            `This action is irreversible. Are you sure you want to delete this user?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: `Yes, Delete`, style: 'destructive', onPress: () => console.log(`TODO: Delete user ${userId}`) }
            ]
        );
    };
    
    const handleModalSave = async (updatedUser: User) => {
        // Here you would call your service to update the user in the database
        console.log("Saving user:", updatedUser);
        setModalVisible(false);
        setSelectedUser(null);
        loadUsers(); // Refresh the list
    };

    const handleModalClose = () => {
        setModalVisible(false);
        setSelectedUser(null);
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ScreenContainer>
            <FlatList<User>
                data={users}
                keyExtractor={(item: User) => item.id}
                renderItem={({ item }: { item: User }) => (
                    <UserListItem
                        user={item}
                        onEdit={handleEdit}
                        onToggleStatus={handleToggleStatus}
                        onDelete={handleDelete}
                    />
                )}
                ListHeaderComponent={() => (
                    <Text style={[styles.header, { color: colors.text }]}>User Management</Text>
                )}
                contentContainerStyle={{ padding: 16 }}
            />

            {selectedUser && isModalVisible && (
                <EditUserModal
                    user={selectedUser}
                    onClose={handleModalClose}
                    onUserUpdated={handleModalSave}
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    userCard: {
        padding: 16,
        marginBottom: 12,
        flexDirection: 'column',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    userDetails: {
        marginLeft: 12,
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    userEmail: {
        fontSize: 14,
    },
    roleContainer: {
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        borderTopWidth: 1,
        borderColor: '#eee',
        paddingTop: 12,
        marginTop: 4,
    },
    actionButton: {
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
