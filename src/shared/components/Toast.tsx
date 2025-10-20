import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import { CheckCircle, AlertCircle, Info } from 'lucide-react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onHide: () => void;
}

export default function Toast({ message, type, onHide }: ToastProps) {
  const { theme: { colors } } = useTheme();
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
        return { backgroundColor: colors.accent, icon: <Info color="white" size={20} /> };
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
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    elevation: 5,
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