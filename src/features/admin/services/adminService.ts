import { supabase } from '@/shared/lib/supabase';
import { Profile, Transaction, UserRole, UserStatus } from '@/shared/types';

// Mock data fetching functions for admin panel

export const fetchAdminOverviewMetrics = async () => {
  try {
    const [usersRes, transactionsRes, revenueRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase
        .from('transactions')
        .select('id', { count: 'exact', head: true }),
      // Mock revenue for now, actual calculation would be complex
      Promise.resolve({ data: [{ total_revenue: 48200 }] }),
    ]);

    if (usersRes.error || transactionsRes.error) {
      throw usersRes.error || transactionsRes.error;
    }

    return {
      totalUsers: usersRes.count || 0,
      totalTransactions: transactionsRes.count || 0,
      // Mock data for revenue and active CPAs
      activeCPAs: 87, // Placeholder
      revenueMRR: '$48.2K', // Placeholder
    };
  } catch (error) {
    console.error('Error fetching admin overview metrics:', error);
    throw error;
  }
};

export const fetchUserManagementData = async (
  roleFilter: string = 'All Roles'
) => {
  try {
    let query = supabase.from('profiles').select('*');

    if (roleFilter !== 'All Roles') {
      query = query.eq('role', roleFilter.toLowerCase());
    }

    const { data, error } = await query.order('full_name');

    if (error) {
      throw error;
    }
    return data as Profile[];
  } catch (error) {
    console.error('Error fetching user management data:', error);
    throw error;
  }
};

export const updateUser = async (
  id: string,
  updates: { display_name?: string; role?: UserRole }
) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id);
    if (error) {
      console.error('Error updating user:', error);
      return { error };
    }
    // Assuming the update returns the updated profile data
    return { data: data?.[0] as Profile };
  } catch (error: any) {
    console.error('An unexpected error occurred during user update:', error);
    return {
      error: { message: error.message || 'An unexpected error occurred' },
    };
  }
};

export const fetchSystemHealthData = async () => {
  try {
    // Mock data for system health
    return {
      databasePerformance: '98.5%',
      apiResponseTime: '125ms',
      serverLoad: '65%',
      storageUsage: '42% of 1TB used',
      activeSessions: 1248,
      errorRate: '0.02%',
    };
  } catch (error) {
    console.error('Error fetching system health data:', error);
    throw error;
  }
};

export const fetchUserGrowthData = async () => {
  try {
    // Mock data for user growth
    return {
      today: 42,
      week: 287,
      month: 1356,
    };
  } catch (error) {
    console.error('Error fetching user growth data:', error);
    throw error;
  }
};

export const fetchPlatformActivityData = async () => {
  try {
    // Mock data for platform activity
    return {
      activeSessions: '1,248',
      apiCalls24h: '245K',
      dataProcessed: '3.2 TB',
    };
  } catch (error) {
    console.error('Error fetching platform activity data:', error);
    throw error;
  }
};

export const fetchFeatureFlagData = async () => {
  try {
    // Mock data for feature flags
    return [
      {
        id: '1',
        title: 'Advanced Analytics',
        description: 'Enable advanced reporting and analytics features',
        enabled: true,
        roles: ['Premium', 'CPA', 'Administrator'],
      },
      {
        id: '2',
        title: 'AI Chat Assistant',
        description: 'Enable AI-powered financial assistant',
        enabled: true,
        roles: ['Member', 'Premium', 'CPA'],
      },
      {
        id: '3',
        title: 'Document OCR',
        description: 'Automatic text extraction from uploaded documents',
        enabled: false,
        roles: ['Premium', 'CPA'],
      },
      {
        id: '4',
        title: 'Client Management',
        description: 'CPA client portfolio management',
        enabled: true,
        roles: ['CPA', 'Administrator'],
      },
    ];
  } catch (error) {
    console.error('Error fetching feature flag data:', error);
    throw error;
  }
};

export const fetchAuditLogData = async () => {
  try {
    // Mock data for audit logs
    return [
      {
        type: 'User Role Changed',
        description: 'User Role Changed from Member to CPA',
        user: 'John Admin',
        timestamp: '2024-09-30 14:30:00',
        resource: 'User: sarah@cpa.com',
        ipAddress: '192.168.1.100',
      },
      {
        type: 'User Suspended',
        description: 'User Suspended',
        user: 'John Admin',
        timestamp: '2024-09-30 12:00:00',
        resource: 'User: lisa@suspended.com',
        ipAddress: '192.168.1.100',
      },
      {
        type: 'Feature Flag Updated',
        description: 'Feature Flag Updated: Advanced Analytics',
        user: 'John Admin',
        timestamp: '2024-09-20 09:00:00',
        resource: 'Feature: Advanced Analytics',
        ipAddress: '192.168.1.100',
      },
      {
        type: 'Ticket Resolved',
        description: 'Ticket Resolved',
        user: 'Emily Support',
        timestamp: '2024-09-20 09:45:00',
        resource: 'Ticket: #1234',
        ipAddress: '192.168.1.100',
      },
      {
        type: 'System Announcement',
        description: 'System Announcement: Maintenance',
        user: 'John Admin',
        timestamp: '2024-09-19 08:00:00',
        resource: 'Scheduled maintenance notification',
        ipAddress: '192.168.1.100',
      },
    ];
  } catch (error) {
    console.error('Error fetching audit log data:', error);
    throw error;
  }
};
export async function getUsers(): Promise<Profile[]> { 

  // Use the select() method to fetch all rows from the profiles table.
  const { data, error } = await supabase.from('profiles').select('*'); 
  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
  // Use nullish coalescing operator for clarity and to ensure an empty array is returned if data is null or undefined.
  return (data ?? []) as Profile[];
} 

export async function toggleUserStatus(userId: string, newStatus: UserStatus): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', userId);
    if (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  } catch (error: any) {
    console.error('An unexpected error occurred during user status toggle:', error);
    throw error;
  }
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  } catch (error: any) {
    console.error('An unexpected error occurred during user deletion:', error);
    throw error;
  }
}
