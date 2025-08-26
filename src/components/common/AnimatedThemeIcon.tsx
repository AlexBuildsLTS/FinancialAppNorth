import React, { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { Sun, Moon } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

export default function AnimatedThemeIcon() {
  const { isDark, setColorScheme } = useTheme();
  const rotation = useSharedValue(0);
  
  // Use a shared value to smoothly transition between states
  const themeProgress = useSharedValue(isDark ? 1 : 0);

  useEffect(() => {
    // Animate the progress value when the theme changes
    themeProgress.value = withTiming(isDark ? 1 : 0, { duration: 300 });
  }, [isDark]);

  const handlePress = () => {
    // Rotate the icon when pressed
    rotation.value = withTiming(rotation.value + 360, { duration: 500 });
    setColorScheme(isDark ? 'light' : 'dark');
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  // Define the colors as you specified
  const sunColor = '#FFC700'; // Yellow Sun
  const moonColor = '#87CEEB'; // Light Blue Moon

  return (
    <TouchableOpacity onPress={handlePress} accessibilityLabel="Toggle theme">
      <Animated.View style={animatedStyle}>
        {isDark ? (
          <Moon color={moonColor} size={26} fill={moonColor} />
        ) : (
          <Sun color={sunColor} size={26} fill={sunColor} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}