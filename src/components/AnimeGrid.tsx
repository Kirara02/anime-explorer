import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Anime } from '../types/jikan';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 3; // 3 items per row with 16px padding on sides

interface AnimeGridProps {
  title: string;
  data: Anime[];
  onPress: (id: number) => void;
  onSeeMore: () => void;
}

export default function AnimeGrid({
  title,
  data,
  onPress,
  onSeeMore,
}: AnimeGridProps) {
  // Limit to 6 items
  const limitedData = data.slice(0, 6);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity style={styles.seeMoreButton} onPress={onSeeMore}>
          <Text style={styles.seeMoreText}>See More</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={limitedData}
        numColumns={3}
        scrollEnabled={false}
        contentContainerStyle={styles.gridContainer}
        keyExtractor={(item, index) => {
          const prefix = title.toLowerCase().replace(/\s+/g, '-');
          return item.mal_id
            ? `${prefix}-${item.mal_id}`
            : `${prefix}-${index}`;
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => onPress(item.mal_id)}
          >
            <Image
              source={{
                uri:
                  item.images?.jpg?.large_image_url ||
                  item.images?.jpg?.image_url ||
                  'https://cdn.myanimelist.net/images/questionmark_50.gif',
              }}
              style={styles.image}
            />
            <Text style={styles.animeTitle} numberOfLines={1}>
              {item.title}
            </Text>
            {item.score != null && (
              <Text style={styles.score}>⭐ {item.score.toFixed(1)}</Text>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  gridContainer: {
    paddingHorizontal: 16,
    justifyContent: 'center', // rata tengah
  },
  card: {
    width: CARD_WIDTH,
    marginHorizontal: 4,
    marginBottom: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  animeTitle: {
    fontSize: 14,
    color: '#fff',
    padding: 8,
    paddingBottom: 4,
  },
  score: {
    fontSize: 12,
    color: '#ffd700',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  seeMoreButton: {
    backgroundColor: 'transparent',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeMoreText: {
    color: '#00b4d8',
    fontSize: 14,
    fontWeight: '600',
  },
});
