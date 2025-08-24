import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, KeyRound, Lock } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import ScreenContainer from '@/components/ScreenContainer';
import { Text } from 'react-native';


const SecurityListItem = ({ icon: Icon, text, onPress, colors }: any) => (
  <TouchableOpacity style={[styles.listItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]} onPress={onPress}>
    <Icon color={colors.textSecondary} size={22} />
    <Text style={[styles.listItemText, { color: colors.text }]}>{text}</Text>
    <ChevronRight color={colors.textSecondary} size={22} />
  </TouchableOpacity>
);


export default function SecurityScreen() {
    const { colors } = useTheme();
    const router = useRouter();

    const menuItems = [
        { icon: KeyRound, text: 'Change Password', path: '/profile/security/change-password' },
        { icon: Lock, text: 'Two-Factor Authentication', path: '/profile/security' }, // Placeholder
    ];
    return (
        <ScreenContainer>
            <ScrollView>
                 <View style={styles.menuSection}>
                    {menuItems.map((item) => (
                        <SecurityListItem key={item.text} icon={item.icon} text={item.text} onPress={() => router.push(item.path as any)} colors={colors} />
                    ))}
                </View>
            </ScrollView>
        </ScreenContainer>
    )
}

const styles = StyleSheet.create({
    menuSection: { marginHorizontal: 16, marginTop: 20, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#333' },
    listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 16, borderBottomWidth: 1 },
    listItemText: { flex: 1, fontSize: 16, marginLeft: 16, fontWeight: '500' },
});