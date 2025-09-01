import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';
import ScreenContainer from '@/components/ScreenContainer'; // FIX: Corrected import
import { Avatar } from '@/components/common/Avatar'; // FIX: Corrected named import
import { ChevronRight, LogOut, Shield, KeyRound, Palette, User, Users, Star, Briefcase, LifeBuoy, ShieldCheck } from 'lucide-react-native';
import { Link } from 'expo-router';
import { UserRoleDisplayNames } from '@/types';

const ProfileOption = ({ href, text, Icon, isLast = false }: { href: any; text: string; Icon: React.ElementType; isLast?: boolean }) => {
    const { colors } = useTheme();
    return (
        <Link href={href} asChild>
            <Pressable>
                <View style={[styles.optionRow, { borderBottomWidth: isLast ? 0 : 1, borderBottomColor: colors.border }]}>
                    <Icon size={20} color={colors.textSecondary} />
                    <Text style={[styles.optionText, { color: colors.text }]}>{text}</Text>
                    <ChevronRight size={20} color={colors.textSecondary} />
                </View>
            </Pressable>
        </Link>
    );
};

const roleMeta: Record<string, { Icon: React.ElementType; color: string; label: string }> = {
	Member: { Icon: User, color: '#2ecc71', label: 'Member' },
	'Premium Member': { Icon: Star, color: '#f1c40f', label: 'Premium Member' },
	Professional: { Icon: Briefcase, color: '#3498db', label: 'Professional (CPA)' },
	Support: { Icon: LifeBuoy, color: '#9b59b6', label: 'Support' },
	Administrator: { Icon: ShieldCheck, color: '#e74c3c', label: 'Administrator' },
	// fallback
	unknown: { Icon: Users, color: '#7f8c8d', label: 'User' },
};

export default function ProfileScreen() {
    const { colors } = useTheme();
    const { profile, signOut } = useAuth();

    if (!profile) {
        return <ScreenContainer><View style={styles.centered}><ActivityIndicator /></View></ScreenContainer>;
    }

    const meta = roleMeta[UserRoleDisplayNames[profile.role]] ?? roleMeta.unknown;

    return (
        <ScreenContainer>
            <ScrollView style={{ backgroundColor: colors.background }}>
                <View style={styles.container}>
                    <View style={styles.profileHeader}>
                        <Avatar url={profile.avatar_url} size={80} />
                        <View style={styles.profileInfo}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Text style={[styles.displayName, { color: colors.text }]}>{profile.display_name}</Text>
                                {/* role badge */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: `${meta.color}22` }}>
                                    {/* icon */}
                                    <meta.Icon size={14} color={meta.color} />
                                    <Text style={{ marginLeft: 6, color: meta.color, fontSize: 12, fontWeight: '600' }}>{meta.label}</Text>
                                </View>
                            </View>
                            <Text style={[styles.email, { color: colors.textSecondary }]}>{UserRoleDisplayNames[profile.role]}</Text>
                        </View>
                    </View>

                    <View style={[styles.optionsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <ProfileOption href="/(tabs)/profile/edit" text="Edit Profile" Icon={Palette} />
                        <ProfileOption href="/(tabs)/profile/security" text="Security" Icon={Shield} />
                        <ProfileOption href="/(tabs)/profile/api-keys" text="API Keys" Icon={KeyRound} isLast={true} />
                    </View>

                    <Pressable onPress={signOut}>
                        <View style={[styles.optionRow, styles.logoutButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <LogOut size={20} color={colors.error} />
                            <Text style={[styles.optionText, { color: colors.error }]}>Sign Out</Text>
                        </View>
                    </Pressable>
                </View>
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 32, gap: 20, },
    profileInfo: { gap: 8, },
    displayName: { fontSize: 22, fontWeight: 'bold', },
    email: { fontSize: 16, },
    optionsContainer: { borderRadius: 12, borderWidth: 1, overflow: 'hidden', },
    optionRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16, },
    optionText: { flex: 1, fontSize: 16, fontWeight: '500', },
    logoutButton: { marginTop: 24, borderRadius: 12, borderWidth: 1, },
});