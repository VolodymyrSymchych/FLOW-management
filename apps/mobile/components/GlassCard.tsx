import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, BorderRadius, Shadows } from '../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'subtle' | 'light' | 'medium' | 'heavy';
  borderIntensity?: 'subtle' | 'light' | 'medium' | 'heavy';
}

export default function GlassCard({
  children,
  style,
  intensity = 'medium',
  borderIntensity = 'medium'
}: GlassCardProps) {
  const borderColor = Colors.border[borderIntensity];

  // Map intensity to blur amount - increased for visible glass effect
  const blurIntensity = {
    subtle: 30,
    light: 50,
    medium: 70,
    heavy: 90,
  }[intensity];

  return (
    <View style={[styles.outerContainer, style]}>
      <View style={[styles.innerContainer, { borderColor, borderWidth: 1 }]}>
        <BlurView
          intensity={blurIntensity}
          tint="default"
          style={styles.blur}
        >
          {children}
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    // Shadow needs to be on an element WITHOUT overflow: hidden
    borderRadius: BorderRadius.lg,
    ...Shadows.lg,
    // Ensure shadow visibility
    backgroundColor: 'transparent',
  },
  innerContainer: {
    // This clips the BlurView to the border radius
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  blur: {
    width: '100%',
    padding: 12,
  },
});
