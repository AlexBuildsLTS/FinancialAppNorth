import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';
import Button from '@/components/common/Button';
import { BarChart3, Briefcase, User } from 'lucide-react-native';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.logo, { backgroundColor: colors.primary }]}>
             <BarChart3 color={colors.primaryContrast} size={40} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>FinanceFlow</Text>
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
            onPress={() => signIn('professional')}
            icon={Briefcase}
            size="large"
          />
          <Button
            title="Continue as Personal User"
            onPress={() => signIn('personal')}
            variant="outline"
            icon={User}
            size="large"
          />
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
  }
});