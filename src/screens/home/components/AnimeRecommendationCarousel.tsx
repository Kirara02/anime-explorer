import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import type { Theme } from '@react-navigation/native';
import { RecommendationEntry } from '../../../types/jikan';
import { useTheme } from '../../../theme/ThemeContext';
import { useIsFavorited } from '../../../store/favorites_store';
import { SPACING } from '../../../constants';

// Separate component to avoid hook call issues in map function
function AnimeRecommendationItem({
  item,
  onPress,
  styles
}: {
  item: RecommendationEntry;
  onPress: (id: number) => void;
  styles: any;
}) {
  const isFavorited = useIsFavorited(item.mal_id);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(item.mal_id)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              item.images?.jpg?.large_image_url ||
              item.images?.jpg?.image_url ||
              'https://cdn.myanimelist.net/images/questionmark_50.gif',
          }}
          style={styles.image}
        />
        {isFavorited && (
          <View style={styles.favoriteBadge}>
            <Ionicons name="heart" size={14} color="#ff4d6d" />
          </View>
        )}
      </View>
      <Text style={styles.animeTitle} numberOfLines={2}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );
}

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
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
        {data.map((item, index) => (
          <AnimeRecommendationItem
            key={`recommendation-${item.mal_id}-${index}`}
            item={item}
            onPress={onPress}
            styles={styles}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
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
      color: theme.colors.text,
    },
    seeMoreButton: {
      backgroundColor: 'transparent',
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    seeMoreText: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: '600',
    },
    scrollContent: {
      paddingHorizontal: SPACING.md,
    },
    card: {
      width: CARD_WIDTH,
      marginRight: 12,
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      overflow: 'hidden',
    },
    imageContainer: {
      position: 'relative',
    },
    image: {
      width: '100%',
      height: CARD_WIDTH * 1.2,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
    },
    favoriteBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 12,
      padding: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    animeTitle: {
      fontSize: 14,
      color: theme.colors.text,
      padding: 8,
    },
  });
