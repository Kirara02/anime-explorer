import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Anime, BaseResponse } from '../types/jikan';
import { useTheme } from '../theme/ThemeContext';
import { useApi } from '../hooks/useApi';
import { COLORS } from '../constants';
import type { Theme } from '@react-navigation/native';
import { searchAnime } from '../services';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function SearchModal({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (anime: Anime) => void;
}) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    if (!visible) resetSearch();
  }, [visible]);

  const { loading: searchLoading, execute: searchExecute } =
    useApi<BaseResponse<Anime>>();

  const handleSearch = async () => {
    if (!query.trim()) return;

    setCurrentPage(1);
    try {
      const res = await searchExecute(() => searchAnime(query, 1));
      setResults(res?.data || []);
      setHasNextPage(res?.pagination?.has_next_page || false);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
      setHasNextPage(false);
    }
  };

  const loadMoreResults = async () => {
    if (!hasNextPage || loadingMore || loading) return;

    setLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      const res = await searchAnime(query, nextPage);
      if (res.data) {
        setResults(prev => [...prev, ...res.data]);
        setCurrentPage(nextPage);
        setHasNextPage(res.pagination?.has_next_page || false);
      }
    } catch (err) {
      console.error('Load more error:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const resetSearch = () => {
    setQuery('');
    setResults([]);
    setLoading(false);
    setLoadingMore(false);
    setCurrentPage(1);
    setHasNextPage(false);
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <View
        style={[
          styles.safeArea,
          {
            paddingTop: Platform.OS === 'ios' ? insets.top : 4,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            {/* Search field */}
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={22} color="#00b4d8" />
              <TextInput
                style={styles.input}
                placeholder="Search anime..."
                placeholderTextColor="#999"
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSearch}
                autoFocus
              />
              <TouchableOpacity onPress={resetSearch} style={styles.iconBtn}>
                <Ionicons name="close-outline" size={24} color="#ff4d4d" />
              </TouchableOpacity>
            </View>

            {/* Search & Cancel icons outside bar */}
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={onClose} style={styles.actionIcon}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Loading */}
          {searchLoading && (
            <ActivityIndicator
              color={COLORS.primary}
              size="large"
              style={{ marginTop: 20 }}
            />
          )}

          {/* Results */}
          <FlatList
            data={results}
            keyExtractor={item => item.mal_id.toString()}
            numColumns={2}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            onEndReached={loadMoreResults}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator
                  color={COLORS.primary}
                  size="small"
                  style={{ marginVertical: 20 }}
                />
              ) : null
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
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
                {item.score && (
                  <Text style={styles.score}>⭐ {item.score.toFixed(1)}</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flex: 1,
      paddingHorizontal: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 8,
    },
    searchBar: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderRadius: 10,
      paddingHorizontal: 10,
    },
    input: {
      flex: 1,
      color: theme.colors.text,
      paddingVertical: 8,
      fontSize: 16,
      marginLeft: 6,
    },
    iconBtn: { paddingHorizontal: 6 },
    actionIcon: {
      marginLeft: 10,
      alignItems: 'center',
    },
    cancelText: {
      color: '#ff4d4d',
      fontSize: 16,
      fontWeight: '600',
    },
    grid: { paddingBottom: 80 },
    card: {
      width: CARD_WIDTH,
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      marginBottom: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    image: {
      width: '100%',
      height: 180,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
    },
    title: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '600',
      marginTop: 6,
      marginHorizontal: 8,
    },
    score: {
      color: '#ffd700',
      fontSize: 12,
      marginHorizontal: 8,
      marginBottom: 8,
    },
  });
