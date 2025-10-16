import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from './types';
import MainTabNavigator from './MainTabNavigator';
import { DetailScreen } from '../screens/detail';
import { CategoryListScreen } from '../screens/category';
import { useTheme } from '../theme/ThemeContext';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStackNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.card },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text },
        headerBackTitle: 'Back', // Custom back button text
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{ title: 'Anime Detail' }}
      />
      <Stack.Screen name="CategoryList" component={CategoryListScreen} />
    </Stack.Navigator>
  );
}
