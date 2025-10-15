import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { RecommendationEntry } from '../types/jikan';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 3;

interface AnimeRecommendationCarouselProps {
  title: string;
  data: RecommendationEntry[];
  onPress: (id: number) => void;
  onSeeMore: () => void;
}

export default function AnimeRecommendationCarousel({
  title,
  data,
  onPress,
  onSeeMore,
}: AnimeRecommendationCarouselProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity style={styles.seeMoreButton} onPress={onSeeMore}>
          <Text style={styles.seeMoreText}>See More</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {data.map(item => (
          <TouchableOpacity
            key={item.mal_id}
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
            <Text style={styles.animeTitle} numberOfLines={2}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 16,
  },
  card: {
    width: CARD_WIDTH,
    marginRight: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: CARD_WIDTH * 1.2,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  animeTitle: {
    fontSize: 14,
    color: '#fff',
    padding: 8,
  },
});
