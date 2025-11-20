// src/app/(auth)/login.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, LogIn } from 'lucide-react-native'; // Removed CheckSquare, Square as they are now handled by custom hook state
import { useAuth } from '@/shared/context/AuthContext';
import { useTheme } from '@/shared/context/ThemeProvider';
import { useToast } from '@/shared/context/ToastProvider';
import ScreenContainer from '@/shared/components/ScreenContainer';
import { Cards, Button } from '@/shared/components';
import * as SecureStore from 'expo-secure-store';

// --- Constants ---
const EMAIL_KEY = 'stored_email';
const REMEMBER_ME_KEY = 'remember_me';

// --- Custom Hook for Secure Storage Abstraction ---
interface Storage {
    getItemAsync: (key: string) => Promise<string | null>;
    setItemAsync: (key: string, value: string) => Promise<void>;
    deleteItemAsync: (key: string) => Promise<void>;
}

const useSecureStorage = (): Storage => {
    if (Platform.OS === 'web') {
        return {
            getItemAsync: async (key: string) => localStorage.getItem(key),
            setItemAsync: async (key: string, value: string) => localStorage.setItem(key, value),
            deleteItemAsync: async (key: string) => localStorage.removeItem(key),
        };
    } else {
        return SecureStore;
    }
};

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);

    const { signIn, sendPasswordResetEmail } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const { theme: { colors } } = useTheme();
    const storage = useSecureStorage(); // Use the custom hook

    // Load credentials from storage on component mount
    useEffect(() => {
        const loadCredentials = async () => {
            try {
                const remembered = await storage.getItemAsync(REMEMBER_ME_KEY);
                if (remembered === 'true') {
                    const savedEmail = await storage.getItemAsync(EMAIL_KEY);
                    if (savedEmail) {
                        setEmail(savedEmail);
                    }
                    setRememberMe(true);
                }
            } catch (error) {
                console.error('Failed to load credentials:', error);
                // Optionally show a toast for critical storage errors
                // showToast('Could not load saved credentials.', 'error');
            }
        };
        loadCredentials();
    }, [storage]); // Include storage in dependencies if it could change, though unlikely here

    // Handle user login
    const handleLogin = useCallback(async () => {
        if (!email || !password) {
            showToast('Please enter both email and password.', 'error');
            return;
        }
        setLoading(true);
        console.log('Attempting login with email:', email); // Debug log

        try {
            const { error } = await signIn({ email, password });

            if (error) {
                console.error('Login error:', error); // Debug log
                // Provide more specific error messages if possible from the error object
                showToast(error.message || 'Login failed. Please check your credentials.', 'error');
            } else {
                // Handle remember me functionality
                if (rememberMe) {
                    await storage.setItemAsync(EMAIL_KEY, email);
                    await storage.setItemAsync(REMEMBER_ME_KEY, 'true');
                } else {
                    // Clear stored credentials if remember me is off
                    await storage.deleteItemAsync(EMAIL_KEY);
                    await storage.deleteItemAsync(REMEMBER_ME_KEY);
                }
                showToast('Login successful!', 'success');
                // Navigate to the main app screen after successful login
                router.push('/(main)');
            }
        } catch (error) {
            console.error('An unexpected error occurred during login:', error);
            showToast('An unexpected error occurred. Please try again later.', 'error');
        } finally {
            setLoading(false);
        }
    }, [email, password, rememberMe, signIn, showToast, storage]); // Added dependencies for useCallback

    // Handle password reset request
    const handlePasswordReset = useCallback(async () => {
        if (!email) {
            showToast('Please enter your email to reset your password.', 'error');
            return;
        }
        setLoading(true);
        try {
            const { error } = await sendPasswordResetEmail(email);
            if (error) {
                console.error('Password reset error:', error);
                showToast(error.message || 'Failed to send password reset email. Please try again.', 'error');
            } else {
                showToast('Password reset link sent! Check your email.', 'success');
            }
        } catch (error) {
            console.error('An unexpected error occurred during password reset:', error);
            showToast('An unexpected error occurred. Please try again later.', 'error');
        } finally {
            setLoading(false);
        }
    }, [email, sendPasswordResetEmail, showToast]);

    // Toggle password visibility
    const toggleShowPassword = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    // Toggle remember me option
    const toggleRememberMe = useCallback(() => {
        setRememberMe(prev => !prev);
    }, []);

    return (
        <ScreenContainer>
            <View style={styles.outerContainer}>
                <View style={styles.contentContainer}>
                    <Cards padding={32}>
                        <LogIn color={colors.accent} size={40} style={styles.headerIcon} />
                        <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome Back</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign in to continue</Text>

                        <TextInput
                            style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                            placeholder="Email" 
                            placeholderTextColor={colors.textSecondary}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email" // Added for better mobile experience
                        />
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                                placeholder="Password"
                                placeholderTextColor={colors.textSecondary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoComplete="password" // Added for better mobile experience
                            />
                            <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeIcon}>
                                {showPassword ? <EyeOff color={colors.textSecondary} size={20} /> : <Eye color={colors.textSecondary} size={20} />}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.optionsContainer}>
                            <TouchableOpacity style={styles.rememberMeContainer} onPress={toggleRememberMe}>
                                {/* Using a simple conditional rendering for checkbox appearance */}
                                <View style={[styles.checkboxBase, { borderColor: rememberMe ? colors.accent : colors.textSecondary }]}>
                                    {rememberMe && <View style={[styles.checkboxChecked, { backgroundColor: colors.accent }]} />}
                                </View>
                                <Text style={[styles.rememberMeText, { color: colors.textSecondary }]}>Remember Me</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handlePasswordReset} disabled={loading}>
                                <Text style={[styles.link, { color: colors.accent }]}>Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>

                        <Button
                            title="Login"
                            onPress={handleLogin}
                            isLoading={loading}
                            style={styles.button}
                            disabled={loading} // Disable button while loading
                        />

                        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                            <Text style={[styles.link, { color: colors.textPrimary }]}>
                                Don't have an account? <Text style={[styles.boldLink, { color: colors.accent }]}>Sign Up</Text>
                            </Text>
                        </TouchableOpacity>
                    </Cards>
                </View>
            </View>
        </ScreenContainer>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    outerContainer: { justifyContent: 'center', alignItems: 'center', flex: 1 }, // Added flex: 1 to ensure it takes full height
    contentContainer: { width: '100%', maxWidth: 420, padding: 24 },
    headerIcon: { alignSelf: 'center', marginBottom: 16 },
    title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 32 },
    input: { height: 50, borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, marginBottom: 16 }, // Added marginBottom to input
    passwordContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, position: 'relative' }, // Added position: relative for absolute positioning of eye icon
    eyeIcon: { position: 'absolute', right: 15, top: '50%', transform: [{ translateY: -10 }], zIndex: 1 }, // Adjusted eye icon positioning
    optionsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    rememberMeContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    rememberMeText: { fontSize: 14 },
    button: { marginBottom: 24 },
    link: { textAlign: 'center', fontSize: 14 },
    boldLink: { fontWeight: 'bold' },
    // Custom checkbox styles
    checkboxBase: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        width: 14,
        height: 14,
        borderRadius: 2,
    },
}); 