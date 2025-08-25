import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, Circle, RefreshCw, Eye, EyeOff, UserPlus } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';
import { useToast } from '@/context/ToastProvider';
import Button from '@/components/common/Button';
import ScreenContainer from '@/components/ScreenContainer';
import PasswordStrengthIndicator from '@/components/common/PasswordStrengthIndicator';
import Card from '@/components/common/Card';

// PasswordRequirement component remains the same
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
    // ... (all your existing state variables: email, password, etc.)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<'empty' | 'weak' | 'medium' | 'strong' | 'very-strong'>('empty');
    
    const router = useRouter();
    const { signUp } = useAuth();
    const { colors } = useTheme();
    const { showToast } = useToast();

    // ... (all your existing functions: requirements, generatePassword, handlePasswordStrengthChange, handleRegister, getButtonState)
    const requirements = {
        length: password.length >= 8,
        capital: /[A-Z]/.test(password),
        small: /[a-z]/.test(password),
        number: /\d/.test(password),
        symbol: /[^A-Za-z0-9]/.test(password),
    };
    const allRequirementsMet = Object.values(requirements).every(Boolean);

    const generatePassword = () => { /* ... existing code ... */ };
    const handlePasswordStrengthChange = (strength: any) => setPasswordStrength(strength);
    const handleRegister = async () => { /* ... existing code ... */ };
    const getButtonState = () => { /* ... existing code ... */ return !allRequirementsMet || password !== confirmPassword || !termsAccepted || passwordStrength === 'weak'; };


    return (
        <ScreenContainer style={styles.outerContainer}>
            <View style={styles.contentContainer}>
                <Card style={styles.card}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <UserPlus color={colors.primary} size={40} style={styles.headerIcon} />
                        <Text style={[styles.title, { color: colors.text }]}>Create an Account</Text>

                        <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} placeholder="Display Name" placeholderTextColor={colors.textSecondary} value={displayName} onChangeText={setDisplayName} />
                        <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} placeholder="Email" placeholderTextColor={colors.textSecondary} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                        
                        <View style={styles.passwordContainer}>
                            <TextInput style={[styles.input, {flex: 1, marginBottom: 0, backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} placeholder="Password" placeholderTextColor={colors.textSecondary} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}><EyeOff color={colors.textSecondary} size={20} /></TouchableOpacity>
                        </View>
                        <PasswordStrengthIndicator password={password} onStrengthChanged={handlePasswordStrengthChange} />

                        <View style={styles.passwordContainer}>
                            <TextInput style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} placeholder="Confirm Password" placeholderTextColor={colors.textSecondary} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}><EyeOff color={colors.textSecondary} size={20} /></TouchableOpacity>
                        </View>
                        <PasswordStrengthIndicator password={confirmPassword} />
                        
                        <View style={styles.requirementsContainer}>
                            <PasswordRequirement met={requirements.length} text="At least 8 characters" />
                            <PasswordRequirement met={requirements.capital} text="One uppercase letter" />
                            <PasswordRequirement met={requirements.number} text="One number" />
                            <PasswordRequirement met={requirements.symbol} text="One symbol" />
                        </View>

                        <TouchableOpacity style={styles.checkboxContainer} onPress={() => setTermsAccepted(!termsAccepted)}>
                            {termsAccepted ? <CheckCircle2 color={colors.primary} size={24} /> : <Circle color={colors.textSecondary} size={24} />}
                            <Text style={[styles.checkboxLabel, { color: colors.text }]}>I accept the <Text style={{color: colors.primary}}>terms</Text></Text>
                        </TouchableOpacity>

                        <Button title="Create Account" onPress={handleRegister} isLoading={loading} disabled={getButtonState()} style={styles.button} />

                        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                            <Text style={[styles.link, { color: colors.primary }]}>Already have an account? <Text style={styles.boldLink}>Login</Text></Text>
                        </TouchableOpacity>
                    </ScrollView>
                </Card>
            </View>
        </ScreenContainer>
    );
}


const styles = StyleSheet.create({
    outerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        width: '100%',
        maxWidth: 480, // Slightly wider for register form
        padding: 24,
    },
    card: {
       maxHeight: '90%',
    },
    headerIcon: {
        alignSelf: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
    },
    input: {
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 12,
        fontSize: 16,
        borderWidth: 1,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    eyeIcon: { position: 'absolute', right: 15, top: 15 },
    requirementsContainer: { marginVertical: 16, paddingLeft: 10, gap: 8 },
    requirement: { flexDirection: 'row', alignItems: 'center' },
    requirementText: { marginLeft: 10, fontSize: 14 },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    checkboxLabel: {
        marginLeft: 10,
        fontSize: 15,
    },
    button: {
        marginBottom: 24,
    },
    link: {
        textAlign: 'center',
        fontSize: 14,
        paddingBottom: 20,
    },
    boldLink: {
        fontWeight: 'bold',
    },
});