// src/services/adminService.ts

import { supabase } from '@/lib/supabase'; // Adjust import as needed
import { User } from '@/types';

export const adminService = {
    getUsers: async (): Promise<User[]> => {
        const { data, error } = await supabase.from('users').select('*');
        if (error) throw error;
        return data as User[];
    },

    updateUser: async (
        userId: string,
        updates: Partial<User>
    ): Promise<{ updatedUser: User | null; error: any | null }> => {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId)
            .single();
        return { updatedUser: data as User | null, error };
    },

    deleteUser: async (userId: string): Promise<void> => {
        const { error } = await supabase.from('users').delete().eq('id', userId);
        if (error) throw error;
    },

    toggleUserStatus: async (userId: string, isActive: boolean): Promise<void> => {
        const { error } = await supabase
            .from('users')
            .update({ is_active: isActive })
            .eq('id', userId);
        if (error) throw error;
    },
};