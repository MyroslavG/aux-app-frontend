import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { api } from '../services/api';

interface SearchScreenProps {
  navigation: any;
}

interface UserSearchResult {
  id: string;
  username: string;
  display_name: string;
  profile_image_url?: string;
  is_following: boolean;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchText.trim()) return;

    setLoading(true);
    try {
      const results = await api.searchUsers(searchText.trim());
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = (username: string) => {
    navigation.navigate('UserProfile', { username });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.darkGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users"
            placeholderTextColor={Colors.darkGray}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color={Colors.darkGray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.resultsList}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : searchResults.length > 0 ? (
          searchResults.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={styles.resultItem}
              onPress={() => handleUserPress(user.username)}
            >
              <View style={styles.resultLeft}>
                <View style={styles.userAvatar}>
                  <Text style={styles.avatarText}>
                    {user.display_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName}>{user.display_name}</Text>
                  <Text style={styles.resultMeta}>@{user.username}</Text>
                </View>
              </View>
              {user.is_following && (
                <View style={styles.followingBadge}>
                  <Text style={styles.followingBadgeText}>Following</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : searchText.trim() !== '' && !loading ? (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color={Colors.mediumGray} />
            <Text style={styles.emptyStateText}>No users found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try searching with a different username
            </Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={Colors.mediumGray} />
            <Text style={styles.emptyStateText}>Search for users</Text>
            <Text style={styles.emptyStateSubtext}>
              Find people by their username or display name
            </Text>
          </View>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    marginLeft: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: Colors.black,
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  resultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  genreIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  genreIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.black,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
  },
  resultMeta: {
    fontSize: 14,
    color: Colors.darkGray,
    marginTop: 2,
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
