import React, { useEffect, useState } from 'react';
import { ScrollView, View, ActivityIndicator, StyleSheet } from 'react-native';
import HomeHeader from '../components/HomeHeader';
import AnimeCarousel from '../components/AnimeCarousel';
import {
  getSeasonNow,
  getTopAnime,
  getUpcomingAnime,
  getRecommendations,
} from '../services/jikan_moe_service';
import { Anime, RecommendationEntry } from '../types/jikan';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { MainStackParamList } from '../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/auth_store';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [nowAiring, setNowAiring] = useState<Anime[]>([]);
  const [topAnime, setTopAnime] = useState<Anime[]>([]);
  const [upcoming, setUpcoming] = useState<Anime[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationEntry[]>(
    [],
  );

  const fetchAll = React.useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [now, top, up, rec] = await Promise.all([
        getSeasonNow(),
        getTopAnime(),
        getUpcomingAnime(),
        getRecommendations(),
      ]);

      setNowAiring(now.data || []);
      setTopAnime(top.data || []);
      setUpcoming(up.data || []);

      const recEntries: RecommendationEntry[] =
        rec.data
          ?.flatMap(r => r.entry || [])
          .filter((e): e is RecommendationEntry => e !== undefined) || [];
      setRecommendations(recEntries);
    } catch (err) {
      console.log('❌ Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch data saat pertama kali komponen mount dan user ada
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Fetch data setiap kali screen mendapat focus
  useFocusEffect(
    React.useCallback(() => {
      fetchAll();
    }, [fetchAll]),
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header dengan greeting & search */}
        <HomeHeader
          onSelectAnime={(id: number) =>
            navigation.navigate('Detail', { mal_id: id })
          }
        />

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#00b4d8" />
          </View>
        ) : (
          <>
            <AnimeCarousel
              title="Now Airing 🌸"
              data={nowAiring}
              onPress={(id: number) =>
                navigation.navigate('Detail', { mal_id: id })
              }
            />

            <AnimeCarousel
              title="Top Anime 🔝"
              data={topAnime}
              onPress={(id: number) =>
                navigation.navigate('Detail', { mal_id: id })
              }
            />

            <AnimeCarousel
              title="Upcoming ⏳"
              data={upcoming}
              onPress={(id: number) =>
                navigation.navigate('Detail', { mal_id: id })
              }
            />

            <AnimeCarousel
              title="Recommendations 💌"
              data={recommendations}
              onPress={(id: number) =>
                navigation.navigate('Detail', { mal_id: id })
              }
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    minHeight: 400,
    paddingTop: 20,
  },
});
