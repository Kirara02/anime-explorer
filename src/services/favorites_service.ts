import firestore from '@react-native-firebase/firestore';
import { Anime } from '../types/jikan';

export interface FavoriteAnime extends Anime {
  addedAt: Date;
}

class FavoritesService {
  private collection = 'favorites';

  // Add anime to favorites
  async addToFavorites(userId: string, anime: Anime): Promise<void> {
    try {
      const favoriteData: FavoriteAnime = {
        ...anime,
        addedAt: new Date(),
      };

      await firestore()
        .collection(this.collection)
        .doc(userId)
        .collection('anime')
        .doc(anime.mal_id.toString())
        .set(favoriteData);

      console.log('✅ Added to favorites:', anime.title);
    } catch (error) {
      console.error('❌ Error adding to favorites:', error);
      throw error;
    }
  }

  // Remove anime from favorites
  async removeFromFavorites(userId: string, animeId: number): Promise<void> {
    try {
      await firestore()
        .collection(this.collection)
        .doc(userId)
        .collection('anime')
        .doc(animeId.toString())
        .delete();

      console.log('✅ Removed from favorites:', animeId);
    } catch (error) {
      console.error('❌ Error removing from favorites:', error);
      throw error;
    }
  }

  // Check if anime is favorited
  async isFavorited(userId: string, animeId: number): Promise<boolean> {
    try {
      const doc = await firestore()
        .collection(this.collection)
        .doc(userId)
        .collection('anime')
        .doc(animeId.toString())
        .get();

      return doc.exists();
    } catch (error) {
      console.error('❌ Error checking favorite status:', error);
      return false;
    }
  }

  // Get all favorites for a user
  async getFavorites(userId: string): Promise<FavoriteAnime[]> {
    try {
      const snapshot = await firestore()
        .collection(this.collection)
        .doc(userId)
        .collection('anime')
        .orderBy('addedAt', 'desc')
        .get();

      const favorites: FavoriteAnime[] = [];
      snapshot.forEach(doc => {
        favorites.push(doc.data() as FavoriteAnime);
      });

      console.log('📋 Retrieved favorites:', favorites.length);
      return favorites;
    } catch (error) {
      console.error('❌ Error getting favorites:', error);
      throw error;
    }
  }

  // Listen to favorites changes (real-time)
  subscribeToFavorites(
    userId: string,
    callback: (favorites: FavoriteAnime[]) => void,
  ) {
    return firestore()
      .collection(this.collection)
      .doc(userId)
      .collection('anime')
      .orderBy('addedAt', 'desc')
      .onSnapshot(
        snapshot => {
          const favorites: FavoriteAnime[] = [];
          snapshot.forEach(doc => {
            favorites.push(doc.data() as FavoriteAnime);
          });
          callback(favorites);
        },
        error => {
          console.error('❌ Error subscribing to favorites:', error);
        },
      );
  }

  // Toggle favorite status
  async toggleFavorite(userId: string, anime: Anime): Promise<boolean> {
    try {
      const isCurrentlyFavorited = await this.isFavorited(userId, anime.mal_id);

      if (isCurrentlyFavorited) {
        await this.removeFromFavorites(userId, anime.mal_id);
        return false; // Now not favorited
      } else {
        await this.addToFavorites(userId, anime);
        return true; // Now favorited
      }
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
      throw error;
    }
  }
}

export const favoritesService = new FavoritesService();
