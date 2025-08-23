import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface InterProps {
  prop?: string;
}

export function Inter({prop = 'default value'}: InterProps) {
  return (
    <View style={styles.container}>
      <Text>Inter {prop}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
});
