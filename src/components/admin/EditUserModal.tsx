import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { UserProfile, UserRole } from '@/types';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { Picker } from '@react-native-picker/picker';
import { updateUserRole } from '@/services/adminService';

interface EditUserModalProps {
  visible: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUserUpdate: () => void;
}

const ROLES: UserProfile['role'][] = [
    'Member', 
    'Premium Member', 
    'Professional (CPA)', 
    'Support', 
    'Administrator'
];

export default function EditUserModal({ visible, onClose, user, onUserUpdate }: EditUserModalProps) {
  const { colors } = useTheme();
  const [selectedRole, setSelectedRole] = useState<UserProfile['role']>('Member');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateUserRole(user.id, selectedRole);
      Alert.alert('Success', `${user.email}'s role has been updated.`);
      onUserUpdate();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update user role.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) return null;

  return (
    <Modal visible={visible} onClose={onClose} title="Edit User">
      <View>
        <Text style={[styles.label, { color: colors.textSecondary }]}>User Email</Text>
        <Text style={[styles.emailText, { color: colors.text }]}>{user.email}</Text>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Assign Role</Text>
        <View style={[styles.pickerContainer, { backgroundColor: colors.background }]}>
            <Picker
                selectedValue={selectedRole}
                onValueChange={(itemValue: string) => setSelectedRole(itemValue as UserProfile['role'])}
                style={{ color: colors.text }}
            >
                {ROLES.map(role => (
                    <Picker.Item key={role} label={role} value={role} />
                ))}
            </Picker>
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Cancel" onPress={onClose} variant="outline" style={{ flex: 1, marginRight: 8 }} />
          <Button title="Save Changes" onPress={handleSave} isLoading={loading} style={{ flex: 1, marginLeft: 8 }} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  pickerContainer: {
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#444',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});