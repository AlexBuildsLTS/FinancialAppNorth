import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, Circle, RefreshCw } from 'lucide-react-native';
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
        const { error } = await signUp({ email, password, options: { data: { display_name: displayName } } });
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
            
            <View>
                <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} placeholder="Password" placeholderTextColor={colors.textSecondary} value={password} onChangeText={setPassword} secureTextEntry />
                <TouchableOpacity onPress={generatePassword} style={styles.generateButton}>
                    <Text style={[styles.generateButtonText, {color: colors.primary}]}>Generate</Text>
                    <RefreshCw color={colors.primary} size={16} />
                </TouchableOpacity>
            </View>
            <PasswordStrengthIndicator password={password} />
            <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} placeholder="Confirm Password" placeholderTextColor={colors.textSecondary} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
            
            <View style={styles.requirementsContainer}>
                <PasswordRequirement met={requirements.length} text="At least 8 characters" />
                <PasswordRequirement met={requirements.capital} text="One uppercase letter" />
                <PasswordRequirement met={requirements.number} text="One number" />
                <PasswordRequirement met={requirements.symbol} text="One symbol" />
            </View>

            <Button title="Create Account" onPress={handleRegister} isLoading={loading} disabled={!allRequirementsMet || !password || password !== confirmPassword} />

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
    generateButton: { position: 'absolute', right: 15, top: 15, flexDirection: 'row', alignItems: 'center', gap: 6, padding: 4 },
    generateButtonText: { fontWeight: '600', fontSize: 12 },
    requirementsContainer: { marginVertical: 12, paddingLeft: 10, gap: 8 },
    requirement: { flexDirection: 'row', alignItems: 'center' },
    requirementText: { marginLeft: 10, fontSize: 14 },
    link: { marginTop: 24, textAlign: 'center', fontSize: 16, fontWeight: '500' },
});
