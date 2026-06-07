import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function LoadingSkeleton({ width = '100%', height = 20, style }) {
  const theme = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [-parseFloat(width) || -300, parseFloat(width) || 300] });

  return (
    <View style={[styles.container, { width, height, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.sm }, style]}>
      <Animated.View style={[styles.shimmer, { backgroundColor: theme.colors.surfaceLight, transform: [{ translateX }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  shimmer: { width: '100%', height: '100%', opacity: 0.5 },
});