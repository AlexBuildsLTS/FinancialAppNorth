import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, Circle, RefreshCw, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';
import { useToast } from '@/context/ToastProvider';
import Button from '@/components/common/Button';
import ScreenContainer from '@/components/ScreenContainer';
import PasswordStrengthIndicator from '@/components/common/PasswordStrengthIndicator'; // Corrected import

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
    
    const router = useRouter();
    const { signUp } = useAuth(); // Using the signUp from your AuthContext
    const { colors } = useTheme();
    const { showToast } = useToast();

    const requirements = {
        length: password.length >= 8,
        capital: /[A-Z]/.test(password),
        small: /[a-z]/.test(password),
        number: /\d/.test(password),
        symbol: /[^A-Za-z0-9]/.test(password),
    };
    const allRequirementsMet = Object.values(requirements).every(Boolean);

    const generatePassword = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
        let newPassword = 'aA1!'; // Ensure all character types are present
        for (let i = 0; i < 10; i++) {
            newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        newPassword = newPassword.split('').sort(() => 0.5 - Math.random()).join('');
        setPassword(newPassword);
        setConfirmPassword(newPassword);
    };

    const handleRegister = async () => {
        if (password !== confirmPassword) return Alert.alert('Error', 'Passwords do not match.');
        if (!allRequirementsMet) return Alert.alert('Error', 'Password does not meet all requirements.');
        
        setLoading(true);
        // --- CRITICAL FIX: Correctly calling the signUp function as defined in your AuthContext ---
        const { error } = await signUp(email, password, displayName);
        setLoading(false);

        if (error) {
            showToast(error.message, 'error');
        } else {
            showToast('Registration successful! Please check your email to verify.', 'success');
            router.replace('/(auth)/login');
        }
    };
  
    return (
        <ScreenContainer style={styles.container}>
            <Text style={[styles.title, { color: colors.text }]}>Create an Account</Text>
            
            <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} placeholder="Display Name" placeholderTextColor={colors.textSecondary} value={displayName} onChangeText={setDisplayName} />
            <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} placeholder="Email" placeholderTextColor={colors.textSecondary} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            
            
                <View style={styles.passwordInputContainer}>
                <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, marginBottom: 0 }]} placeholder="Password" placeholderTextColor={colors.textSecondary} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                <TouchableOpacity onPress={generatePassword} style={styles.generateButton}>
                    <Text style={[styles.generateButtonText, {color: colors.primary}]}>Generate</Text>
                    <RefreshCw color={colors.primary} size={16} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    {showPassword ? <EyeOff color={colors.textSecondary} size={20} /> : <Eye color={colors.textSecondary} size={20} />}
                </TouchableOpacity>
            </View>
            <PasswordStrengthIndicator password={password} />

            <View style={styles.passwordInputContainer}>
                <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, marginBottom: 0 }]} placeholder="Confirm Password" placeholderTextColor={colors.textSecondary} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                    {showConfirmPassword ? <EyeOff color={colors.textSecondary} size={20} /> : <Eye color={colors.textSecondary} size={20} />}
                </TouchableOpacity>
            </View>
            <PasswordStrengthIndicator password={confirmPassword} />
            
            <View style={styles.requirementsContainer}>
                <PasswordRequirement met={requirements.length} text="At least 8 characters" />
                <PasswordRequirement met={requirements.capital} text="One uppercase letter" />
                <PasswordRequirement met={requirements.number} text="One number" />
                <PasswordRequirement met={requirements.symbol} text="One symbol" />
            </View>

            <View style={[styles.termsContainer, { borderColor: colors.border }]}>
                <ScrollView style={styles.termsScrollView}>
                    <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                        By creating an account, you agree to our Terms of Service and Privacy Policy.
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                        [More terms and conditions text here...]
                    </Text>
                </ScrollView>
                <TouchableOpacity style={styles.checkboxContainer} onPress={() => setTermsAccepted(!termsAccepted)}>
                    {termsAccepted ? <CheckCircle2 color={colors.primary} size={24} /> : <Circle color={colors.textSecondary} size={24} />}
                    <Text style={[styles.checkboxLabel, { color: colors.text }]}>I accept the terms and conditions</Text>
                </TouchableOpacity>
            </View>

            <Button title="Create Account" onPress={handleRegister} isLoading={loading} disabled={!allRequirementsMet || !password || password !== confirmPassword || !termsAccepted} />

            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={[styles.link, { color: colors.primary }]}>Already have an account? Login</Text>
            </TouchableOpacity>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: { justifyContent: 'center', padding: 24 },
    title: { fontSize: 32, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
    input: { height: 50, borderRadius: 12, paddingHorizontal: 16, marginBottom: 12, fontSize: 16, borderWidth: 1 },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    generateButton: { position: 'absolute', right: 40, top: 15, flexDirection: 'row', alignItems: 'center', gap: 6, padding: 4, zIndex: 1 },
    generateButtonText: { fontWeight: '600', fontSize: 12 },
    eyeIcon: { position: 'absolute', right: 15, top: 15, padding: 4, zIndex: 1 },
    requirementsContainer: { marginVertical: 12, paddingLeft: 10, gap: 8 },
    requirement: { flexDirection: 'row', alignItems: 'center' },
    requirementText: { marginLeft: 10, fontSize: 14 },
    termsContainer: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
        marginBottom: 20,
    },
    termsScrollView: {
        maxHeight: 100,
        marginBottom: 12,
    },
    termsText: {
        fontSize: 13,
        lineHeight: 18,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    checkboxLabel: {
        marginLeft: 10,
        fontSize: 15,
    },
    link: { marginTop: 24, textAlign: 'center', fontSize: 16, fontWeight: '500' },
});
