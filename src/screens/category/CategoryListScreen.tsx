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
import type { Theme } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Anime, RecommendationEntry } from '../../types/jikan';
import { useTheme } from '../../theme/ThemeContext';
import { getRecommendations, getSeasonNow, getTopAnime, getUpcomingAnime } from '../../services';

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
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('Detail', { mal_id: item.mal_id })
            }
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
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>

            {category !== 'recommendations' &&
              isAnime(item) &&
              item.score != null && (
                <Text style={styles.score}>⭐ {item.score.toFixed(1)}</Text>
              )}
          </TouchableOpacity>
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
    image: {
      width: '100%',
      height: 150,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
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
