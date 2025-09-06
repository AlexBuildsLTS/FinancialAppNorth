import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Switch, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Profile, UserRole, UserRoleDisplayNames } from '@/types';
import { useTheme } from '@/context/ThemeProvider';
import { adminService } from '@/services/adminService';
import { X } from 'lucide-react-native';

interface EditUserModalProps {
  user: Profile;
  onClose: () => void;
  onUserUpdated: (updatedUser: Profile) => void;
}

export default function EditUserModal({ user, onClose, onUserUpdated }: EditUserModalProps) {
  const { colors } = useTheme();
  const [role, setRole] = useState<UserRole>(user.role);
  const [status, setStatus] = useState<'active' | 'suspended' | 'banned'>(
    (user.status === 'active' || user.status === 'suspended' || user.status === 'banned') ? user.status : 'active'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = async () => {
    setIsSubmitting(true);
    const { updatedUser, error } = await adminService.updateUser(user.id, { role, status });
    setIsSubmitting(false);

    if (error) {
      Alert.alert('Error', 'Failed to update user: ' + error.message);
    } else if (updatedUser) {
      onUserUpdated({ ...user, ...updatedUser });
      onClose();
    }
  };

  return (
    <View style={styles.modalBackdrop}>
      <View style={[styles.modalContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Edit User</Text>
          <Pressable onPress={onClose}>
            <X size={24} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
            value={user.display_name ?? ''}
            editable={false}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
            value={user.email ?? ''}
            editable={false}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Role</Text>
          <View style={[styles.pickerContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Picker selectedValue={role} onValueChange={(itemValue) => setRole(itemValue as UserRole)} style={{ color: colors.text }}>
              {Object.values(UserRole).map((r) => (
                <Picker.Item key={r} label={UserRoleDisplayNames[r]} value={r} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.fieldContainerRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Status</Text>
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, { color: status === 'active' ? colors.success : colors.textSecondary }]}>
                {status === 'active' ? 'Active' : 'Suspended'}
            </Text>
            <Switch
              value={status === 'active'}
              onValueChange={(isActive) => setStatus(isActive ? 'active' : 'suspended')}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={'#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={onClose} style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}>
            <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
          </Pressable>
          <Pressable onPress={handleUpdate} style={[styles.button, styles.updateButton, { backgroundColor: colors.primary }]}>
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
              {isSubmitting ? 'Updating...' : 'Update User'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 480,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  fieldContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
  },
  fieldContainerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginRight: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  updateButton: {},
  buttonText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});