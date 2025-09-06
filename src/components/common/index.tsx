import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';

type CardProps = {
  title?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
};

function Card({ title, children, style, onPress }: CardProps) {
  const Container: any = onPress ? TouchableOpacity : View;
  return (
    <Container style={[styles.card, style]} onPress={onPress}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View>{children}</View>
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    // subtle shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // elevation for Android
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
});

export default Card;
export { Card };
