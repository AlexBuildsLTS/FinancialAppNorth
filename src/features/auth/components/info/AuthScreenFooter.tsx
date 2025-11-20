// src/features/auth/components/info/AuthScreenFooter.tsx
import React from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';
import { AppTheme } from '@/shared/theme/theme';
import { useTheme } from '@/shared/context/ThemeProvider';
import { AboutNorthFinance } from './AboutNorthFinance';
import { OurMission } from './OurMission';
import { WhatWeOffer } from './WhatWeOffer';
import { MembershipTiers } from './MembershipTiers';
import { ProfessionalServices } from './ProfessionalServices';
import { SupportTeam } from './SupportTeam';
import { SharedValue } from 'react-native-reanimated/lib/typescript/commonTypes';
// import { SmallFooter } from './SmallFooter'; // Assuming you create this later

export type ScrollSharedValue = SharedValue<number>;

interface AuthScreenFooterProps {
    scrollY: ScrollSharedValue;
}

const AnimatedContainer = Animated.createAnimatedComponent(View);

// Adjust thresholds as needed
const FORM_HEIGHT_THRESHOLD = Platform.OS === 'web' ? 450 : 300; // Point where animation starts
const ANIMATION_RANGE = 200; // How long the animation takes to complete

const FooterSection = ({ children, scrollY, delay }: { children: React.ReactNode, scrollY: SharedValue<number>, delay: number }) => {
    const animatedStyle = useAnimatedStyle(() => {
        const start = FORM_HEIGHT_THRESHOLD + delay;
        const end = start + ANIMATION_RANGE;

        const opacity = interpolate(scrollY.value, [start, end], [0, 1], Extrapolate.CLAMP);
        const translateY = interpolate(scrollY.value, [start, end], [50, 0], Extrapolate.CLAMP);

        return { opacity, transform: [{ translateY }] };
    });

    return <AnimatedContainer style={animatedStyle}>{children}</AnimatedContainer>;
};

export function AuthScreenFooter({ scrollY }: AuthScreenFooterProps) {
    const { theme } = useTheme();
    const { width } = useWindowDimensions();
    const styles = createStyles(theme);

    const isTablet = width >= 768;
    const contentWidth = isTablet ? 700 : '100%'; // Slightly wider for info cards

    return (
        <View style={styles.container}>
            <View style={[styles.content, { maxWidth: contentWidth }]}>
                <FooterSection scrollY={scrollY} delay={0}>
                    <AboutNorthFinance />
                </FooterSection>
                <FooterSection scrollY={scrollY} delay={100}>
                    <OurMission />
                </FooterSection>
                <FooterSection scrollY={scrollY} delay={200}>
                    <WhatWeOffer />
                </FooterSection>
                <FooterSection scrollY={scrollY} delay={300}>
                    <MembershipTiers />
                </FooterSection>
                <FooterSection scrollY={scrollY} delay={400}>
                    <ProfessionalServices />
                </FooterSection>
                <FooterSection scrollY={scrollY} delay={500}>
                    <SupportTeam />
                </FooterSection>
            </View>
            {/* <SmallFooter /> */} {/* Add the small link footer later */}
        </View>
    );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: theme.colors.background, // Ensure background matches
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl * 2, // Extra padding at the bottom
  },
  content: {
    width: '100%',
    paddingHorizontal: theme.spacing.lg,
  },
});
