import React, { useMemo, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import SearchModal from './SearchModal';
import { useAuthStore } from '../store/auth_store';

export default function HomeHeader({
  onSelectAnime,
}: {
  onSelectAnime: (id: number) => void;
}) {
  const { user } = useAuthStore();
  const [modalVisible, setModalVisible] = useState(false);

  // const avatarUrl = useMemo(() => {
  //   if (user?.photoURL) return user.photoURL;
  //   return `https://ui-avatars.com/api/?name=Kirara&background=0D8ABC&color=fff&size=128&format=png`;
  // }, [user?.photoURL, user?.name]);

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Image
          source={{
            uri: user?.photoURL,
          }}
          style={styles.avatar}
          onError={e => console.error(e)}
        />

        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.username}>{user?.name || 'Guest'}</Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Ionicons name="search-outline" size={24} color="#00b4d8" />
      </TouchableOpacity>

      <SearchModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={anime => onSelectAnime(anime.mal_id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 50,
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: '#1a1a1a', // background gelap untuk loading state
  },
  avatarShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  greeting: { color: '#aaa', fontSize: 14 },
  username: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
