import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Image,
  Text,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import type { Theme } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Anime, RecommendationEntry } from '../../types/jikan';
import { useTheme } from '../../theme/ThemeContext';
import { useIsFavorited } from '../../store/favorites_store';
import { getRecommendations, getSeasonNow, getTopAnime, getUpcomingAnime } from '../../services';

// Separate component to avoid hook call issues in renderItem
function CategoryListItem({
  item,
  navigation,
  category,
  styles
}: {
  item: Anime | RecommendationEntry;
  navigation: NavigationProp;
  category: string;
  styles: any;
}) {
  const isFavorited = useIsFavorited(item.mal_id);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('Detail', { mal_id: item.mal_id })
      }
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
      <Text style={styles.title} numberOfLines={2}>
        {item.title}
      </Text>

      {category !== 'recommendations' &&
        isAnime(item) &&
        item.score != null && (
          <Text style={styles.score}>⭐ {item.score.toFixed(1)}</Text>
        )}
    </TouchableOpacity>
  );
}

type CategoryListScreenRouteProp = RouteProp<
  MainStackParamList,
  'CategoryList'
>;
type NavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'CategoryList'
>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 3;

// 🧠 Helper type guard
const isAnime = (item: any): item is Anime => {
  return typeof item.score === 'number';
};

export default function CategoryListScreen() {
  const route = useRoute<CategoryListScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [recommendationList, setRecommendationList] = useState<
    RecommendationEntry[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const { category, title } = route.params;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const fetchAnime = async (page: number = 1) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      if (category === 'recommendations') {
        // Recommendations don't support pagination
        if (page === 1) {
          const response = await getRecommendations();
          const recEntries: RecommendationEntry[] =
            response.data
              ?.flatMap(r => r.entry || [])
              .filter((e): e is RecommendationEntry => !!e) || [];
          setRecommendationList(recEntries);
        }
      } else {
        let response;
        switch (category) {
          case 'now_airing':
            response = await getSeasonNow(page);
            break;
          case 'top_anime':
            response = await getTopAnime(page);
            break;
          case 'upcoming':
            response = await getUpcomingAnime(page);
            break;
          default:
            response = { data: [] };
        }

        if (page === 1) {
          setAnimeList(response.data || []);
        } else {
          setAnimeList(prev => [...prev, ...(response.data || [])]);
        }

        setCurrentPage(page);
        setHasNextPage(response.pagination?.has_next_page || false);
      }
    } catch (err) {
      console.error('❌ Fetch error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchAnime(1);
    navigation.setOptions({ title });
  }, [category, title]);

  const loadMoreAnime = () => {
    if (hasNextPage && !loading && !loadingMore) {
      fetchAnime(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00b4d8" />
      </View>
    );
  }

  const dataList =
    category === 'recommendations' ? recommendationList : animeList;

  return (
    <View style={styles.container}>
      <FlatList
        data={dataList}
        numColumns={3}
        keyExtractor={(item, index) => {
          const prefix =
            category === 'recommendations'
              ? 'rec-'
              : category === 'top_anime'
              ? 'top-'
              : category === 'upcoming'
              ? 'up-'
              : category === 'now_airing'
              ? 'air-'
              : 'anime-';

          return item.mal_id ? `${prefix}${item.mal_id}` : `${prefix}${index}`;
        }}
        contentContainerStyle={styles.grid}
        onEndReached={loadMoreAnime}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color="#00b4d8" />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <CategoryListItem
            item={item}
            navigation={navigation}
            category={category}
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
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    loadingMore: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    grid: {
      padding: 16,
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
    title: {
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
  });
