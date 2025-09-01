// src/app/(tabs)/_layout.tsx

import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';
import { UserRole } from '@/types';
import { View, ActivityIndicator, Platform, Pressable, StyleSheet } from 'react-native';
import { MainHeader } from '@/components/common';
import TabIcon from '@/components/common/TabIcon';
import { LayoutDashboard, Wallet, User, Plus, Briefcase, ShieldCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const tabScreenConfig = [
	{ name: 'index', title: 'Dashboard', Icon: LayoutDashboard, roles: [UserRole.MEMBER, UserRole.CPA, UserRole.PREMIUM_MEMBER] },
	{ name: 'transactions', title: 'Transactions', Icon: Wallet, roles: [UserRole.MEMBER, UserRole.CPA, UserRole.PREMIUM_MEMBER] },
	// camera removed from visible tabs (we use FAB instead)
	{ name: 'clients', title: 'Clients', Icon: Briefcase, roles: [UserRole.CPA] },
	{ name: 'profile', title: 'Profile', Icon: User, roles: [UserRole.MEMBER, UserRole.CPA, UserRole.ADMIN, UserRole.PREMIUM_MEMBER] },
];

// Permissions map (Admin has broad access)
const PERMISSIONS = {
	[UserRole.ADMIN]: [UserRole.ADMIN, UserRole.CPA, UserRole.PREMIUM_MEMBER, UserRole.MEMBER],
	[UserRole.CPA]: [UserRole.CPA, UserRole.PREMIUM_MEMBER, UserRole.MEMBER],
	[UserRole.PREMIUM_MEMBER]: [UserRole.PREMIUM_MEMBER, UserRole.MEMBER],
	[UserRole.MEMBER]: [UserRole.MEMBER],
	[UserRole.SUPPORT]: [],
	[UserRole.CLIENT]: [],
} as Record<UserRole, UserRole[]>;

const hasPermission = (userRole: UserRole, tabRoles: UserRole[]): boolean => {
	if (!userRole) return false;
	const userPermissions = PERMISSIONS[userRole] || [];
	return tabRoles.some(requiredRole => userPermissions.includes(requiredRole));
};

const AddButtonOverlay = ({ onPress }: { onPress: () => void }) => {
	const { colors } = useTheme();
	return (
		// container must not intercept pointer events so underlying UI remains clickable
		<View pointerEvents="none" style={styles.fabWrapper}>
			{/* Pressable must accept events explicitly */}
			<Pressable
				pointerEvents="auto"
				onPress={onPress}
				style={({ pressed }) => [styles.addButton, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
			>
				<Plus color={colors.primaryContrast} size={28} />
			</Pressable>
		</View>
	);
};

export default function TabLayout() {
	const { colors } = useTheme();
	const { profile, isAuthenticated, isLoading } = useAuth();
	const router = useRouter();

	if (isLoading) {
		return <View style={styles.centered}><ActivityIndicator /></View>;
	}

	if (!isAuthenticated || !profile) {
		return <Redirect href="/login" />;
	}

	const userRole = profile.role;
	const is_admin = userRole === UserRole.ADMIN;

	// Build visible tabs
	let visibleTabs = tabScreenConfig.filter(tab => hasPermission(userRole, tab.roles));

	// decide whether to show FAB (members, premium, CPA allowed to add entries)
	const canShowFab = [UserRole.MEMBER, UserRole.PREMIUM_MEMBER, UserRole.CPA].includes(userRole);

	const onFabPress = () => {
		// navigate to the camera / add-entry route inside tabs
		// replace with the route name you use for creating an entry if different
		router.push('/(tabs)/camera');
	};

	return (
		<View style={{ flex: 1 }}>
			<Tabs
				screenOptions={{
					// force header to re-render when avatar changes by using key on MainHeader
					header: () => <MainHeader key={profile?.avatar_url ?? ''} />,
					tabBarActiveTintColor: colors.primary,
					tabBarInactiveTintColor: colors.textSecondary,
					tabBarShowLabel: false,
					tabBarStyle: {
						backgroundColor: colors.surface,
						borderTopColor: colors.border,
						height: Platform.OS === 'ios' ? 80 : 65,
					},
				}}
			>
				{visibleTabs.map(({ name, title, Icon }) => (
					<Tabs.Screen
						key={name}
						name={name}
						options={{
							title: title,
							tabBarIcon: ({ color, focused }) => <TabIcon Icon={Icon} color={color} size={focused ? 30 : 28} />,
						}}
					/>
				))}

				{is_admin && (
					<Tabs.Screen
						name="admin"
						options={{
							title: 'Admin',
							href: '/(tabs)/admin',
							tabBarIcon: ({ color, focused }) => <TabIcon Icon={ShieldCheck} color={color} size={focused ? 30 : 28} />,
						}}
					/>
				)}

				{/* keep other screens available but hidden from tab bar */}
				<Tabs.Screen name="documents" options={{ href: null }} />
				<Tabs.Screen name="support" options={{ href: null }} />
				<Tabs.Screen name="camera" options={{ href: null }} /> {/* keep the camera route available for the FAB to navigate to */}
			</Tabs>

			{/* FAB overlay (positioned above tabs). Only show for allowed roles. */}
			{canShowFab && <AddButtonOverlay onPress={onFabPress} />}
		</View>
	);
}

const styles = StyleSheet.create({
	centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	fabWrapper: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: Platform.OS === 'ios' ? 28 : 12,
		alignItems: 'center',
		justifyContent: 'center',
		pointerEvents: 'box-none',
	},
	addButton: {
		width: 64,
		height: 64,
		borderRadius: 32,
		justifyContent: 'center',
		alignItems: 'center',
		// subtle shadow
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.14,
		shadowRadius: 8,
		elevation: 6,
	},
});