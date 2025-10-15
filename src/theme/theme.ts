// src/theme/theme.ts
import { DefaultTheme, DarkTheme, Theme } from '@react-navigation/native';

export const LightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff',
    card: '#f8f8f8',
    text: '#000000',
    primary: '#6200ee', // warna utama
    border: '#dcdcdc',
  },
};

export const DarkAppTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#121212',
    card: '#1e1e1e',
    text: '#ffffff',
    primary: '#bb86fc',
    border: '#272727',
  },
};
