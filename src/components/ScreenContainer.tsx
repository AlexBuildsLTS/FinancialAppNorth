import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: object;
}

export default function ScreenContainer({ children, style }: ScreenContainerProps) {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.container, { backgroundColor: colors.background, padding: 8 }, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});