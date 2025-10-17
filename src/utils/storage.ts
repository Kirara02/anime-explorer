import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Generic storage utilities for React Native AsyncStorage
 */

const STORAGE_KEYS = {
  THEME_MODE: '@theme_mode',
  USER_PREFERENCES: '@user_preferences',
  APP_SETTINGS: '@app_settings',
} as const;

/**
 * Store data in AsyncStorage
 */
export const storeData = async (key: string, value: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error('Error storing data:', error);
    throw error;
  }
};

/**
 * Retrieve data from AsyncStorage
 */
export const getData = async <T = any>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error retrieving data:', error);
    return null;
  }
};

/**
 * Remove data from AsyncStorage
 */
export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing data:', error);
    throw error;
  }
};

/**
 * Clear all AsyncStorage data
 */
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};

/**
 * Get all keys from AsyncStorage
 */
export const getAllKeys = async (): Promise<readonly string[]> => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error('Error getting keys:', error);
    return [];
  }
};

/**
 * Theme-specific storage functions
 */
export const ThemeStorage = {
  setThemeMode: (mode: 'light' | 'dark' | 'system') =>
    storeData(STORAGE_KEYS.THEME_MODE, mode),

  getThemeMode: (): Promise<'light' | 'dark' | 'system' | null> =>
    getData<'light' | 'dark' | 'system'>(STORAGE_KEYS.THEME_MODE),

  removeThemeMode: () => removeData(STORAGE_KEYS.THEME_MODE),
};

/**
 * User preferences storage
 */
export const UserPreferencesStorage = {
  set: (preferences: Record<string, any>) =>
    storeData(STORAGE_KEYS.USER_PREFERENCES, preferences),

  get: (): Promise<Record<string, any> | null> =>
    getData<Record<string, any>>(STORAGE_KEYS.USER_PREFERENCES),

  remove: () => removeData(STORAGE_KEYS.USER_PREFERENCES),
};

/**
 * App settings storage
 */
export const AppSettingsStorage = {
  set: (settings: Record<string, any>) =>
    storeData(STORAGE_KEYS.APP_SETTINGS, settings),

  get: (): Promise<Record<string, any> | null> =>
    getData<Record<string, any>>(STORAGE_KEYS.APP_SETTINGS),

  remove: () => removeData(STORAGE_KEYS.APP_SETTINGS),
};
