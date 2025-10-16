import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import firestore from '@react-native-firebase/firestore';
import type { Theme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { useAuthStore } from '../../store';
import { useTheme } from '../../theme/ThemeContext';

export default function ProfileScreen() {
  const { user, logoutUser, updateUserPhoto } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const { theme, toggleTheme, themeMode } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logoutUser();
      Alert.alert('Success 🌸', 'You have successfully logged out.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    Alert.alert(
      'Change Profile Photo',
      'Choose an option to update your profile picture',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Camera',
          onPress: handleTakePhoto,
        },
        {
          text: 'Gallery',
          onPress: handleChooseFromGallery,
        },
      ],
    );
  };

  const handleTakePhoto = () => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.8 as any,
      includeBase64: false,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    launchCamera(options, handleImagePickerResponse);
  };

  const handleChooseFromGallery = () => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.8 as any,
      includeBase64: false,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    launchImageLibrary(options, handleImagePickerResponse);
  };

  const handleImagePickerResponse = async (response: any) => {
    if (response.didCancel) {
      return;
    }

    if (response.errorMessage) {
      Alert.alert('Error', response.errorMessage);
      return;
    }

    if (response.assets && response.assets[0]) {
      const imageUri = response.assets[0].uri;
      if (imageUri) {
        await handleUploadPhoto(imageUri);
      }
    }
  };

  const handleUploadPhoto = async (imageUri: string) => {
    try {
      setUploadingPhoto(true);
      const result = await updateUserPhoto(imageUri);

      if (result.success) {
        Alert.alert('Success 🎉', 'Profile photo updated successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile photo');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleThemeSelect = (selectedTheme: 'light' | 'dark' | 'system') => {
    // This will be handled by the theme context
    setThemeModalVisible(false);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              if (user?.uid) {
                await firestore().collection('users').doc(user.uid).delete();
              }
              await logoutUser();
              Alert.alert(
                'Deleted',
                'Your account has been removed successfully.',
              );
            } catch (error: any) {
              Alert.alert('Error', error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.text}>No user data available 😅</Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  user.photoURL ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.name || 'Anonymous',
                  )}&background=random&color=fff&size=256&format=png`,
              }}
              style={styles.avatar}
            />
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={handleEditProfile}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="camera" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{user.name || 'Anonymous Otaku'}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        {/* Menu Options */}
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setThemeModalVisible(true)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons
                name={
                  themeMode === 'dark'
                    ? 'moon'
                    : themeMode === 'light'
                    ? 'sunny'
                    : 'phone-portrait'
                }
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.menuItemText}>Theme</Text>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuItemValue}>
                {themeMode === 'dark' ? 'Dark' : 'Light'}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.text + '66'}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogout}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="log-out-outline" size={24} color="#ff4d4d" />
              <Text style={[styles.menuItemText, { color: '#ff4d4d' }]}>
                Logout
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.text + '66'}
            />
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>

      {/* Theme Selection Modal */}
      <Modal
        visible={themeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setThemeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Theme</Text>

            <TouchableOpacity
              style={[
                styles.themeOption,
                themeMode === 'light' && styles.selectedTheme,
              ]}
              onPress={() => {
                if (themeMode !== 'light') {
                  toggleTheme();
                }
                setThemeModalVisible(false);
              }}
            >
              <Ionicons name="sunny" size={24} color="#FFD700" />
              <Text style={styles.themeOptionText}>Light</Text>
              {themeMode === 'light' && (
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={theme.colors.primary}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                themeMode === 'dark' && styles.selectedTheme,
              ]}
              onPress={() => {
                if (themeMode !== 'dark') {
                  toggleTheme();
                }
                setThemeModalVisible(false);
              }}
            >
              <Ionicons name="moon" size={24} color="#BB86FC" />
              <Text style={styles.themeOptionText}>Dark</Text>
              {themeMode === 'dark' && (
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={theme.colors.primary}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setThemeModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      padding: 20,
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: 16,
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 3,
      borderColor: theme.colors.primary,
    },
    editAvatarButton: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.primary,
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
      color: theme.colors.text,
    },
    email: {
      fontSize: 16,
      color: theme.colors.text + '99',
    },
    menuContainer: {
      marginTop: 20,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.card,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    menuItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    menuItemRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    menuItemText: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: '500',
    },
    menuItemValue: {
      fontSize: 14,
      color: theme.colors.text + '99',
    },
    logoutItem: {
      marginTop: 20,
    },
    version: {
      textAlign: 'center',
      color: theme.colors.text + '80',
      fontSize: 14,
      marginTop: 40,
      marginBottom: 20,
    },
    text: {
      fontSize: 16,
      color: theme.colors.text + '99',
      textAlign: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      paddingBottom: 40,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 20,
    },
    themeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: theme.colors.background,
      gap: 12,
    },
    selectedTheme: {
      backgroundColor: theme.colors.primary + '20',
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    themeOptionText: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: '500',
    },
    cancelButton: {
      marginTop: 10,
      padding: 16,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: 16,
      color: theme.colors.text + '99',
      fontWeight: '500',
    },
  });
