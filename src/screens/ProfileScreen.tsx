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
  useColorScheme,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import firestore from '@react-native-firebase/firestore';
import { useAuthStore } from '../store/auth_store';
import { DarkAppTheme, LightTheme } from '../theme/theme';
import type { Theme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, logoutUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkAppTheme : LightTheme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const stats = {
    favoriteCount: user?.favorites?.length || 0,
    joinedDate: user?.createdAt
      ? new Date(user.createdAt.toDate()).toLocaleDateString()
      : 'Unknown',
    lastActive: 'Today',
  };

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
      'Coming Soon 🎨',
      'Edit profile feature will be available soon!',
    );
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
        {/* Header Section */}
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
            >
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{user.name || 'Anonymous Otaku'}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={24} color="#ff4d6d" />
            <Text style={styles.statValue}>{stats.favoriteCount}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="calendar" size={24} color="#00b4d8" />
            <Text style={styles.statValue}>{stats.joinedDate}</Text>
            <Text style={styles.statLabel}>Joined</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>{stats.lastActive}</Text>
            <Text style={styles.statLabel}>Last Active</Text>
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleEditProfile}
          >
            <Ionicons name="create-outline" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#2c2c2c' }]}
            onPress={() =>
              Alert.alert(
                'Coming Soon 🎮',
                'This feature will be available soon!',
              )
            }
          >
            <Ionicons name="settings-outline" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteAccount}
          >
            <Ionicons name="trash-outline" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
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
      marginBottom: 30,
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: 16,
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 2,
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
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 30,
      paddingHorizontal: 20,
    },
    statItem: {
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      padding: 16,
      borderRadius: 12,
      minWidth: 100,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 3,
    },
    statValue: {
      fontSize: 18,
      fontWeight: 'bold',
      marginVertical: 4,
      color: theme.colors.text,
    },
    statLabel: {
      fontSize: 14,
      color: theme.colors.text + '99',
    },
    actionsContainer: {
      gap: 12,
      marginBottom: 30,
    },
    actionButton: {
      backgroundColor: theme.colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    actionButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    logoutButton: {
      backgroundColor: '#f43f5e',
    },
    deleteButton: {
      backgroundColor: '#dc2626',
    },
    version: {
      textAlign: 'center',
      color: theme.colors.text + '80',
      fontSize: 14,
      marginBottom: 20,
    },
    text: {
      fontSize: 16,
      color: theme.colors.text + '99',
      textAlign: 'center',
    },
  });
