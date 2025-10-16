import React, { useEffect, useMemo } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '../store';
import { useTheme } from '../theme/ThemeContext';
import AuthNavigator from './AuthNavigator';
import MainStackNavigator from './MainStackNavigator';

export default function RootNavigator() {
  const { user, initializing, registering, setUser, setInitializing, checkAuth } =
    useAuthStore();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    // Jalankan listener Firebase Auth sekali saat mount
    const unsubscribe = checkAuth();

    return () => {
      unsubscribe(); // pastikan listener dihapus saat unmount
    };
  }, [checkAuth]);

  if (initializing || registering) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#00b4d8" />
          <Text style={styles.loadingText}>
            {registering ? 'Creating your account...' : 'Loading...'}
          </Text>
          <Text style={styles.loadingSubtext}>
            {registering ? 'Setting up your profile' : 'Please wait'}
          </Text>
        </View>
      </View>
    );
  }

  return user ? <MainStackNavigator /> : <AuthNavigator />;
}

const createStyles = (theme: any) => StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  loadingText: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubtext: {
    color: theme.colors.text + '80',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
