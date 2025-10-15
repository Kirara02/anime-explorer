import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Theme } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';

export default function FavoritesScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>⭐ Favorite Screen</Text>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      color: theme.colors.text,
      fontSize: 20,
    },
  });
