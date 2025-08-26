import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, Circle, RefreshCw, Eye, EyeOff, UserPlus } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';
import { useToast } from '@/context/ToastProvider';
import ScreenContainer from '@/components/ScreenContainer';
import { Button, Card, PasswordStrengthIndicator } from '@/components/common';

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
    const [passwordStrength, setPasswordStrength] = useState<'empty' | 'weak' | 'medium' | 'strong' | 'very-strong'>('empty');

    const router = useRouter();
    const { signUp } = useAuth();
    const { colors } = useTheme();
    const { showToast } = useToast();

    useEffect(() => {
        if (password.length > 0 && confirmPassword.length > 0) {
            setPasswordsMatch(password === confirmPassword);
        } else {
            setPasswordsMatch(false);
        }
    }, [password, confirmPassword]);

    const requirements = {
        length: password.length >= 8,
        capital: /[A-Z]/.test(password),
        small: /[a-z]/.test(password),
        number: /\d/.test(password),
        symbol: /[^A-Za-z0-9]/.test(password),
    };
    const allRequirementsMet = Object.values(requirements).every(Boolean);

    const validateEmail = (text: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);

    const generatePassword = () => {
        const length = 12;
        const chars = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };
        const allChars = Object.values(chars).join('');
        const getRandomChar = (charSet: string) => charSet.charAt(Math.floor(Math.random() * charSet.length));
        const newPassword = [
            getRandomChar(chars.uppercase),
            getRandomChar(chars.lowercase),
            getRandomChar(chars.numbers),
            getRandomChar(chars.symbols),
            ...Array.from({ length: length - 4 }, () => getRandomChar(allChars))
        ].sort(() => Math.random() - 0.5).join('');
        setPassword(newPassword);
        setConfirmPassword(newPassword);
        setPasswordError('');
        showToast('Generated a secure password.', 'info');
    };

    const handleRegister = async () => {
        setEmailError('');
        setPasswordError('');
        if (!email.trim() || !validateEmail(email)) {
            setEmailError('Please enter a valid email address.');
            return;
        }
        if (!password) {
            setPasswordError('Password is required.');
            return;
        }
        if (!allRequirementsMet) {
            setPasswordError('Password does not meet all requirements.');
            return;
        }
        if (!passwordsMatch) {
            setPasswordError('Passwords do not match.');
            return;
        }
        if (!termsAccepted) {
            showToast('Please accept the terms and conditions.', 'error');
            return;
        }
        setLoading(true);
        try {
            const { error } = await signUp(email, password, displayName || email.split('@')[0]);
            if (error) {
                showToast(error.message || 'Registration failed.', 'error');
            } else {
                showToast('Registration successful! Please check your email to verify your account.', 'success');
                router.replace('/(auth)/login');
            }
        } catch (err: any) {
            showToast(err.message || 'An unexpected error occurred.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const isButtonDisabled = loading || !email || !password || !termsAccepted || !allRequirementsMet || !passwordsMatch;

    return (
        <ScreenContainer style={styles.outerContainer}>
            <View style={styles.contentContainer}>
                <Card>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <UserPlus color={colors.primary} size={40} style={styles.headerIcon} />
                        <Text style={[styles.title, { color: colors.text }]}>Create an Account</Text>

                        <TextInput
                            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                            placeholder="Display Name (Optional)"
                            placeholderTextColor={colors.textSecondary}
                            value={displayName}
                            onChangeText={setDisplayName}
                        />
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: emailError ? colors.error : colors.border }]}
                            placeholder="Email"
                            placeholderTextColor={colors.textSecondary}
                            value={email}
                            onChangeText={(text) => { setEmail(text); setEmailError(''); }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                        
                        <View style={styles.passwordWrapper}>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: colors.background, color: colors.text, borderColor: passwordError ? colors.error : colors.border }]}
                                    placeholder="Password"
                                    placeholderTextColor={colors.textSecondary}
                                    value={password}
                                    onChangeText={(text) => { setPassword(text); setPasswordError(''); }}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                    {showPassword ? <Eye color={colors.textSecondary} size={20} /> : <EyeOff color={colors.textSecondary} size={20} />}
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                        <View style={styles.passwordWrapper}>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: colors.background, color: colors.text, borderColor: passwordError && !passwordsMatch ? colors.error : colors.border }]}
                                    placeholder="Confirm Password"
                                    placeholderTextColor={colors.textSecondary}
                                    value={confirmPassword}
                                    onChangeText={(text) => { setConfirmPassword(text); setPasswordError(''); }}
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                                    {showConfirmPassword ? <Eye color={colors.textSecondary} size={20} /> : <EyeOff color={colors.textSecondary} size={20} />}
                                </TouchableOpacity>
                            </View>
                            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                        </View>

                        <View style={styles.passwordInfoContainer}>
                           <PasswordStrengthIndicator password={password} onStrengthChanged={setPasswordStrength} />
                        </View>

                        <Button 
                            title="Generate Strong Password" 
                            onPress={generatePassword} 
                            variant="outline"
                            size="small"
                            icon={RefreshCw}
                            style={{marginVertical: 16, alignSelf: 'center'}}
                        />
                        
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

                        <Button title="Create Account" onPress={handleRegister} isLoading={loading} disabled={isButtonDisabled} style={styles.button} />
                        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                            <Text style={[styles.link, { color: colors.textSecondary }]}>Already have an account? <Text style={[styles.boldLink, {color: colors.primary}]}>Login</Text></Text>
                        </TouchableOpacity>
                    </ScrollView>
                </Card>
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    outerContainer: { justifyContent: 'center', alignItems: 'center', flex: 1 },
    contentContainer: { width: '100%', maxWidth: 480, padding: 24, },
    scrollContent: { padding: 20 },
    headerIcon: { alignSelf: 'center', marginBottom: 16 },
    title: { fontSize: 32, fontFamily: 'Inter-Bold', textAlign: 'center', marginBottom: 24 },
    input: { height: 50, borderRadius: 12, paddingHorizontal: 16, marginBottom: 12, fontSize: 16, borderWidth: 1, fontFamily: 'Inter-Regular' },
    passwordWrapper: { marginBottom: 8 },
    passwordContainer: { flexDirection: 'row', alignItems: 'center' },
    passwordInfoContainer: { marginTop: 4, marginBottom: 4 },
    eyeIcon: { position: 'absolute', right: 15, top: 15 },
    requirementsContainer: { marginTop: 8, paddingLeft: 10, gap: 8 },
    requirement: { flexDirection: 'row', alignItems: 'center' },
    requirementText: { marginLeft: 10, fontSize: 14, fontFamily: 'Inter-Regular' },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
    checkboxLabel: { marginLeft: 10, fontSize: 15, fontFamily: 'Inter-SemiBold' },
    button: { marginBottom: 24 },
    link: { textAlign: 'center', fontSize: 14, paddingBottom: 20, fontFamily: 'Inter-Regular' },
    boldLink: { fontFamily: 'Inter-Bold' },
    errorText: { color: '#D32F2F', marginTop: -8, marginBottom: 10, marginLeft: 4, fontSize: 13, fontFamily: 'Inter-Regular' },
});