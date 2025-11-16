import React from 'react';
import { Image, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeProvider';

interface AnimatedLogoProps {
  scrollY: any;
}

const AnimatedLogo = ({ scrollY }: AnimatedLogoProps) => {
  const { isDark } = useTheme();

  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [0, 150];
    const outputRangeScale = [1, 0.5];
    const outputRangeOpacity = [1, 0];

    const scale = interpolate(
      scrollY.value,
      inputRange,
      outputRangeScale,
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      inputRange,
      outputRangeOpacity,
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View style={[styles.logoContainer, animatedStyle]}>
      <Image
        source={
          isDark
            ? require('@/assets/images/NFIconDark')
            : require('@/assets/images/NFIconLight')
        }
        style={styles.logo}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 60,
  },
  logo: {
    width: 250,
    height: 100,
  },
});

export default AnimatedLogo;
