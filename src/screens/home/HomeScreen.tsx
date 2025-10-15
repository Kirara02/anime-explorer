import React, { useEffect, useState, useMemo } from 'react';
import {
  ScrollView,
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Text,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Theme } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/types';
import { Anime } from '../../types/jikan';
import { getSeasonNow, getTopAnime, getUpcomingAnime } from '../../services';
import { useAuthStore } from '../../store';
import { useApi } from '../../hooks/useApi';
import {
  AnimeGrid,
  AnimeRecommendationCarousel,
  HomeHeader,
} from './components';
import { COLORS, SPACING } from '../../constants';
import { useTheme } from '../../theme/ThemeContext';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'MainTabs'>;

type AnimeCategory = {
  id: string;
  title: string;
  emoji: string;
  fetch: () => Promise<{ data?: Anime[] }>;
};

const categories: AnimeCategory[] = [
  { id: 'now_airing', title: 'Now Airing', emoji: '', fetch: getSeasonNow },
  { id: 'top_anime', title: 'Top Anime', emoji: '', fetch: getTopAnime },
  { id: 'upcoming', title: 'Upcoming', emoji: '', fetch: getUpcomingAnime },
];

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [cache, setCache] = useState<Map<string, Anime[]>>(new Map());
  const [refreshing, setRefreshing] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Use useApi hook for better state management
  const { data, loading, error, execute } = useApi<{ data?: Anime[] }>();

  const fetchAnimeByCategory = React.useCallback(
    async (category: AnimeCategory) => {
      if (!user) return;

      // Check cache first
      const cacheKey = `${category.id}-${user.uid}`;
      if (cache.has(cacheKey)) {
        console.log('📋 Using cached data for:', category.title);
        setAnimeList(cache.get(cacheKey)!);
        return;
      }

      try {
        console.log('🌐 Fetching data for:', category.title);
        const response = await execute(() => category.fetch());
        const animeData = response?.data || [];
        setAnimeList(animeData);

        // Update cache
        setCache(prev => new Map(prev).set(cacheKey, animeData));
      } catch (err) {
        console.log('❌ Fetch error:', err);
        setAnimeList([]);
      }
    },
    [user, cache], // Remove execute from dependencies to prevent re-creation
  );

  // Only fetch when category changes
  useEffect(() => {
    fetchAnimeByCategory(selectedCategory);
  }, [selectedCategory]); // Remove fetchAnimeByCategory from dependencies

  // Remove useFocusEffect to prevent duplicate calls
  // Data will be loaded from cache or initial fetch

  // Pull to refresh handler
  const onRefresh = React.useCallback(async () => {
    if (!user) return;

    setRefreshing(true);

    try {
      console.log('🔄 Refreshing all data...');

      // Clear cache to force fresh data
      setCache(new Map());

      // Refetch current category
      const response = await execute(() => selectedCategory.fetch());
      const animeData = response?.data || [];
      setAnimeList(animeData);

      // Update cache with fresh data
      const cacheKey = `${selectedCategory.id}-${user.uid}`;
      setCache(prev => new Map(prev).set(cacheKey, animeData));

      console.log('✅ Data refreshed successfully');
    } catch (err) {
      console.log('❌ Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  }, [user, selectedCategory, execute]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
            title="Pull to refresh"
            titleColor={theme.colors.text}
          />
        }
      >
        <HomeHeader
          onSelectAnime={(id: number) =>
            navigation.navigate('Detail', { mal_id: id })
          }
        />

        {/* Category Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryBadge,
                selectedCategory.id === category.id && styles.selectedBadge,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory.id === category.id &&
                    styles.selectedCategoryText,
                ]}
              >
                {category.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <>
            <AnimeGrid
              title={selectedCategory.title}
              data={animeList}
              onPress={(id: number) =>
                navigation.navigate('Detail', { mal_id: id })
              }
              onSeeMore={() =>
                navigation.navigate('CategoryList', {
                  category: selectedCategory.id,
                  title: selectedCategory.title,
                })
              }
            />

            <AnimeRecommendationCarousel
              title="Recommendations"
              data={animeList}
              onPress={(id: number) =>
                navigation.navigate('Detail', { mal_id: id })
              }
              onSeeMore={() =>
                navigation.navigate('CategoryList', {
                  category: 'recommendations',
                  title: 'Recommendations',
                })
              }
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingBottom: 24,
    },
    categoryContainer: {
      marginBottom: 20,
      marginTop: 24,
    },
    categoryContent: {
      paddingHorizontal: SPACING.md,
    },
    categoryBadge: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.colors.card,
      borderRadius: 20,
      marginRight: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    selectedBadge: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    categoryText: {
      color: theme.colors.text,
      fontSize: 16,
    },
    selectedCategoryText: {
      color: '#fff',
      fontSize: 16,
    },
    loading: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      minHeight: 400,
      paddingTop: 20,
    },
  });
