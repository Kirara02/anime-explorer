import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Theme } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { Anime } from '../../types/jikan';
import { MainStackParamList } from '../../navigation/types';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SPACING } from '../../constants';
import { getAnimeDetail } from '../../services';
import { useAuthStore } from '../../store';
import { useFavoritesStore, useIsFavorited } from '../../store/favorites_store';
import { formatScore, formatDate } from '../../utils';

type Props = NativeStackScreenProps<MainStackParamList, 'Detail'>;

export default function DetailScreen({ route, navigation }: Props) {
  const { mal_id } = route.params;
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const { toggleFavorite } = useFavoritesStore();
  const isFavorited = useIsFavorited(mal_id);
  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    const fetchAnimeDetail = async () => {
      try {
        setLoading(true);
        const response = await getAnimeDetail(mal_id);
        setAnime(response.data);
        // Set navigation title
        navigation.setOptions({
          title: response.data.title_english || response.data.title,
        });
      } catch (err) {
        console.error('Error fetching anime details:', err);
        setError('Failed to load anime details');
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeDetail();
  }, [mal_id, navigation]);

  const handleToggleFavorite = async () => {
    if (!user || !anime) {
      Alert.alert('Error', 'Please login to add favorites');
      return;
    }

    try {
      await toggleFavorite(user.uid, anime);
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !anime) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Something went wrong'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderInfoRow = (label: string, value: string | number | undefined) => {
    if (!value) return null;
    return (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Cover Image */}
      <Image
        source={{
          uri:
            anime.images.webp.large_image_url ||
            anime.images.jpg.large_image_url,
        }}
        style={styles.coverImage}
        resizeMode="cover"
      />

      {/* Title Section */}
      <View style={styles.section}>
        <View style={styles.titleContainer}>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>{anime.title}</Text>
            {anime.title_japanese && (
              <Text style={styles.japaneseTitle}>{anime.title_japanese}</Text>
            )}
          </View>
          {user && (
            <TouchableOpacity
              style={[styles.favoriteButton, isFavorited && styles.favoriteButtonActive]}
              onPress={handleToggleFavorite}
            >
              <Ionicons
                name={isFavorited ? "heart" : "heart-outline"}
                size={28}
                color={isFavorited ? "#ff4d6d" : theme.colors.text}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Score & Stats */}
      <View style={styles.statsContainer}>
        {anime.score && (
          <View style={styles.statItem}>
            <Ionicons name="star" size={24} color="#ffd700" />
            <Text style={styles.statValue}>{formatScore(anime.score)}</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
        )}
        {anime.rank && (
          <View style={styles.statItem}>
            <Ionicons name="trophy" size={24} color="#00b4d8" />
            <Text style={styles.statValue}>#{anime.rank}</Text>
            <Text style={styles.statLabel}>Rank</Text>
          </View>
        )}
        {anime.popularity && (
          <View style={styles.statItem}>
            <Ionicons name="heart" size={24} color="#ff6b6b" />
            <Text style={styles.statValue}>#{anime.popularity}</Text>
            <Text style={styles.statLabel}>Popularity</Text>
          </View>
        )}
      </View>

      {/* Information Section */}
      <View style={[styles.section, { paddingHorizontal: SPACING.md }]}>
        <Text style={styles.sectionTitle}>Information</Text>
        {renderInfoRow('Type', anime.type)}
        {renderInfoRow('Episodes', anime.episodes?.toString())}
        {renderInfoRow('Status', anime.status)}
        {renderInfoRow('Aired', anime.aired?.string ? formatDate(anime.aired.string) : undefined)}
        {renderInfoRow('Duration', anime.duration)}
        {renderInfoRow('Rating', anime.rating)}
        {anime.studios &&
          renderInfoRow('Studio', anime.studios.map(s => s.name).join(', '))}
      </View>

      {/* Synopsis */}
      {anime.synopsis && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Synopsis</Text>
          <Text style={styles.synopsis}>{anime.synopsis}</Text>
        </View>
      )}

      {/* Genres */}
      {anime.genres && anime.genres.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Genres</Text>
          <View style={styles.genresContainer}>
            {anime.genres.map(genre => (
              <View key={genre.mal_id} style={styles.genreTag}>
                <Text style={styles.genreText}>{genre.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Trailer Button */}
      {anime.trailer?.url && (
        <TouchableOpacity
          style={styles.trailerButton}
          onPress={() => Linking.openURL(anime.trailer!.url)}
        >
          <Ionicons name="play-circle" size={24} color="#fff" />
          <Text style={styles.trailerButtonText}>Watch Trailer</Text>
        </TouchableOpacity>
      )}

      {/* More Info Button */}
      <TouchableOpacity
        style={styles.moreInfoButton}
        onPress={() => Linking.openURL(anime.url)}
      >
        <Text style={styles.moreInfoButtonText}>View on MyAnimeList</Text>
      </TouchableOpacity>
    </ScrollView>
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
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      padding: 20,
    },
    errorText: {
      color: '#ff6b6b',
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20,
    },
    retryButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryButtonText: {
      color: '#fff',
      fontSize: 16,
    },
    coverImage: {
      width: '100%',
      height: 300,
    },
    section: {
      padding: 16,
    },
    titleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    titleWrapper: {
      flex: 1,
      marginRight: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    japaneseTitle: {
      fontSize: 16,
      color: theme.colors.text + '99',
      marginBottom: 8,
    },
    favoriteButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    favoriteButtonActive: {
      backgroundColor: '#ff4d6d20',
      borderColor: '#ff4d6d',
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 16,
      backgroundColor: theme.colors.card,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 4,
    },
    statLabel: {
      color: theme.colors.text + '99',
      fontSize: 12,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 12,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    infoLabel: {
      color: theme.colors.text + '99',
      fontSize: 16,
    },
    infoValue: {
      color: theme.colors.text,
      fontSize: 16,
      flex: 1,
      textAlign: 'right',
      marginLeft: 16,
    },
    synopsis: {
      color: theme.colors.text,
      fontSize: 16,
      lineHeight: 24,
    },
    genresContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -4,
    },
    genreTag: {
      backgroundColor: theme.colors.card,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      margin: 4,
    },
    genreText: {
      color: theme.colors.text,
      fontSize: 14,
    },
    trailerButton: {
      flexDirection: 'row',
      backgroundColor: '#ff0000',
      margin: 16,
      padding: 16,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    trailerButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    moreInfoButton: {
      backgroundColor: theme.colors.card,
      margin: 16,
      marginTop: 8,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    moreInfoButtonText: {
      color: theme.colors.text,
      fontSize: 16,
    },
  });
