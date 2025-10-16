import { create } from 'zustand';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { AppUser, getUser, logout, updatePhotoURL } from '../services/auth_service';

type AuthState = {
  user: AppUser | null;
  initializing: boolean;
  registering: boolean;
  setUser: (user: AppUser | null) => void;
  setInitializing: (value: boolean) => void;
  setRegistering: (value: boolean) => void;
  checkAuth: () => () => void;
  logoutUser: () => Promise<void>;
  updateUserPhoto: (imageUri: string) => Promise<{ success: boolean; error?: string }>;
};

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  initializing: true,
  registering: false,

  setUser: user => set({ user }),
  setInitializing: value => set({ initializing: value }),
  setRegistering: value => set({ registering: value }),

  checkAuth: () => {
    // 🔹 Jalankan listener Firebase
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      try {
        if (firebaseUser) {
          // Ambil data lengkap user (gabung auth + Firestore)
          const appUser = await getUser();
          set({ user: appUser, initializing: false });
        } else {
          set({ user: null, initializing: false });
        }
      } catch (error) {
        console.error('Auth listener error:', error);
        set({ user: null, initializing: false });
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
