import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import type { Theme } from '@react-navigation/native';
import { Anime } from '../../../types/jikan';
import { useTheme } from '../../../theme/ThemeContext';
import { useIsFavorited } from '../../../store/favorites_store';
import { SPACING } from '../../../constants';

// Separate component to avoid hook call issues in renderItem
function AnimeGridItem({
  item,
  onPress,
  styles
}: {
  item: Anime;
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
      <Text style={styles.animeTitle} numberOfLines={1}>
        {item.title}
      </Text>
      {item.score != null && (
        <Text style={styles.score}>⭐ {item.score.toFixed(1)}</Text>
      )}
    </TouchableOpacity>
  );
}

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
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
          <AnimeGridItem
            item={item}
            onPress={onPress}
            styles={styles}
          />
        )}
      />
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
    gridContainer: {
      paddingHorizontal: SPACING.md,
      justifyContent: 'center', // rata tengah
    },
    card: {
      width: CARD_WIDTH,
      marginHorizontal: 4,
      marginBottom: 16,
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      overflow: 'hidden',
    },
    imageContainer: {
      position: 'relative',
    },
    image: {
      width: '100%',
      height: 150,
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
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: '600',
    },
  });
