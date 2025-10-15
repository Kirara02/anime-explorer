import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeHeader from '../components/HomeHeader';
import AnimeGrid from '../components/AnimeGrid';
import {
  getSeasonNow,
  getTopAnime,
  getUpcomingAnime,
} from '../services/jikan_moe_service';
import { Anime } from '../types/jikan';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { MainStackParamList } from '../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/auth_store';
import AnimeRecommendationCarousel from '../components/AnimeRecommendationCarousel';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'Home'>;

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
  const [loading, setLoading] = useState(true);
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  const fetchAnimeByCategory = React.useCallback(
    async (category: AnimeCategory) => {
      if (!user) return;
      setLoading(true);
      try {
        const response = await category.fetch();
        setAnimeList(response.data || []);
      } catch (err) {
        console.log('❌ Fetch error:', err);
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  useEffect(() => {
    fetchAnimeByCategory(selectedCategory);
  }, [selectedCategory, fetchAnimeByCategory]);

  useFocusEffect(
    React.useCallback(() => {
      fetchAnimeByCategory(selectedCategory);
    }, [fetchAnimeByCategory, selectedCategory]),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
              <Text style={styles.categoryText}>{category.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#00b4d8" />
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  categoryContainer: {
    marginBottom: 20,
    marginTop: 24,
  },
  categoryContent: {
    paddingHorizontal: 16,
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedBadge: {
    backgroundColor: '#00b4d8',
    borderColor: '#00b4d8',
  },
  categoryText: {
    color: '#fff',
    fontSize: 16,
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    minHeight: 400,
    paddingTop: 20,
  },
});
