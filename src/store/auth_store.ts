import { create } from 'zustand';
import auth from '@react-native-firebase/auth';
import { AppUser, getUser, logout } from '../services/auth_service';

type AuthState = {
  user: AppUser | null;
  initializing: boolean;
  setUser: (user: AppUser | null) => void;
  setInitializing: (value: boolean) => void;
  checkAuth: () => () => void;
  logoutUser: () => Promise<void>;
};

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  initializing: true,

  setUser: user => set({ user }),
  setInitializing: value => set({ initializing: value }),

  checkAuth: () => {
    // 🔹 Jalankan listener Firebase
    const unsubscribe = auth().onAuthStateChanged(async firebaseUser => {
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
}));
