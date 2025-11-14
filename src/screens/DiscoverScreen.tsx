import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { api } from '../services/api';

interface DiscoverScreenProps {
  navigation: any;
}

interface UserSearchResult {
  id: string;
  username: string;
  display_name: string;
  profile_image_url?: string;
  is_following: boolean;
}

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Perform search automatically when searchText changes
  useEffect(() => {
    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // If search text is empty, clear results
    if (!searchText.trim()) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    // Set loading state immediately
    setLoading(true);

    // Debounce the search by 500ms
    debounceTimeout.current = setTimeout(async () => {
      try {
        const results = await api.searchUsers(searchText.trim());
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    // Cleanup function
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchText]);

  const handleUserPress = (username: string) => {
    navigation.navigate('UserProfile', { username });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.darkGray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Users"
          placeholderTextColor={Colors.darkGray}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => {
            setSearchText('');
            setSearchResults([]);
          }}>
            <Ionicons name="close-circle" size={20} color={Colors.darkGray} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : searchResults.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>USERS</Text>
            {searchResults.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.userItem}
                onPress={() => handleUserPress(user.username)}
              >
                {user.profile_image_url ? (
                  <Image source={{ uri: user.profile_image_url }} style={styles.userAvatarImage} />
                ) : (
                  <View style={styles.userAvatar}>
                    <Text style={styles.avatarText}>
                      {user.display_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.display_name}</Text>
                  <Text style={styles.userHandle}>@{user.username}</Text>
                </View>
                {user.is_following && (
                  <View style={styles.followingBadge}>
                    <Text style={styles.followingBadgeText}>Following</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={64} color={Colors.mediumGray} />
                <Text style={styles.emptyStateText}>Search for users</Text>
                <Text style={styles.emptyStateSubtext}>
                  Find people by their username or display name
                </Text>
              </View>
            </View>
          </>
        )}
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
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  userAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
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
  followingBadge: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  followingBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.darkGray,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.darkGray,
    marginTop: 15,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    marginTop: 15,
    marginBottom: 5,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.darkGray,
    textAlign: 'center',
  },
});
