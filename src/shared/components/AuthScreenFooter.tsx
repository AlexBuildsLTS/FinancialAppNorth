import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { Link } from 'expo-router';

interface AuthScreenFooterProps {
  mode: 'login' | 'register';
}

export const AuthScreenFooter = ({ mode }: AuthScreenFooterProps) => {
  const { theme } = useTheme();

  const isLogin = mode === 'login';
  const question = isLogin ? "Don't have an account?" : "Already have an account?";
  const action = isLogin ? "Sign up" : "Sign in";
  const route = isLogin ? "/(auth)/register" : "/(auth)/login";

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
        {question}
      </Text>
      <Link href={route} asChild>
        <Pressable>
          <Text style={[styles.link, { color: theme.colors.primary }]}>
            {action}
          </Text>
        </Pressable>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    fontFamily: 'InterRegular',
  },
  link: {
    fontSize: 14,
    fontFamily: 'InterSemiBold',
  },
});