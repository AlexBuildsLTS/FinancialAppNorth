import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const ScreenContainer: React.FC<ScreenContainerProps> = ({ children, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Finance App</Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default ScreenContainer;
