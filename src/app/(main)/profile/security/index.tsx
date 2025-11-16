import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, KeyRound, Lock, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useToast } from '@/context/ToastProvider';
import ScreenContainer from '@/components/ScreenContainer';
import { Text } from 'react-native'; // Keep this line
import { Button } from '@/components/Button';


const SecurityListItem = ({ icon: Icon, text, onPress, colors }: any) => (
  <TouchableOpacity style={[styles.listItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]} onPress={onPress}>
    <Icon color={colors.textSecondary} size={22} />
    <Text style={[styles.listItemText, { color: colors.text }]}>{text}</Text>
    <ChevronRight color={colors.textSecondary} size={22} />
  </TouchableOpacity>
);


export default function SecurityScreen() {
    const { theme: { colors } } = useTheme();
    const { showToast } = useToast();
    const router = useRouter();
    const [checkPassword, setCheckPassword] = useState('');
    const [checking, setChecking] = useState(false);


    const menuItems = [
        { icon: KeyRound, text: 'Change Password', path: '/profile/security/change-password' },
        { icon: Lock, text: 'Two-Factor Authentication', path: '/profile/security' }, // Placeholder
    ];

    const checkBreachedPassword = async () => {
        if (!checkPassword.trim()) {
            return Alert.alert('Error', 'Please enter a password to check.');
        }

        setChecking(true);
        try {
            // Replace with your actual Supabase function URL
            const SUPABASE_FUNCTION_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/check-password`;

            const response = await fetch(SUPABASE_FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
                },
                body: JSON.stringify({ password: checkPassword }),
            });

            const data = await response.json();

            if (response.status !== 200) {
                 throw new Error(data.error || 'Failed to check password.');
            }

            if (data.breached) {
                Alert.alert(
                    'Security Risk',
                    `This password has been found in ${data.occurrences.toLocaleString()} data breaches. Please change it immediately if you use it anywhere.`,
                    [{ text: 'OK' }]
                );
            } else {
                showToast('Good news! This password hasn\'t been found in any known data breaches.', 'success');
            }
        } catch (error: any) {
            console.error('Error checking password breach:', error);
            showToast(error.message || 'Could not check password security. Please try again later.', 'error');
        } finally {
            setChecking(false);
            setCheckPassword(''); // Clear the password for security
        }
    };


    return (
        <ScreenContainer>
            <ScrollView>
                 <View style={[styles.menuSection, { borderColor: colors.border }]}>
                    {menuItems.map((item, index) => (
                        <SecurityListItem
                            key={item.text}
                            icon={item.icon}
                            text={item.text}
                            onPress={() => router.push(item.path as any)}
                            colors={colors}
                         />
                    ))}
                </View>
                <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12}}>
                        <ShieldCheck color={colors.primary} size={24} />
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Check Password Security
                        </Text>
                    </View>
                    <Text style={[styles.description, { color: colors.textSecondary }]}>
                        Enter any password to check if it has appeared in known data breaches. This check is secure and your password is never sent over the network in plaintext.
                    </Text>

                    <TextInput
                        style={[styles.passwordInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                        value={checkPassword}
                        onChangeText={setCheckPassword}
                        placeholder="Enter a password to check"
                        placeholderTextColor={colors.textSecondary}
                        secureTextEntry
                    />
                    <Button
                        title={checking ? "Checking..." : "Check Password"}
                        onPress={checkBreachedPassword}
                        isLoading={checking}
                        style={{ marginTop: 10 }}
                    />
                </View>
            </ScrollView>
        </ScreenContainer>
    )
}

const styles = StyleSheet.create({
    menuSection: { marginHorizontal: 16, marginTop: 20, borderRadius: 12, overflow: 'hidden', borderWidth: 1 },
    listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 16, borderBottomWidth: 1 },
    listItemText: { flex: 1, fontSize: 16, marginLeft: 16, fontWeight: '500' },
    section: {
        marginHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginVertical: 20
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16
    },
    passwordInput: {
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 12,
        fontSize: 16,
        borderWidth: 1
    }
});