  import React from 'react';
  import { Link, Stack } from 'expo-router';
  import { StyleSheet, View, Text } from 'react-native';
  import { useTheme } from '@/context/ThemeProvider';

  export default function NotFoundScreen() {
    const { theme: { colors } } = useTheme();
    return (
      <>
        <Stack.Screen options={{ title: 'Oops!' }} />
        <View style={[styles.container, {backgroundColor: colors.background}]}>
          <Text style={[styles.title, {color: colors.textPrimary}]}>Screen Not Found</Text>
          <Link href="/(main)" style={styles.link}>
            <Text style={[styles.linkText, {color: colors.accent}]}>Go to home screen</Text>
          </Link>
        </View>
      </>
    );
  }

  const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
    title: { fontSize: 20, fontWeight: 'bold' },
    link: { marginTop: 15, paddingVertical: 15 },
    linkText: { fontSize: 14 },
  });