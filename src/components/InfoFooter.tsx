import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeProvider';
import { Cards } from '@/components/Cards';

interface InfoFooterProps {
  scrollY: any; // Reanimated shared value
}

interface AnimatedSectionProps {
  scrollY: any;
  baseOffset: number;
  title: string;
  description: string;
}

const AnimatedSection = ({ scrollY, baseOffset, title, description }: AnimatedSectionProps) => {
  const { theme: { colors } } = useTheme();

  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [baseOffset - 400, baseOffset - 200];
    const outputRangeTranslateY = [50, 0];
    const outputRangeOpacity = [0, 1];

    const translateY = interpolate(scrollY.value, inputRange, outputRangeTranslateY, Extrapolate.CLAMP);
    const opacity = interpolate(scrollY.value, inputRange, outputRangeOpacity, Extrapolate.CLAMP);

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <Animated.View style={[styles.sectionContainer, animatedStyle]}>
      <Cards style={styles.CardsContent}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>{description}</Text>
      </Cards>
    </Animated.View>
  );
};

const footerSections = [
    {
        title: "About NorthFinance",
        description: "NorthFinance is a comprehensive financial management platform designed to empower individuals and businesses with intelligent tools for tracking, analyzing, and optimizing their financial health.",
    },
    {
        title: "Our Mission",
        description: "To democratize professional-grade financial management tools, making them intuitive enough for individuals while powerful enough for certified professionals.",
    },
    {
        title: "What We Offer",
        description: "Explore our suite of powerful tools: Smart Transaction Tracking, Intelligent Budgeting, and Advanced Analytics.",
    },
    {
        title: "AI Financial Assistant",
        description: "Get instant answers to your financial questions powered by advanced AI technology, available 24/7.",
    },
    {
        title: "Secure Document Management",
        description: "Securely store and organize receipts, invoices, and important financial documents with end-to-end encryption.",
    },
];

const InfoFooter = ({ scrollY }: InfoFooterProps) => {
  // Base offset to start animations after the login/register form.
  // This value might need adjustment depending on the form's height.
  const formHeightOffset = 600; 
  const sectionSpacing = 250; // Vertical distance between animation triggers

  return (
    <View style={styles.footerContainer}>
      {footerSections.map((section, index) => (
        <AnimatedSection
          key={index}
          scrollY={scrollY}
          baseOffset={formHeightOffset + index * sectionSpacing}
          title={section.title}
          description={section.description}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 32, // Space above the first footer section
  },
  sectionContainer: {
    width: '100%',
    marginBottom: 24,
  },
  CardsContent: {
    width: '100%',
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 22,
  },
});

export default InfoFooter;
