// src/app/(auth)/register.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, Circle, RefreshCw, Eye, EyeOff, UserPlus } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';
import { useToast } from '@/context/ToastProvider';
import ScreenContainer from '@/components/ScreenContainer'; // FIX: This component uses a default export, so it should be imported as `import ScreenContainer from ...`
import { Button, Card } from '@/components/common';
import PasswordStrengthIndicator from '@/components/common/PasswordStrengthIndicator';

const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => {
    const { colors } = useTheme();
    const Icon = met ? CheckCircle2 : Circle;
    const color = met ? colors.success : colors.textSecondary;
    return (
        <View style={styles.requirement}>
            <Icon color={color} size={16} style={{ opacity: met ? 1 : 0.5 }} />
            <Text style={[styles.requirementText, { color }]}>{text}</Text>
        </View>
    );
};

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordsMatch, setPasswordsMatch] = useState(false);

    const router = useRouter();
    const { signUp } = useAuth();
    const { colors } = useTheme();
    const { showToast } = useToast();

    useEffect(() => {
        setPasswordsMatch(password.length > 0 && password === confirmPassword);
    }, [password, confirmPassword]);

    const requirements = {
        length: password.length >= 8,
        capital: /[A-Z]/.test(password),
        small: /[a-z]/.test(password),
        number: /\d/.test(password),
        symbol: /[^A-Za-z0-9]/.test(password),
    };
    const allRequirementsMet = Object.values(requirements).every(Boolean);

    const handleRegister = async () => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Please enter a valid email.'); return; }
        if (!allRequirementsMet) { setPasswordError('Password does not meet all requirements.'); return; }
        if (!passwordsMatch) { setPasswordError('Passwords do not match.'); return; }
        if (!termsAccepted) { showToast('Please accept the terms and conditions.', 'error'); return; }
        
        setLoading(true);
        const { error } = await signUp({ email, password, displayName: displayName || email.split('@')[0] });
        setLoading(false);

        if (error) {
            showToast(error.message, 'error');
        } else {
            showToast('Registration successful! Please check your email to verify.', 'success');
            router.replace('/(auth)/login');
        }
    };
    
    return (
        <ScreenContainer>
            <View style={styles.contentContainer}>
                <Card>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <UserPlus color={colors.primary} size={40} style={styles.headerIcon} />
                        <Text style={[styles.title, { color: colors.text }]}>Create an Account</Text>

                        <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} placeholder="Display Name (Optional)" placeholderTextColor={colors.textSecondary} value={displayName} onChangeText={setDisplayName} />
                        <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: emailError ? colors.error : colors.border }]} placeholder="Email" placeholderTextColor={colors.textSecondary} value={email} onChangeText={(t) => { setEmail(t); setEmailError(''); }} keyboardType="email-address" autoCapitalize="none" />
                        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                        
                        <View style={styles.passwordContainer}>
                            <TextInput style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: colors.background, color: colors.text, borderColor: passwordError ? colors.error : colors.border }]} placeholder="Password" placeholderTextColor={colors.textSecondary} value={password} onChangeText={(t) => { setPassword(t); setPasswordError(''); }} secureTextEntry={!showPassword} />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                {showPassword ? <Eye color={colors.textSecondary} size={20} /> : <EyeOff color={colors.textSecondary} size={20} />}
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.passwordContainer}>
                            <TextInput style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: colors.background, color: colors.text, borderColor: passwordError && !passwordsMatch ? colors.error : colors.border }]} placeholder="Confirm Password" placeholderTextColor={colors.textSecondary} value={confirmPassword} onChangeText={(t) => { setConfirmPassword(t); setPasswordError(''); }} secureTextEntry={!showConfirmPassword} />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                                {showConfirmPassword ? <Eye color={colors.textSecondary} size={20} /> : <EyeOff color={colors.textSecondary} size={20} />}
                            </TouchableOpacity>
                        </View>
                        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

                        <PasswordStrengthIndicator password={password} />
                        
                        <View style={styles.requirementsContainer}>
                            <PasswordRequirement met={requirements.length} text="At least 8 characters" />
                            <PasswordRequirement met={requirements.capital} text="One uppercase letter" />
                            <PasswordRequirement met={requirements.number} text="One number" />
                            <PasswordRequirement met={requirements.symbol} text="One symbol" />
                            <PasswordRequirement met={passwordsMatch} text="Passwords match" />
                        </View>

                        <TouchableOpacity style={styles.checkboxContainer} onPress={() => setTermsAccepted(!termsAccepted)}>
                            {termsAccepted ? <CheckCircle2 color={colors.primary} size={24} /> : <Circle color={colors.textSecondary} size={24} />}
                            <Text style={[styles.checkboxLabel, { color: colors.text }]}>I accept the terms and conditions</Text>
                        </TouchableOpacity>

                        <Button title="Create Account" onPress={handleRegister} isLoading={loading} disabled={loading || !termsAccepted || !allRequirementsMet || !passwordsMatch} style={styles.button} />
                        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                            <Text style={[styles.link, { color: colors.textSecondary }]}>Already have an account? <Text style={{fontWeight: 'bold', color: colors.primary}}>Login</Text></Text>
                        </TouchableOpacity>
                    </ScrollView>
                </Card>
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    contentContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
    scrollContent: { padding: 20 },
    headerIcon: { alignSelf: 'center', marginBottom: 16 },
    title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
    input: { height: 50, borderRadius: 12, paddingHorizontal: 16, marginBottom: 12, fontSize: 16, borderWidth: 1 },
    passwordContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    eyeIcon: { position: 'absolute', right: 15, top: 15 },
    requirementsContainer: { marginTop: 16, paddingLeft: 10, gap: 8 },
    requirement: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    requirementText: { fontSize: 14 },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 },
    checkboxLabel: { fontSize: 15, fontWeight: '500' },
    button: { marginBottom: 24, marginTop: 16 },
    link: { textAlign: 'center', fontSize: 14 },
    errorText: { color: '#D32F2F', marginTop: -8, marginBottom: 10, marginLeft: 4, fontSize: 13 },
});