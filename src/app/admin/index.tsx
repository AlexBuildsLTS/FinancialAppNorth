import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { Users, BarChart3, Bell, ShieldCheck } from 'lucide-react-native';

// A reusable component for dashboard items
const AdminDashboardItem = ({
  icon: Icon,
  title,
  description,
  onPress,
  colors,
}: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.itemContainer, { backgroundColor: colors.surface }]}
  >
    <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
      <Icon color="#FFFFFF" size={24} />
    </View>
    <View style={styles.textContainer}>
      <Text style={[styles.itemTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.itemDescription, { color: colors.textSecondary }]}>
        {description}
      </Text>
    </View>
  </TouchableOpacity>
);

const AdminDashboardScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const adminActions = [
    {
      icon: Users,
      title: 'Manage Users',
      description: 'View, edit roles, and manage all users.',
      onPress: () => router.push('./manage-users'),
    },
    {
      icon: BarChart3,
      title: 'System Analytics',
      description: 'View application-wide usage statistics.',
      onPress: () => {
        /* Placeholder for future screen */
      },
    },
    {
      icon: Bell,
      title: 'Global Messaging',
      description: 'Send notifications to user groups.',
      onPress: () => {
        /* Placeholder for future screen */
      },
    },
    {
      icon: ShieldCheck,
      title: 'Auditing & Compliance',
      description: 'Access system logs and compliance reports.',
      onPress: () => {
        /* Placeholder for future screen */
      },
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Admin Panel
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Welcome, {user?.displayName || 'Administrator'}.
        </Text>
      </View>

      <View style={styles.actionsGrid}>
        {adminActions.map((action, index) => (
          <AdminDashboardItem
            key={index}
            icon={action.icon}
            title={action.title}
            description={action.description}
            onPress={action.onPress}
            colors={colors}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  actionsGrid: {
    paddingHorizontal: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  iconContainer: {
    padding: 12,
    borderRadius: 8,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});

export default AdminDashboardScreen;
