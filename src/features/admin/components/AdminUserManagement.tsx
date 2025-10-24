import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { Cards } from '@/shared/components/Cards';
import { DropdownMenu } from '@/shared/components/DropdownMenu';
import { Search, Filter, MoreVertical, UserPlus } from 'lucide-react-native'; // Icons for search, filter, more options, add user
import { UserRole, Profile } from '@/shared/types'; // Assuming Profile type exists

interface UserListItemProps {
  user: Profile;
  colors: any;
  onPressMore: (user: Profile) => void;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, colors, onPressMore }) => {
  const roleColor = user.role === UserRole.ADMIN ? colors.error : user.role === UserRole.CPA ? colors.accent : colors.primary; // Example colors
  const statusColor = user.status === 'active' ? colors.success : colors.error; // Assuming status exists

  return (
    <Cards style={styles.userCards}>
      <View style={styles.userAvatarPlaceholder}>
        <Text style={[styles.userAvatarText, { color: colors.surfaceContrast }]}>{user.first_name?.charAt(0) || user.display_name.charAt(0)}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: colors.textPrimary }]}>{user.full_name || user.display_name}</Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
        <View style={styles.userBadges}>
          <View style={[styles.roleBadge, { backgroundColor: roleColor + '20' }]}>
            <Text style={[styles.roleBadgeText, { color: roleColor }]}>{user.role}</Text>
          </View>
          {user.status && (
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusBadgeText, { color: statusColor }]}>{user.status}</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity onPress={() => onPressMore(user)} style={styles.moreButton}>
        <MoreVertical size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </Cards>
  );
};

export const AdminUserManagement: React.FC = () => {
  const { theme: { colors } } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All Roles');

  // Mock user data for now
  const mockUsers: Profile[] = [
    { id: '1', full_name: 'John Admin', display_name: 'John Admin', email: 'john@admin.com', role: UserRole.ADMIN, status: 'active', avatar_url: null },
    { id: '2', full_name: 'Sarah CPA', display_name: 'Sarah CPA', email: 'sarah@cpa.com', role: UserRole.CPA, status: 'active', avatar_url: null },
    { id: '3', full_name: 'Mike Premium', display_name: 'Mike Premium', email: 'mike@premium.com', role: UserRole.PREMIUM_MEMBER, status: 'active', avatar_url: null },
    { id: '4', full_name: 'Emily Support', display_name: 'Emily Support', email: 'emily@support.com', role: UserRole.SUPPORT, status: 'active', avatar_url: null },
    { id: '5', full_name: 'David Member', display_name: 'David Member', email: 'david@member.com', role: UserRole.MEMBER, status: 'active', avatar_url: null },
    { id: '6', full_name: 'Lisa Suspended', display_name: 'Lisa Suspended', email: 'lisa@suspended.com', role: UserRole.MEMBER, status: 'suspended', avatar_url: null },
  ];

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRoleFilter === 'All Roles' || user.role === selectedRoleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const handleMoreOptions = (user: Profile) => {
    console.log('More options for user:', user.full_name);
    // Implement dropdown menu or modal for actions like change role, suspend, view details, message private
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchFilterContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search users by name, company, or email..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <DropdownMenu
          trigger={
            <View style={[styles.filterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.filterButtonText, { color: colors.textPrimary }]}>{selectedRoleFilter}</Text>
              <Filter size={20} color={colors.textSecondary} />
            </View>
          }
        >
          {Object.values(UserRole).map((role) => (
            <TouchableOpacity
              key={role}
              style={styles.dropdownMenuItem}
              onPress={() => setSelectedRoleFilter(role.charAt(0).toUpperCase() + role.slice(1))}
            >
              <Text style={{ color: colors.textPrimary }}>{role.charAt(0).toUpperCase() + role.slice(1)}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.dropdownMenuItem}
            onPress={() => setSelectedRoleFilter('All Roles')}
          >
            <Text style={{ color: colors.textPrimary }}>All Roles</Text>
          </TouchableOpacity>
        </DropdownMenu>
      </View>

      <View style={styles.userManagementHeader}>
        <Text style={[styles.userManagementTitle, { color: colors.textPrimary }]}>User Management ({filteredUsers.length})</Text>
        <TouchableOpacity style={[styles.addUserButton, { backgroundColor: colors.success }]} onPress={() => console.log('Add User')}>
          <UserPlus size={18} color={colors.surfaceContrast} />
          <Text style={[styles.addUserButtonText, { color: colors.surfaceContrast }]}>Add User</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {filteredUsers.map((user) => (
          <UserListItem key={user.id} user={user} colors={colors} onPressMore={handleMoreOptions} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchFilterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    height: 50,
  },
  filterButtonText: {
    marginRight: 8,
    fontSize: 16,
  },
  dropdownMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  userManagementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userManagementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addUserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addUserButtonText: {
    marginLeft: 5,
    fontWeight: '600',
  },
  userCards: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
  },
  userAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6200EE', // Placeholder color
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
  },
  userBadges: {
    flexDirection: 'row',
    marginTop: 5,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginRight: 8,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreButton: {
    padding: 5,
  },
});
