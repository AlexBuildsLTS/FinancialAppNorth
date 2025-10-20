import React, { ReactNode } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, ViewStyle } from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
interface ScreenContainerProps {
  children: ReactNode;
  style?: ViewStyle;
}

const ScreenContainer = ({ children, style }: ScreenContainerProps) => {
  const { theme: { colors }, isDark } = useTheme();

  return (
    // SafeAreaView is essential for handling notches and system UI elements
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.container, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});

export default ScreenContainer;