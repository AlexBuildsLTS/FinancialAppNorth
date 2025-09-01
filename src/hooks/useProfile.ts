import { useState, useEffect } from 'react';
import * as profileService from '@/services/profileService'; // use namespace import to avoid "no exported member" error
import { Profile } from '@/types';

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
                // try common names that service might export
                const fn = (profileService as any).getProfile ?? (profileService as any).fetchProfile ?? (profileService as any).default;
                if (!fn) throw new Error('profileService missing getter');
                const userProfile = await fn(userId);
                setProfile(userProfile);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    return { profile, loading };
};
