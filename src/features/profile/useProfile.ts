import { useState, useEffect } from 'react';
import { updateProfile as updateProfileService, getProfile as profileServiceGetProfile } from '@/services/profileService';
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
                const { profile: userProfile, error } = await profileServiceGetProfile(userId);
                if (error) throw error;
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
