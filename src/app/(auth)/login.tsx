import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeProvider';
import Button from '../../components/common/Button';
import { BarChart3, Briefcase, User, Check } from 'lucide-react-native'; // Added Check icon
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [rememberMe, setRememberMe] = React.useState(false); // New state for "Remember Me"

  const handleSignIn = (role: string) => {
    // In a real app, you'd handle rememberMe preference here (e.g., store token persistently)
    console.log(`Signing in as ${role}, Remember Me: ${rememberMe}`);
    signIn(role as any); // Cast to any to avoid UserRole type issues for now
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.logo, { backgroundColor: colors.primary }]}>
             <BarChart3 color={colors.primaryContrast} size={40} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>NorthFinance</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Professional Financial Management
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Text style={[styles.ctaText, { color: colors.textSecondary }]}>
            Choose your role to get started
          </Text>
          <Button
            title="Continue as Professional"
            onPress={() => handleSignIn('Professional Accountant')}
            icon={Briefcase}
            size="large"
          />
          <Button
            title="Continue as Personal User"
            onPress={() => handleSignIn('Member')}
            variant="outline"
            icon={User}
            size="large"
          />
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={[styles.registerText, { color: colors.primary }]}>
              Don't have an account? Register here.
            </Text>
          </TouchableOpacity>
          <View style={styles.rememberMeContainer}>
            <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} style={styles.checkbox}>
              {rememberMe ? (
                <Check size={20} color={colors.primary} />
              ) : (
                <View style={[styles.checkboxEmpty, { borderColor: colors.textSecondary }]} />
              )}
            </TouchableOpacity>
            <Text style={[styles.rememberMeText, { color: colors.textSecondary }]}>Remember me</Text>
          </View>
        </View>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            By continuing, you agree to our Terms of Service.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 32,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    marginTop: '20%',
  },
  logo: {
      width: 80,
      height: 80,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 36,
    fontWeight: '700',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginTop: 8,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  ctaText: {
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    textAlign: 'center',
  },
  registerText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    justifyContent: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxEmpty: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
  },
  rememberMeText: {
    fontSize: 14,
  },
});
