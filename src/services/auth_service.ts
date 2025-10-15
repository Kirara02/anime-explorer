import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

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
    const userCred = await auth().signInWithEmailAndPassword(email, password);

    // 🔹 Ambil data user dari Firestore
    const doc = await firestore()
      .collection('users')
      .doc(userCred.user.uid)
      .get();
    const data = doc.data();

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
// 🔹 Fungsi Signup
export const signup = async (name: string, email: string, password: string) => {
  try {
    const { user } = await auth().createUserWithEmailAndPassword(
      email.trim(),
      password,
    );

    await user.updateProfile({ displayName: name });

    const newUser: AppUser = {
      uid: user.uid,
      name,
      email: user.email || '',
      photoURL: `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(
        name,
      )}`,
      favorites: [],
      createdAt: firestore.FieldValue.serverTimestamp() as any, // avoid type mismatch
    };

    await firestore().collection('users').doc(user.uid).set(newUser);

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
    await auth().signOut();
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

// 🔹 Fungsi Get User (gabung data Auth + Firestore)
export const getUser = async (): Promise<AppUser | null> => {
  const currentUser = auth().currentUser;
  if (!currentUser) return null;

  const userDoc = await firestore()
    .collection('users')
    .doc(currentUser.uid)
    .get();

  if (!userDoc.exists) {
    return {
      uid: currentUser.uid,
      name: currentUser.displayName || 'Guest',
      email: currentUser.email || '',
      photoURL: currentUser.photoURL || undefined,
    };
  }

  const data = userDoc.data() as AppUser;
  return {
    ...data,
    uid: currentUser.uid,
    email: currentUser.email || data.email,
    photoURL: currentUser.photoURL || data.photoURL,
  };
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
