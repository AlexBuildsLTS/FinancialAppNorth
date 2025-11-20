import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

export const GlassCard = ({ children, style, intensity = 40 }: GlassCardProps) => {
  return (
    <View style={[styles.container, style]}>
      {/* 1. Native Blur - Tint is STRICTLY dark */}
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />

      {/* 2. Black Overlay (Crucial for contrast on Navy background) */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]} />

      {/* 3. Subtle Top-Down Shine (Very faint white gradient) */}
      <LinearGradient
        colors={['rgba(255,255,255,0.05)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />

      {/* 4. Content */}
      <View style={styles.content}>{children}</View>

      {/* 5. Border (Thin, faint white for glass edge) */}
      <View style={styles.border} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'transparent', // Ensure no default white background leaks
  },
  content: {
    zIndex: 2,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 3,
    pointerEvents: 'none',
  },
});