import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, onAuthStateChanged } from '@react-native-firebase/auth';
import { getFirestore, collection, doc, getDoc, setDoc, serverTimestamp, updateDoc } from '@react-native-firebase/firestore';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { uploadImageToCloudinary } from './cloudinary_service';

export type AuthError = {
  code: string;
  message: string;
};

export type AppUser = {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  favorites?: string[];
  createdAt?: FirebaseFirestoreTypes.Timestamp;
  lastActive?: FirebaseFirestoreTypes.Timestamp;
  bio?: string;
  preferences?: {
    newsletter: boolean;
    notifications: boolean;
    theme: 'light' | 'dark' | 'system';
  };
};

// 🔹 Fungsi Login
export const login = async (email: string, password: string) => {
  try {
    const auth = getAuth();
    const userCred = await signInWithEmailAndPassword(auth, email, password);

    // 🔹 Ambil data user dari Firestore
    const firestore = getFirestore();
    const userDoc = await getDoc(doc(collection(firestore, 'users'), userCred.user.uid));
    const data = userDoc.data() as AppUser | undefined;

    const user: AppUser = {
      uid: userCred.user.uid,
      name: data?.name || userCred.user.displayName || 'Guest',
      email: userCred.user.email || '',
      photoURL: data?.photoURL || userCred.user.photoURL || undefined,
      favorites: data?.favorites || [],
    };

    return { success: true, user };
  } catch (error: any) {
    const e = error as FirebaseAuthTypes.NativeFirebaseAuthError;
    return { success: false, error: parseAuthError(e) };
  }
};

// 🔹 Fungsi Signup
export const signup = async (name: string, email: string, password: string) => {
  try {
    const auth = getAuth();
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    );

    await updateProfile(user, { displayName: name });

    const firestore = getFirestore();
    const newUser: AppUser = {
      uid: user.uid,
      name,
      email: user.email || '',
      photoURL: `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(
        name,
      )}`,
      favorites: [],
      createdAt: serverTimestamp() as any, // avoid type mismatch
    };

    await setDoc(doc(collection(firestore, 'users'), user.uid), newUser);

    // ✅ return juga user-nya
    return { success: true, user: newUser };
  } catch (error) {
    const e = error as FirebaseAuthTypes.NativeFirebaseAuthError;
    return { success: false, error: parseAuthError(e) };
  }
};

// 🔹 Fungsi Logout
export const logout = async () => {
  try {
    const auth = getAuth();
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

// 🔹 Fungsi Get User (gabung data Auth + Firestore)
export const getUser = async (): Promise<AppUser | null> => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  const firestore = getFirestore();
  const userDoc = await getDoc(doc(collection(firestore, 'users'), currentUser.uid));

  const data = userDoc.exists()
    ? (userDoc.data() as AppUser | undefined)
    : undefined;

  return {
    uid: currentUser.uid,
    name: currentUser.displayName || data?.name || 'Guest',
    email: currentUser.email || data?.email || '',
    photoURL: currentUser.photoURL || data?.photoURL,
    createdAt: data?.createdAt,
    favorites: data?.favorites || [],
  };
};

// 🔹 Fungsi Update Photo URL
export const updatePhotoURL = async (imageUri: string): Promise<{ success: boolean; photoURL?: string; error?: string }> => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    // Upload image to Cloudinary
    const cloudinaryUrl = await uploadImageToCloudinary(imageUri);

    // Update Firebase Auth profile
    await updateProfile(currentUser, { photoURL: cloudinaryUrl });

    // Update Firestore user document
    const firestore = getFirestore();
    await updateDoc(doc(collection(firestore, 'users'), currentUser.uid), {
      photoURL: cloudinaryUrl,
      lastActive: serverTimestamp(),
    });

    return { success: true, photoURL: cloudinaryUrl };
  } catch (error) {
    console.error('Update photo URL error:', error);
    return { success: false, error: (error as Error).message };
  }
};

// 🔹 Parsing Error
const parseAuthError = (
  error: FirebaseAuthTypes.NativeFirebaseAuthError,
): AuthError => {
  let message = '';
  switch (error.code) {
    case 'auth/email-already-in-use':
      message = 'Email sudah digunakan 💌';
      break;
    case 'auth/invalid-email':
      message = 'Email tidak valid ✉️';
      break;
    case 'auth/user-not-found':
      message = 'Email tidak terdaftar 🕵️‍♀️';
      break;
    case 'auth/wrong-password':
      message = 'Password salah 🔑';
      break;
    case 'auth/weak-password':
      message = 'Password terlalu lemah 🔒 (min 6 karakter)';
      break;
    default:
      message = error.message;
  }
  return { code: error.code, message };
};
