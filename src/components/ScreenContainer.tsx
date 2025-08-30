// src/components/ScreenContainer.tsx

import React, { useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, ScrollView, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  padded?: boolean;
}

// FIX: This component uses a default export, so it should be imported as `import ScreenContainer from ...`
export default function ScreenContainer({ children, style, scrollable = false, padded = false }: ScreenContainerProps) {
  const { colors, isDark } = useTheme();

  const containerStyle = useMemo(() => [
    styles.baseContainer,
    { backgroundColor: colors.background },
    padded && styles.padding,
    style,
  ], [colors.background, padded, style]);

  const Content = scrollable ? ScrollView : View;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Content 
        style={styles.flex} 
        contentContainerStyle={scrollable ? containerStyle : undefined}
        keyboardShouldPersistTaps="handled"
      >
        {!scrollable ? <View style={containerStyle}>{children}</View> : children}
      </Content>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  baseContainer: {
    flex: 1,
  },
  padding: {
    padding: 16,
  },
});