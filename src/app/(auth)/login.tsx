import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Sun, Moon, LogIn } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';
import { useToast } from '@/context/ToastProvider';
import ScreenContainer from '@/components/ScreenContainer';
import { Button, Card } from '@/components/common';

export default function LoginScreen() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const { signInWithEmail } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);
    const { isDark, setColorScheme, colors } = useTheme();

    const handleLogin = async () => {
        if (!email || !password) {
            showToast('Please enter both email and password.', 'error');
            return;
        }
        setLoading(true);
        const { error } = await signInWithEmail(email, password);
        setLoading(false);
        if (error) {
            showToast(error.message, 'error');
        } else {
            showToast('Login successful!', 'success');
        }
    };

    return (
        <ScreenContainer style={styles.outerContainer}>
             <View style={styles.themeToggleContainer}>
                <Sun color={colors.textSecondary} size={20} />
                <Switch
                    value={isDark}
                    onValueChange={(value) => setColorScheme(value ? 'dark' : 'light')}
                    trackColor={{ false: '#767577', true: colors.primary }}
                    thumbColor={'#f4f3f4'}
                />
                <Moon color={colors.textSecondary} size={20} />
            </View>

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
    outerContainer: { justifyContent: 'center', alignItems: 'center' },
    themeToggleContainer: { position: 'absolute', top: 60, right: 24, flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 1 },
    contentContainer: { width: '100%', maxWidth: 420, padding: 24 },
    headerIcon: { alignSelf: 'center', marginBottom: 16 },
    title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 32 },
    input: { height: 50, borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, fontSize: 16, borderWidth: 1 },
    passwordContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    eyeIcon: { position: 'absolute', right: 15, top: 15 },
    button: { marginBottom: 24 },
    link: { textAlign: 'center', fontSize: 14 },
    boldLink: { fontWeight: 'bold' },
});