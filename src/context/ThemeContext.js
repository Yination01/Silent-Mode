import React, { createContext, useContext, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { useAppStore } from '../store/appStore';

const darkTheme = {
  colors: {
    background: '#000000', surface: '#1A1A1A', surfaceLight: '#2A2A2A',
    text: '#FFFFFF', textSecondary: '#999999', accent: '#00FF88', accentLight: '#33FF99',
    border: '#333333', error: '#FF4444', success: '#00FF88', warning: '#FFD700',
    info: '#4488FF', white: '#FFFFFF', black: '#000000',
    gradientStart: '#00FF88', gradientEnd: '#00CC66',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  borderRadius: { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 },
  fontSize: { xs: 12, sm: 14, md: 16, lg: 20, xl: 24, xxl: 32, xxxl: 40 },
  shadows: {
    small: { shadowColor: '#00FF88', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
    medium: { shadowColor: '#00FF88', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  },
};

const lightTheme = {
  ...darkTheme,
  colors: { ...darkTheme.colors, background: '#FFFFFF', surface: '#F5F5F5', surfaceLight: '#EEEEEE', text: '#000000', textSecondary: '#666666', border: '#DDDDDD' },
};

const ThemeContext = createContext({ theme: darkTheme, isDark: true, toggleTheme: () => {} });

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const [isDark, setIsDark] = useState(
    settings.themeMode === 'dark' || (settings.themeMode !== 'light' && systemColorScheme !== 'light')
  );

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const newValue = !prev;
      updateSettings({ themeMode: newValue ? 'dark' : 'light' });
      return newValue;
    });
  }, [updateSettings]);

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}