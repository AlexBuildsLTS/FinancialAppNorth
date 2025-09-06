import { Card } from '@/components/common';
import { Button } from '@/components/common/Button';
import PasswordStrengthIndicator from '@/components/common/PasswordStrengthIndicator';
import ScreenContainer from '@/components/ScreenContainer';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';
import { useToast } from '@/context/ToastProvider';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { CheckCircle2, Circle, Eye, EyeOff, UserPlus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => {
    const { colors } = useTheme();
    return (
        <View style={styles.requirement}>
            <View style={{ width: 20 }}>{met ? <CheckCircle2 color={colors.success} size={16} /> : <Circle color={colors.textSecondary} size={16} style={{ opacity: 0.5 }} />}</View>
            <Text style={[styles.requirementText, { color: met ? colors.success : colors.textSecondary }]}>{text}</Text>
        </View>
    );
};

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [country, setCountry] = useState('United States');
    const [currency, setCurrency] = useState('USD');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState(false);
    
    const router = useRouter();
    const { signUp } = useAuth();
    const { colors } = useTheme();
    const { showToast } = useToast();

    const countryCurrencyMap: Record<string, string> = { 'United States': 'USD', 'United Kingdom': 'GBP', Sweden: 'SEK', Germany: 'EUR', France: 'EUR' };

    useEffect(() => { setPasswordsMatch(password.length > 0 && password === confirmPassword); }, [password, confirmPassword]);
    useEffect(() => { setCurrency(countryCurrencyMap[country] ?? 'USD'); }, [country]);

    const requirements = {
        length: password.length >= 8,
        capital: /[A-Z]/.test(password),
        small: /[a-z]/.test(password),
        number: /\d/.test(password),
        symbol: /[^A-Za-z0-9]/.test(password),
    };
    const allRequirementsMet = Object.values(requirements).every(Boolean);

    const handleRegister = async () => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Please enter a valid email.', 'error'); return; }
        if (!allRequirementsMet) { showToast('Password does not meet all requirements.', 'error'); return; }
        if (!passwordsMatch) { showToast('Passwords do not match.', 'error'); return; }
        if (!termsAccepted) { showToast('Please accept the terms and conditions.', 'error'); return; }
        
        setLoading(true);
        const { error } = await signUp({
            email,
            password,
            displayName: `${firstName} ${lastName}`.trim() || email.split('@')[0],
            firstName,
            lastName,
            country,
            currency,
        });
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
                        <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} placeholder="First Name" placeholderTextColor={colors.textSecondary} value={firstName} onChangeText={setFirstName} />
                        <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} placeholder="Last Name" placeholderTextColor={colors.textSecondary} value={lastName} onChangeText={setLastName} />
                        <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} placeholder="Email" placeholderTextColor={colors.textSecondary} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                        <View style={styles.pickerContainer}>
                            <Text style={[styles.pickerLabel, {color: colors.textSecondary}]}>Country</Text>
                            <View style={[styles.pickerWrapper, { borderColor: colors.border, backgroundColor: colors.surface }]}><Picker selectedValue={country} onValueChange={setCountry}><Picker.Item label="United States" value="United States" /><Picker.Item label="United Kingdom" value="United Kingdom" /><Picker.Item label="Sweden" value="Sweden" /></Picker></View>
                        </View>
                        <View style={styles.passwordContainer}>
                            <TextInput style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} placeholder="Password" placeholderTextColor={colors.textSecondary} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>{showPassword ? <Eye color={colors.textSecondary} /> : <EyeOff color={colors.textSecondary} />}</TouchableOpacity>
                        </View>
                        <View style={styles.passwordContainer}>
                            <TextInput style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} placeholder="Confirm Password" placeholderTextColor={colors.textSecondary} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>{showConfirmPassword ? <Eye color={colors.textSecondary} /> : <EyeOff color={colors.textSecondary} />}</TouchableOpacity>
                        </View>
                        <PasswordStrengthIndicator password={password} />
                        <View style={styles.requirementsContainer}>
                            <PasswordRequirement met={requirements.length} text="At least 8 characters" />
                            <PasswordRequirement met={requirements.capital} text="One uppercase letter" />
                            <PasswordRequirement met={requirements.small} text="One lowercase letter" />
                            <PasswordRequirement met={requirements.number} text="One number" />
                            <PasswordRequirement met={requirements.symbol} text="One symbol" />
                            <PasswordRequirement met={passwordsMatch} text="Passwords match" />
                        </View>
                        <TouchableOpacity style={styles.checkboxContainer} onPress={() => setTermsAccepted(!termsAccepted)}>
                            {termsAccepted ? <CheckCircle2 color={colors.primary} size={24} /> : <Circle color={colors.textSecondary} size={24} />}
                            <Text style={[styles.checkboxLabel, { color: colors.text }]}>I accept the terms and conditions</Text>
                        </TouchableOpacity>
                        <Button title="Create Account" onPress={handleRegister} isLoading={loading} disabled={!termsAccepted || !allRequirementsMet || !passwordsMatch} style={styles.button} />
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
    contentContainer: { flex: 1, justifyContent: 'center', padding: 16 },
    scrollContent: { padding: 20 },
    headerIcon: { alignSelf: 'center', marginBottom: 16 },
    title: { fontSize: 28, fontFamily: 'Inter_700Bold', textAlign: 'center', marginBottom: 24 },
    input: { height: 50, borderRadius: 12, paddingHorizontal: 16, marginBottom: 12, fontSize: 16, borderWidth: 1, fontFamily: 'Inter_400Regular' },
    passwordContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    eyeIcon: { position: 'absolute', right: 15 },
    requirementsContainer: { marginTop: 8, gap: 8 },
    requirement: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    requirementText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 },
    checkboxLabel: { fontSize: 15, fontFamily: 'Inter_400Regular' },
    button: { marginBottom: 24, marginTop: 16 },
    link: { textAlign: 'center', fontSize: 14, fontFamily: 'Inter_400Regular' },
    pickerContainer: { marginBottom: 12 },
    pickerLabel: { fontFamily: 'Inter_400Regular', fontSize: 14, marginBottom: 8 },
    pickerWrapper: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
});