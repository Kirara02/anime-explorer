import { create } from 'zustand';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { AppUser, getUser, logout, updatePhotoURL } from '../services/auth_service';
import { UserPreferencesStorage } from '../utils/storage';

type AuthState = {
  user: AppUser | null;
  initializing: boolean;
  registering: boolean;
  userPreferences: Record<string, any>;
  setUser: (user: AppUser | null) => void;
  setInitializing: (value: boolean) => void;
  setRegistering: (value: boolean) => void;
  setUserPreferences: (preferences: Record<string, any>) => void;
  loadUserPreferences: () => Promise<void>;
  saveUserPreferences: () => Promise<void>;
  checkAuth: () => () => void;
  logoutUser: () => Promise<void>;
  updateUserPhoto: (imageUri: string) => Promise<{ success: boolean; error?: string }>;
};

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  initializing: true,
  registering: false,
  userPreferences: {},

  setUser: user => set({ user }),
  setInitializing: value => set({ initializing: value }),
  setRegistering: value => set({ registering: value }),
  setUserPreferences: preferences => set({ userPreferences: preferences }),

  loadUserPreferences: async () => {
    try {
      const preferences = await UserPreferencesStorage.get();
      if (preferences) {
        set({ userPreferences: preferences });
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  },

  saveUserPreferences: async () => {
    try {
      const { userPreferences } = useAuthStore.getState();
      await UserPreferencesStorage.set(userPreferences);
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  },

  checkAuth: () => {
    // 🔹 Jalankan listener Firebase
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      try {
        if (firebaseUser) {
          // Ambil data lengkap user (gabung auth + Firestore)
          const appUser = await getUser();
          set({ user: appUser, initializing: false });
          // Load user preferences when user logs in
          const preferences = await UserPreferencesStorage.get();
          if (preferences) {
            set({ userPreferences: preferences });
          }
        } else {
          set({ user: null, initializing: false, userPreferences: {} });
        }
      } catch (error) {
        console.error('Auth listener error:', error);
        set({ user: null, initializing: false, userPreferences: {} });
      }
    });

    return unsubscribe;
  },

  logoutUser: async () => {
    await logout();
    set({ user: null });
  },

  updateUserPhoto: async (imageUri: string) => {
    try {
      const result = await updatePhotoURL(imageUri);
      if (result.success && result.photoURL) {
        set(state => ({
          user: state.user ? { ...state.user, photoURL: result.photoURL } : null
        }));
      }
      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },
}));
