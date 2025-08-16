import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeProvider';

interface ScreenContainerProps {
  children: React.ReactNode;
}

/**
 * A responsive container for screens that respects safe areas and applies
 * the current theme's background color. It ensures content is displayed
 * correctly across different devices.
 */
const ScreenContainer: React.FC<ScreenContainerProps> = ({ children }) => {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ScreenContainer;