import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';
import { DarkAppTheme, LightTheme } from './theme';
import type { Theme } from '@react-navigation/native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorSchemeName;
  themeMode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');

  const colorScheme = themeMode === 'system' ? systemColorScheme : themeMode;
  const theme = colorScheme === 'dark' ? DarkAppTheme : LightTheme;

  const toggleTheme = () => {
    setThemeMode(prev => {
      if (prev === 'system') {
        return systemColorScheme === 'dark' ? 'light' : 'dark';
      }
      return prev === 'dark' ? 'light' : 'dark';
    });
  };

  const contextValue = useMemo(() => ({
    theme,
    colorScheme,
    themeMode,
    toggleTheme
  }), [theme, colorScheme, themeMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}