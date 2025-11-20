import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/shared/context/ThemeProvider';
import { useAuth } from '@/shared/context/AuthContext';
import { GlassCard } from '@/shared/components/GlassCard';
import { RoleBadge } from '@/shared/components/RoleBadge';
import { AppFooter } from '@/shared/components/AppFooter';
import { ProfileDropdown } from '@/shared/components/ProfileDropdown';
import { DashboardCharts } from '@/features/dashboard/DashboardCharts';
import { BudgetOverview } from '@/features/dashboard/BudgetOverview';
import { RecentTransactions } from '@/features/dashboard/RecentTransactions'; // IMPORTED
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Bell, MessageCircle } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';

export default function Dashboard() {
  const { theme, isDark } = useTheme();
  const { profile } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  
  const [menuVisible, setMenuVisible] = useState(false);
  const { metrics, loading, refreshData } = useDashboardData();

  const role = profile?.role || 'member';
  const isWide = width > 768;

  const logoSource = isDark 
    ? require('../../assets/images/NFIconDark.png') 
    : require('../../assets/images/NFIconLight.png');

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      <ProfileDropdown visible={menuVisible} onClose={() => setMenuVisible(false)} />

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 10 }]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshData} tintColor={theme.colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. HEADER */}
        <View style={styles.header}>
           <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
             <Image source={logoSource} style={{ width: 36, height: 36 }} contentFit="contain" />
             <View>
                <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>Welcome Back,</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[styles.name, { color: theme.colors.textPrimary }]}>
                    {profile?.first_name || 'User'}
                  </Text>
                  <RoleBadge role={role} />
                </View>
             </View>
           </View>

           <View style={styles.headerRight}>
              <TouchableOpacity onPress={() => router.push('/(main)/messages')} style={styles.iconBtn}>
                 <MessageCircle size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                 <Bell size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMenuVisible(true)}>
                <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                   <Text style={{color:'#FFF', fontWeight:'800', fontSize: 14}}>
                     {(profile?.first_name?.[0] || 'U').toUpperCase()}
                   </Text>
                </View>
              </TouchableOpacity>
           </View>
        </View>

        {/* 2. METRICS (4 Cards) */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.grid}>
           <MetricCard label="Total Balance" value={`$${metrics?.totalBalance?.toLocaleString() ?? '0.00'}`} icon={Wallet} color="#4F46E5" />
           <MetricCard label="Income" value={`$${metrics?.monthlyIncome?.toLocaleString() ?? '0.00'}`} icon={TrendingUp} color="#10B981" />
           <MetricCard label="Expenses" value={`$${metrics?.monthlyExpenses?.toLocaleString() ?? '0.00'}`} icon={TrendingDown} color="#EF4444" />
           <MetricCard label="Savings" value={`$${metrics?.savingsGoal?.toLocaleString() ?? '0.00'}`} icon={PiggyBank} color="#F59E0B" />
        </Animated.View>

        {/* 3. CHARTS & BUDGETS */}
        <Animated.View entering={FadeInDown.delay(200)} style={[
            styles.contentRow,
            { flexDirection: isWide ? 'row' : 'column' }
        ]}>
           <View style={{ flex: 1, minHeight: 300 }}>
              <DashboardCharts incomeData={metrics?.incomeChartData} />
           </View>
           <View style={{ flex: 1, minHeight: 300 }}>
              <BudgetOverview budgets={metrics?.budgets} onManage={() => router.push('/(main)/budgets')} />
           </View>
        </Animated.View>

        {/* 4. RECENT TRANSACTIONS (NEW SECTION) */}
        <Animated.View entering={FadeInDown.delay(300)}>
           <RecentTransactions 
              data={metrics?.recentTransactions} 
              onViewAll={() => router.push('/(main)/transactions')} 
           />
        </Animated.View>

        {/* 5. FOOTER */}
        <AppFooter />
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const MetricCard = ({ label, value, icon: Icon, color }: any) => {
  const { theme } = useTheme();
  return (
    <GlassCard style={styles.metricCard}>
       <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <View style={{ padding: 10, borderRadius: 12, backgroundColor: `${color}15` }}>
             <Icon size={20} color={color} />
          </View>
       </View>
       <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginBottom: 4 }}>{label}</Text>
       <Text style={{ color: theme.colors.textPrimary, fontSize: 18, fontWeight: '700' }}>{value}</Text>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  greeting: { fontSize: 12, fontWeight: '500', marginRight: 8 },
  name: { fontSize: 18, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  metricCard: { width: '48%', padding: 16, borderRadius: 24 },
  contentRow: { gap: 16, marginBottom: 24 },
});