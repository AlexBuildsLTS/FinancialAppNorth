import React, { useEffect } from 'react';
import { Text, StyleSheet, Platform } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeProvider';
import { CheckCircle, AlertCircle, Info } from 'lucide-react-native';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onHide: () => void;
}

export default function Toast({ message, type, onHide }: ToastProps) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
    translateY.value = withTiming(0, { duration: 300 });

    const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 }, () => {
            runOnJS(onHide)();
        });
        translateY.value = withTiming(-20, { duration: 300 });
    }, 2700);

    return () => clearTimeout(timer);
  }, [onHide, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  const getStyles = () => {
    switch (type) {
      case 'success': return { backgroundColor: colors.success, icon: <CheckCircle color="white" size={20} /> };
      case 'error': return { backgroundColor: colors.error, icon: <AlertCircle color="white" size={20} /> };
      case 'info':
      default:
        return { backgroundColor: colors.primary, icon: <Info color="white" size={20} /> };
    }
  };

  const { backgroundColor, icon } = getStyles();

  return (
    <Animated.View style={[styles.container, { backgroundColor }, animatedStyle]}>
      {icon}
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
      },
    }),
    marginBottom: 10,
    gap: 12,
  },
  message: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});
