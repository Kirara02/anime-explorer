import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';
import { DarkAppTheme, LightTheme } from './theme';
import { ThemeStorage } from '../utils/storage';
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

  // Load saved theme mode on mount
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedTheme = await ThemeStorage.getThemeMode();
        if (savedTheme) {
          setThemeMode(savedTheme);
        }
      } catch (error) {
        console.error('Error loading theme mode:', error);
      }
    };

    loadThemeMode();
  }, []);

  const colorScheme = themeMode === 'system' ? systemColorScheme : themeMode;
  const theme = colorScheme === 'dark' ? DarkAppTheme : LightTheme;

  const toggleTheme = async () => {
    try {
      const newThemeMode = themeMode === 'dark' ? 'light' : 'dark';
      setThemeMode(newThemeMode);
      await ThemeStorage.setThemeMode(newThemeMode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
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