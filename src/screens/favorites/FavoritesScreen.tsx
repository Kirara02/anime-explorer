import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { Theme } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../store';
import { useFavoritesStore } from '../../store/favorites_store';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SPACING } from '../../constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 3;

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'MainTabs'>;

export default function FavoritesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const { favorites, loading, initialize, removeFromFavorites } = useFavoritesStore();
  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    if (user?.uid) {
      initialize(user.uid);
    }
  }, [user?.uid, initialize]);

  const handleAnimePress = (animeId: number) => {
    navigation.navigate('Detail', { mal_id: animeId });
  };

  const handleRemoveFavorite = async (animeId: number, animeTitle: string) => {
    if (!user?.uid) return;

    Alert.alert(
      'Remove Favorite',
      `Remove "${animeTitle}" from favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromFavorites(user.uid, animeId);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove from favorites');
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="heart-outline" size={64} color={theme.colors.text + '40'} />
          <Text style={styles.emptyTitle}>Please Login</Text>
          <Text style={styles.emptySubtitle}>
            Login to view your favorite anime
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading && favorites.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (favorites.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="heart-outline" size={64} color={theme.colors.text + '40'} />
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptySubtitle}>
            Start adding anime to your favorites!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Favorites</Text>
        <Text style={styles.headerCount}>{favorites.length} anime</Text>
      </View>

      <FlatList
        data={favorites}
        numColumns={3}
        contentContainerStyle={styles.grid}
        keyExtractor={(item) => item.mal_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleAnimePress(item.mal_id)}
              onLongPress={() => handleRemoveFavorite(item.mal_id, item.title)}
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
              {item.score != null && (
                <Text style={styles.score}>⭐ {item.score.toFixed(1)}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginTop: SPACING.md,
      marginBottom: SPACING.sm,
    },
    emptySubtitle: {
      fontSize: 16,
      color: theme.colors.text + '80',
      textAlign: 'center',
      lineHeight: 24,
    },
    loadingText: {
      fontSize: 16,
      color: theme.colors.text + '80',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    headerCount: {
      fontSize: 16,
      color: theme.colors.text + '80',
    },
    grid: {
      padding: SPACING.md,
    },
    cardContainer: {
      width: CARD_WIDTH,
      marginHorizontal: 4,
      marginBottom: SPACING.md,
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    image: {
      width: '100%',
      height: CARD_WIDTH * 1.2,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
    },
    title: {
      fontSize: 14,
      color: theme.colors.text,
      padding: SPACING.sm,
      paddingBottom: 4,
    },
    score: {
      fontSize: 12,
      color: COLORS.primary,
      paddingHorizontal: SPACING.sm,
      paddingBottom: SPACING.sm,
    },
  });
