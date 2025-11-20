import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/shared/context/ThemeProvider';
import { useAuth } from '@/shared/context/AuthContext';
import { Settings, LogOut, User, FileText, PieChart, Users, ShieldCheck, HelpCircle, CreditCard } from 'lucide-react-native';
import { RoleBadge } from '@/shared/components/RoleBadge';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const ProfileDropdown = ({ visible, onClose }: Props) => {
  const { theme, isDark } = useTheme();
  const { signOut, profile } = useAuth();
  const router = useRouter();

  const role = profile?.role || 'member';
  const isAdmin = role === 'admin';
  const isCPA = role === 'cpa' || isAdmin;

  const handleNav = (route: string) => { onClose(); router.push(route as any); };
  const handleSignOut = async () => { onClose(); await signOut(); router.replace('/(auth)/login'); };

  const bg = isDark ? '#172A45' : '#FFFFFF';
  const text = theme.colors.textPrimary;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={[styles.menu, { backgroundColor: bg, borderColor: theme.colors.border }]}>
            
            {/* Header */}
            <View style={styles.header}>
               <View style={styles.row}>
                  <Text style={[styles.name, { color: text }]}>{profile?.first_name}</Text>
                  <RoleBadge role={role} />
               </View>
               <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{profile?.email}</Text>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
               {/* Features List (Matching your Sidebar) */}
               <MenuItem icon={User} label="Profile" onPress={() => handleNav('/(main)/profile')} color={text} />
               <MenuItem icon={FileText} label="Documents" onPress={() => handleNav('/(main)/documents')} color={text} />
               <MenuItem icon={CreditCard} label="Budgets" onPress={() => handleNav('/(main)/budgets')} color={text} />
               
               {(isCPA || isAdmin) && (
                 <>
                   <MenuItem icon={PieChart} label="Reports" onPress={() => handleNav('/(main)/reports')} color={text} />
                   <MenuItem icon={Users} label="CPA Services" onPress={() => handleNav('/(main)/clients')} color={text} />
                 </>
               )}

               <MenuItem icon={HelpCircle} label="Support" onPress={() => handleNav('/(main)/support')} color={text} />
               <MenuItem icon={Settings} label="Settings" onPress={() => handleNav('/(main)/settings')} color={text} />
               
               {isAdmin && (
                  <MenuItem icon={ShieldCheck} label="Admin Panel" onPress={() => handleNav('/(main)/admin')} color="#EF4444" />
               )}
            </ScrollView>

            {/* Footer */}
            <TouchableOpacity onPress={handleSignOut} style={styles.footerItem}>
               <LogOut size={18} color={theme.colors.error} />
               <Text style={{ color: theme.colors.error, fontWeight: '600', marginLeft: 12 }}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const MenuItem = ({ icon: Icon, label, onPress, color }: any) => (
  <TouchableOpacity onPress={onPress} style={styles.item}>
    <Icon size={18} color={color} />
    <Text style={[styles.itemText, { color }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start', alignItems: 'flex-end' },
  menu: { width: 260, marginTop: 90, marginRight: 20, borderRadius: 16, borderWidth: 1, padding: 8 },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  name: { fontWeight: '700', fontSize: 16, marginRight: 8 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8 },
  itemText: { marginLeft: 12, fontSize: 14, fontWeight: '500' },
  footerItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', marginTop: 8 }
});