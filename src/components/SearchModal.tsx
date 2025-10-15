import React, { useState, useEffect } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Anime } from '../types/jikan';
import { searchAnime } from '../services/jikan_moe_service';

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
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) resetSearch();
  }, [visible]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await searchAnime(query);
      setResults(res.data || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setQuery('');
    setResults([]);
    setLoading(false);
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'left', 'right', 'bottom']}
      >
        <View style={styles.container}>
          {/* Header bar */}
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
          {loading && (
            <ActivityIndicator
              color="#00b4d8"
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
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0a',
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
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
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
    backgroundColor: '#1a1a1a',
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
    color: '#fff',
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
