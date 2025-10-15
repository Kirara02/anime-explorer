import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

type AnimeCarouselProps<
  T extends { mal_id: number; title: string; images?: any },
> = {
  title: string;
  data: T[];
  onPress: (id: number) => void;
};

export default function AnimeCarousel<
  T extends { mal_id: number; title: string; images?: any },
>({ title, data, onPress }: AnimeCarouselProps<T>) {
  return (
    <View style={{ marginTop: 20 }}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={data.slice(0, 12)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => onPress(item.mal_id)}
          >
            <Image
              source={{
                uri:
                  item.images?.jpg?.image_url ||
                  item.images?.webp?.image_url ||
                  'https://cdn.myanimelist.net/images/questionmark_50.gif',
              }}
              style={styles.image}
            />
            <Text numberOfLines={1} style={styles.name}>
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => `${title}-${item.mal_id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#00b4d8',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 8,
  },
  card: { width: 120, marginLeft: 16 },
  image: { width: 120, height: 180, borderRadius: 10 },
  name: { color: '#fff', fontSize: 14, marginTop: 5 },
});
