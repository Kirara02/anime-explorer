import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/auth_store';
import AuthNavigator from './AuthNavigator';
import MainStackNavigator from './MainStackNavigator';

export default function RootNavigator() {
  const { user, initializing, setUser, setInitializing, checkAuth } =
    useAuthStore();

  useEffect(() => {
    // Jalankan listener Firebase Auth sekali saat mount
    const unsubscribe = checkAuth();

    return () => {
      unsubscribe(); // pastikan listener dihapus saat unmount
    };
  }, [checkAuth]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00b4d8" />
      </View>
    );
  }

  return user ? <MainStackNavigator /> : <AuthNavigator />;
}
