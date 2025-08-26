import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, LogIn, CheckSquare, Square } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';
import { useToast } from '@/context/ToastProvider';
import ScreenContainer from '@/components/ScreenContainer';
import { Button, Card } from '@/components/common';
import * as SecureStore from 'expo-secure-store';

const EMAIL_KEY = 'stored_email';
const REMEMBER_ME_KEY = 'remember_me';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const { signInWithPassword } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const { colors } = useTheme();
    
useEffect(() => {
    const loadCredentials = async () => {
        try {
            const remembered = await SecureStore.getItemAsync(REMEMBER_ME_KEY);
            if (remembered === 'true') {
                // Use EMAIL_KEY constant instead of the email state variable
                const savedEmail = await SecureStore.getItemAsync(EMAIL_KEY);
                if (savedEmail) {
                    setEmail(savedEmail);
                    setRememberMe(true);
                }
            }
        } catch (error) {
            console.error("Failed to load credentials from secure store", error);
        }
    };
    loadCredentials();
}, []);

    const handleLogin = async () => {
        if (!email || !password) {
            showToast('Please enter both email and password.', 'error');
            return;
        }
        setLoading(true);
        const { error } = await signInWithPassword({ email, password, rememberMe });
        setLoading(false);
        if (error) {
            showToast(error.message, 'error');
        } else {
            showToast('Login successful!', 'success');
        }
    };

    return (
        <ScreenContainer style={styles.outerContainer}>
            <View style={styles.contentContainer}>
                <Card padding={32}>
                    <LogIn color={colors.primary} size={40} style={styles.headerIcon} />
                    <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign in to continue your work</Text>

                    <TextInput
                        style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                        placeholder="Email"
                        placeholderTextColor={colors.textSecondary}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                            placeholder="Password"
                            placeholderTextColor={colors.textSecondary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                            {showPassword ? <EyeOff color={colors.textSecondary} size={20} /> : <Eye color={colors.textSecondary} size={20} />}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.rememberMeContainer} onPress={() => setRememberMe(!rememberMe)}>
                        {rememberMe ? <CheckSquare color={colors.primary} size={20} /> : <Square color={colors.textSecondary} size={20} />}
                        <Text style={[styles.rememberMeText, { color: colors.textSecondary }]}>Remember Me</Text>
                    </TouchableOpacity>

                    <Button title="Login" onPress={handleLogin} isLoading={loading} style={styles.button} />
                    
                    <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                        <Text style={[styles.link, { color: colors.textSecondary }]}>
                            Don't have an account? <Text style={[styles.boldLink, { color: colors.primary }]}>Sign Up</Text>
                        </Text>
                    </TouchableOpacity>
                </Card>
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    outerContainer: { justifyContent: 'center', alignItems: 'center', flex: 1 },
    contentContainer: { width: '100%', maxWidth: 420, padding: 24 },
    headerIcon: { alignSelf: 'center', marginBottom: 16 },
    title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, fontFamily: 'Inter-Bold' },
    subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 32, fontFamily: 'Inter-Regular' },
    input: { height: 50, borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, fontSize: 16, borderWidth: 1, fontFamily: 'Inter-Regular' },
    passwordContainer: { flexDirection: 'row', alignItems: 'center' },
    eyeIcon: { position: 'absolute', right: 15, top: 15 },
    rememberMeContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 8, 
        marginTop: 8, // Added space from the password field above
        marginBottom: 24, 
        alignSelf: 'flex-start' 
    },
    rememberMeText: { fontSize: 14, fontFamily: 'Inter-Regular' },
    button: { marginBottom: 24 },
    link: { textAlign: 'center', fontSize: 14, fontFamily: 'Inter-Regular' },
    boldLink: { fontWeight: 'bold', fontFamily: 'Inter-Bold' },
});