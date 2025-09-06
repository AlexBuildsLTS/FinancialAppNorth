// Module declarations moved to src/types/module-declarations.d.ts to avoid in-file ambient declarations.
// Install real packages or add proper typings for best TypeScript support.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import * as profileService from '@/services/profileService';
import { fetchTransactions } from '@/services/transactionService';
import { Banknote, DollarSign, TrendingDown, TrendingUp } from 'lucide-react-native';
import {
  Transaction,
  Profile,
  DashboardMetricItem,
  Notification,
} from '@/types';

/**
 * Local lightweight chart point type (ChartDataPoint was not exported from @/types).
 */
type ChartPoint = { value: number; label: string };

/**
 * useFrameworkReady - ensures fonts (and other framework readiness tasks) are loaded.
 */
export function useFrameworkReady(): boolean {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      setIsReady(true);
    }
  }, [fontsLoaded]);

  return isReady;
}

/**
 * useTransactions - fetches transactions for the current authenticated user and subscribes to changes.
 */
export function useTransactions() {
  const { session } = useAuth();
  const user = session?.user;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;
      setTransactions((data as Transaction[]) || []);
    } catch (e: unknown) {
      setError('Could not load transactions.');
      console.error('useTransactions fetch error', e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTransactions();
    const channel = supabase
      .channel('public:transactions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTransactions]);

  return { transactions, isLoading, error, refreshTransactions: fetchTransactions };
}

/**
 * useProfile - loads a Profile by userId using the profileService (handles several possible exported names).
 */
export const useProfile = (userId: string | undefined) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const fn =
          (profileService as any).getProfile ??
          (profileService as any).fetchProfile ??
          (profileService as any).default;
        if (!fn) throw new Error('profileService missing getter');
        const userProfile = await fn(userId);
        setProfile(userProfile);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  return { profile, loading };
};

/**
 * useDashboardData - composes dashboard metrics, recent transactions and chart data.
  const [metrics, setMetrics] = useState<DashboardMetricItem[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!profile?.id) {
      setIsLoading(false);
    setIsLoading(true);
    try {
      // Use the existing fetchTransactions service to get recent transactions (limit 5).
      const transactionsData = await fetchTransactions(5);

      setRecentTransactions(transactionsData || []);

      // Build simple chart data from recent transactions (value + date label)
      const sanitizedChartData = (transactionsData || []).map((t: any) => ({
        value: t.amount ?? 0,
        label: t.created_at ? new Date(t.created_at).toLocaleDateString() : '',
      }));
      setChartData(sanitizedChartData);

      const income = (transactionsData || [])
        .filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: Transaction) => sum + (t.amount || 0), 0);
      const expenses = (transactionsData || [])
        .filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: Transaction) => sum + (t.amount || 0), 0);

      setMetrics([
        {
          title: 'Balance',
          value: `$${(income - expenses).toLocaleString('en-US')}`,
          change: 0,
          changeType: 'positive',
          Icon: DollarSign,
        },
        {
          title: 'Income',
          value: `$${income.toLocaleString('en-US')}`,
          change: 0,
          changeType: 'positive',
          Icon: TrendingUp,
        },
        {
          title: 'Expenses',
          value: `$${expenses.toLocaleString('en-US')}`,
          change: 0,
          changeType: 'negative',
          Icon: TrendingDown,
        },
        {
          title: 'Savings',
          value: '$0.00',
          change: 0,
          changeType: 'positive',
          Icon: Banknote,
        },
      ]);
    } catch (error) {
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { metrics, chartData, recentTransactions, isLoading, refreshData: fetchData };
}

/**
export const useChartData = () => {
  const chartData = useMemo<ChartPoint[]>(() => {
    const data: ChartPoint[] = [];
    let lastValue = 50;
    for (let i = 0; i < 12; i++) {
      lastValue += Math.random() * 20 - 10;
      data.push({
        value: Math.max(20, Math.round(lastValue)),
        label: new Date(0, i).toLocaleString('default', { month: 'short' }),
      });
    }
    return data;
  }, []);

  return { chartData };
};
  return { chartData };
};

/**
 * useNotifications - fetches notifications for the current profile and subscribes to inserts.
 */
export function useNotifications() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!profile) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      const items = (data as Notification[]) || [];
      setNotifications(items);
      const unread = items.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    }
  }, [profile]);

  useEffect(() => {
    fetchNotifications();
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  return { notifications, unreadCount, refreshNotifications: fetchNotifications };
}
