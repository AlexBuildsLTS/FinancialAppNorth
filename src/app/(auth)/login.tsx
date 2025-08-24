import { supabase } from '@/lib/supabase';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Switch,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { FontAwesome } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const { colors, theme, toggleTheme, isDark } = useTheme();

  const signIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Sign In Error', error.message);
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.themeToggleContainer}>
        <FontAwesome name="sun-o" size={22} color={colors.text} />
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: '#767577', true: colors.primary }}
          thumbColor={isDark ? '#f4f3f4' : '#f4f3f4'}
        />
        <FontAwesome name="moon-o" size={22} color={colors.text} />
      </View>

      <View style={[styles.formContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign in to your account</Text>
        
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          placeholder="Email"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          placeholder="Password"
          placeholderTextColor={colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
            <FontAwesome 
              name={rememberMe ? 'check-square' : 'square-o'} 
              size={24} 
              color={colors.primary} 
            />
            <Text style={[styles.checkboxLabel, { color: colors.text }]}>Remember Me</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={signIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryContrast} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.primaryContrast }]}>Sign In</Text>
          )}
        </TouchableOpacity>

        <Link href="/(auth)/register" asChild>
          <TouchableOpacity style={styles.linkContainer}>
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>
              Don't have an account?{' '}
              <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

// Add the original styles from your project here
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    themeToggleContainer: {
        position: 'absolute',
        top: 60,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
        padding: 24,
        borderRadius: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
        fontSize: 16,
    },
    optionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxLabel: {
        marginLeft: 10,
        fontSize: 16,
    },
    button: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkContainer: {
        marginTop: 24,
    },
    linkText: {
        textAlign: 'center',
        fontSize: 16,
    },
});
