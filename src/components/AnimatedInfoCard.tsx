import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeProvider';
import { Cards } from '@/components/Cards'; // Import the Cards component

// Removed duplicate import of SharedValue
interface AnimatedInfoCardsProps {

  title: string;
  description: string;
  CardsIndex: number; // Index of the Cards in the list
  scrollY: any; // Add missing scrollY property
}

const AnimatedInfoCards = ({ title, description, scrollY, CardsIndex }: AnimatedInfoCardsProps) => {
  const { theme: { colors } } = useTheme();
  const CardsHeight = 150; // Approximate height of the Cards for animation calculation
  // Adjust the starting offset for animations. The login form is around 600px tall.
  // Each Cards needs a unique offset. Let's assume a base offset and add CardsIndex * spacing.
  const baseOffset = 600; // Offset to start animations after the login form
  const Cardspacing = 200; // Space between the start of each Cards's animation trigger
  const CardsOffset = baseOffset + CardsIndex * (CardsHeight + Cardspacing);

  const animatedStyle = useAnimatedStyle(() => {
    // Define the scroll range for the animation
    const inputRange = [CardsOffset - 400, CardsOffset - 200]; // When to start and fully animate in
    const outputRangeTranslateY = [50, 0]; // Move from 50px down to 0px (original position)
    const outputRangeOpacity = [0, 1]; // Fade from 0 to 1

    const translateY = interpolate(
      scrollY.value,
      inputRange,
      outputRangeTranslateY,
      Extrapolate.CLAMP // Clamp the value to the output range
    );
    const opacity = interpolate(
      scrollY.value,
      inputRange,
      outputRangeOpacity,
      Extrapolate.CLAMP // Clamp the value to the output range
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <Animated.View style={[styles.infoCardsContainer, animatedStyle]}>
      {/* Apply padding directly within the styles object for Cards */}
      <Cards style={styles.CardsContent}>
        <Text style={[styles.infoCardsTitle, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.infoCardsDescription, { color: colors.textSecondary }]}>{description}</Text>
      </Cards>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  infoCardsContainer: { // Renamed to avoid conflict with Cards component
    width: '100%',
    marginBottom: 24,
  },
  CardsContent: { // Style for the content inside the Cards
    width: '100%',
    padding: 24, // Applied padding directly here as Cards component might not accept it as a prop
  },
  infoCardsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoCardsDescription: {
    fontSize: 14,
    lineHeight: 22,
  },
});

export default AnimatedInfoCards;
