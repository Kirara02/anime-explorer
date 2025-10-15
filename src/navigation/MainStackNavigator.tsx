import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from './types';
import MainNavigator from './MainNavigator';
import DetailScreen from '../screens/DetailScreen';
import CategoryListScreen from '../screens/CategoryListScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0a0a0a' },
        headerTintColor: '#fff',
        headerTitleStyle: { color: '#fff' },
      }}
    >
      <Stack.Screen
        name="Home"
        component={MainNavigator}
        options={{ headerShown: false }}
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
