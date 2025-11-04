import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface DiscoverScreenProps {
  navigation: any;
}

const mockGenres = [
  { id: '1', name: '#Electronic', followers: '1.1M Followers', tracks: '100 Tracks' },
  { id: '2', name: 'Rock', followers: '976K Followers', tracks: '75 Tracks' },
];

const mockUsers = [
  { id: '1', name: 'Olivia Wilson', handle: 'olivia_wilson' },
  { id: '2', name: 'Emma Jones', handle: 'emma_jones' },
  { id: '3', name: 'Cameron Blake', handle: 'cameron_blake' },
];

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.darkGray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Users, #Hashtags"
          placeholderTextColor={Colors.darkGray}
        />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.genresGrid}>
            {mockGenres.map((genre) => (
              <View key={genre.id} style={styles.genreCard}>
                <View style={styles.genreGradient} />
                <View style={styles.genreInfo}>
                  <Text style={styles.genreName}>{genre.name}</Text>
                  <Text style={styles.genreStats}>{genre.followers}</Text>
                  <Text style={styles.genreStats}>{genre.tracks}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>USERS</Text>
          {mockUsers.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={styles.userItem}
              onPress={() => navigation.navigate('UserProfile', { userName: user.name })}
            >
              <View style={styles.userAvatar} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userHandle}>@{user.handle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: Colors.black,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.darkGray,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  genresGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 15,
  },
  genreCard: {
    flex: 1,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
  },
  genreGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
  },
  genreInfo: {
    flex: 1,
    padding: 15,
    justifyContent: 'flex-end',
  },
  genreName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 8,
  },
  genreStats: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.9,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.lightGray,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 14,
    color: Colors.darkGray,
  },
});
