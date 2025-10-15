import React from 'react';
import { View, Text } from 'react-native';

export default function FavoritesScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#0a0a0a',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontSize: 20 }}>⭐ Favorite Screen</Text>
    </View>
  );
}
