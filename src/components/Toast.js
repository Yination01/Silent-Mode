import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Toast({ message, type = 'success', visible, onHide, duration = 3000 }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      let isMounted = true;
      const animation = Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(duration),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]);
      animation.start(() => { if (isMounted) onHide?.(); });
      return () => { isMounted = false; animation.stop(); };
    }
  }, [visible, duration, opacity, onHide]);

  if (!visible) return null;

  const colors = { success: theme.colors.success, error: theme.colors.error, warning: theme.colors.warning, info: theme.colors.info };
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors[type] || colors.success, top: insets.top + 50, opacity }]}>
      <Text style={styles.icon}>{icons[type]}</Text>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', left: 24, right: 24, flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, zIndex: 9999, elevation: 10 },
  icon: { fontSize: 20, marginRight: 12 },
  message: { color: '#000000', fontSize: 16, fontWeight: '600', flex: 1 },
});