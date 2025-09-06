// src/app/(auth)/login.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, LogIn, CheckSquare, Square } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';
import { useToast } from '@/context/ToastProvider';
import ScreenContainer from '@/components/ScreenContainer'; // This is a default export
import { Card } from '@/components/common'; // Card is a named export
import { Button } from '@/components/common/Button'; // Button is a named export
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const EMAIL_KEY = 'stored_email';
const REMEMBER_ME_KEY = 'remember_me';

const storage = Platform.OS === 'web' ? {
    getItemAsync: async (key: string) => localStorage.getItem(key),
    setItemAsync: async (key: string, value: string) => localStorage.setItem(key, value),
    deleteItemAsync: async (key: string) => localStorage.removeItem(key),
} : SecureStore;

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const { signIn } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const { colors } = useTheme();
    
    useEffect(() => {
        const loadCredentials = async () => {
            try {
                const remembered = await storage.getItemAsync(REMEMBER_ME_KEY);
                if (remembered === 'true') {
                    const savedEmail = await storage.getItemAsync(EMAIL_KEY);
                    if (savedEmail) setEmail(savedEmail);
                    setRememberMe(true);
                }
            } catch (e) { console.error('Failed to load credentials:', e); }
        };
        loadCredentials();
    }, []);

    const handleLogin = async () => {
        if (!email || !password) {
            showToast('Please enter both email and password.', 'error');
            return;
        }
        setLoading(true);
        console.log('Attempting login with email:', email); // Debug log
        const { error } = await signIn(email, password);
        setLoading(false);
        if (error) {
            console.error('Login error:', error); // Debug log
            showToast(error.message, 'error');
        } else {
            if (rememberMe) {
                await storage.setItemAsync(EMAIL_KEY, email);
                await storage.setItemAsync(REMEMBER_ME_KEY, 'true');
            } else {
                await storage.deleteItemAsync(EMAIL_KEY);
                await storage.deleteItemAsync(REMEMBER_ME_KEY);
            }
            showToast('Login successful!', 'success');
        }
    };

    const handlePasswordReset = async () => {
        showToast('Password reset is not implemented.', 'info');
    };

    return (
        <ScreenContainer>
            <View style={styles.outerContainer}>
                <View style={styles.contentContainer}>
                <Card>
                    <LogIn color={colors.primary} size={40} style={styles.headerIcon} />
                    <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign in to continue</Text>

                    <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} placeholder="Email" placeholderTextColor={colors.textSecondary} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                    <View style={styles.passwordContainer}>
                        <TextInput style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} placeholder="Password" placeholderTextColor={colors.textSecondary} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                            {showPassword ? <EyeOff color={colors.textSecondary} size={20} /> : <Eye color={colors.textSecondary} size={20} />}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.optionsContainer}>
                        <TouchableOpacity style={styles.rememberMeContainer} onPress={() => setRememberMe(!rememberMe)}>
                            {rememberMe ? <CheckSquare color={colors.primary} size={20} /> : <Square color={colors.textSecondary} size={20} />}
                            <Text style={[styles.rememberMeText, { color: colors.textSecondary }]}>Remember Me</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handlePasswordReset}>
                           <Text style={[styles.link, { color: colors.primary }]}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>

                    <Button title="Login" onPress={handleLogin} isLoading={loading} style={styles.button} />
                    
                    <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                        <Text style={[styles.link, { color: colors.textSecondary }]}>
                            Don't have an account? <Text style={[styles.boldLink, { color: colors.primary }]}>Sign Up</Text>
                        </Text>
                    </TouchableOpacity>
                </Card>
                </View>
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    outerContainer: { justifyContent: 'center', alignItems: 'center' },
    contentContainer: { width: '100%', maxWidth: 420, padding: 24 },
    headerIcon: { alignSelf: 'center', marginBottom: 16 },
    title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 32 },
    input: { height: 50, borderRadius: 12, paddingHorizontal: 16, borderWidth: 1 },
    passwordContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    eyeIcon: { position: 'absolute', right: 15, top: 15 },
    optionsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    rememberMeContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    rememberMeText: { fontSize: 14 },
    button: { marginBottom: 24 },
    link: { textAlign: 'center', fontSize: 14 },
    boldLink: { fontWeight: 'bold' },
});