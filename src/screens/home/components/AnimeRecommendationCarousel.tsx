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
import type { Theme } from '@react-navigation/native';
import { RecommendationEntry } from '../../../types/jikan';
import { useTheme } from '../../../theme/ThemeContext';
import { SPACING } from '../../../constants';

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
          <TouchableOpacity
            key={`recommendation-${item.mal_id}-${index}`}
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
    image: {
      width: '100%',
      height: CARD_WIDTH * 1.2,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
    },
    animeTitle: {
      fontSize: 14,
      color: theme.colors.text,
      padding: 8,
    },
  });
