import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { FavoriteAnime, favoritesService } from '../services/favorites_service';
import { Anime } from '../types/jikan';

type FavoritesState = {
  favorites: FavoriteAnime[];
  loading: boolean;
  error: string | null;
  unsubscribe?: () => void;

  // Actions
  initialize: (userId: string) => void;
  cleanup: () => void;
  addToFavorites: (userId: string, anime: Anime) => Promise<void>;
  removeFromFavorites: (userId: string, animeId: number) => Promise<void>;
  toggleFavorite: (userId: string, anime: Anime) => Promise<boolean>;
  isFavorited: (animeId: number) => boolean;
  clearError: () => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  subscribeWithSelector((set, get) => ({
    favorites: [],
    loading: false,
    error: null,

    initialize: (userId: string) => {
      console.log('🎯 Initializing favorites for user:', userId);

      // Subscribe to real-time updates
      const unsubscribe = favoritesService.subscribeToFavorites(
        userId,
        (favorites) => {
          console.log('📡 Favorites updated:', favorites.length);
          set({ favorites, loading: false });
        }
      );

      // Store unsubscribe function for cleanup
      set({ unsubscribe });

      // Initial load
      set({ loading: true });
      favoritesService
        .getFavorites(userId)
        .then((favorites) => {
          set({ favorites, loading: false });
        })
        .catch((error) => {
          console.error('❌ Error loading favorites:', error);
          set({ error: error.message, loading: false });
        });
    },

    cleanup: () => {
      const state = get();
      if (state.unsubscribe) {
        state.unsubscribe();
        set({ unsubscribe: undefined });
      }
      set({ favorites: [], loading: false, error: null });
    },

    addToFavorites: async (userId: string, anime: Anime) => {
      try {
        set({ loading: true, error: null });
        await favoritesService.addToFavorites(userId, anime);
        // Real-time update will handle state change
      } catch (error: any) {
        console.error('❌ Error adding to favorites:', error);
        set({ error: error.message, loading: false });
        throw error;
      }
    },

    removeFromFavorites: async (userId: string, animeId: number) => {
      try {
        set({ loading: true, error: null });
        await favoritesService.removeFromFavorites(userId, animeId);
        // Real-time update will handle state change
      } catch (error: any) {
        console.error('❌ Error removing from favorites:', error);
        set({ error: error.message, loading: false });
        throw error;
      }
    },

    toggleFavorite: async (userId: string, anime: Anime) => {
      try {
        set({ loading: true, error: null });
        const isNowFavorited = await favoritesService.toggleFavorite(userId, anime);
        // Real-time update will handle state change
        return isNowFavorited;
      } catch (error: any) {
        console.error('❌ Error toggling favorite:', error);
        set({ error: error.message, loading: false });
        throw error;
      }
    },

    isFavorited: (animeId: number) => {
      const { favorites } = get();
      return favorites.some(fav => fav.mal_id === animeId);
    },

    clearError: () => {
      set({ error: null });
    },
  }))
);

// Selector hooks for better performance
export const useFavorites = () => useFavoritesStore((state) => state.favorites);
export const useFavoritesLoading = () => useFavoritesStore((state) => state.loading);
export const useFavoritesError = () => useFavoritesStore((state) => state.error);
export const useIsFavorited = (animeId: number) =>
  useFavoritesStore((state) => state.isFavorited(animeId));