import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { api } from '../services/api';
import { UserWithStats } from '../types/api';
import { useAuth } from '../context/AuthContext';

interface FollowersScreenProps {
  route: any;
  navigation: any;
}

export const FollowersScreen: React.FC<FollowersScreenProps> = ({ route, navigation }) => {
  const { username } = route?.params || {};
  const { user: currentUser } = useAuth();
  const [followers, setFollowers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFollowers();
  }, [username]);

  const loadFollowers = async () => {
    if (!username) return;

    try {
      setError(null);
      const data = await api.getFollowers(username);
      setFollowers(data.items || data);
    } catch (err: any) {
      console.error('Failed to load followers:', err);
      setError(err.response?.data?.detail || 'Failed to load followers');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (userToToggle: UserWithStats) => {
    try {
      if (userToToggle.is_following) {
        await api.unfollowUser(userToToggle.username);
      } else {
        await api.followUser(userToToggle.username);
      }

      // Update local state
      setFollowers(followers.map(u =>
        u.id === userToToggle.id
          ? { ...u, is_following: !u.is_following }
          : u
      ));
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  const renderFollower = ({ item }: { item: UserWithStats }) => {
    const isCurrentUser = currentUser?.id === item.id;

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => {
          if (isCurrentUser) {
            navigation.navigate('Profile');
          } else {
            navigation.navigate('UserProfile', { username: item.username });
          }
        }}
      >
        <View style={styles.userInfo}>
          {item.profile_image_url ? (
            <Image source={{ uri: item.profile_image_url }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.display_name?.charAt(0).toUpperCase() || item.username?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.userDetails}>
            <Text style={styles.displayName}>{item.display_name || item.username}</Text>
            <Text style={styles.username}>@{item.username}</Text>
            {item.bio && <Text style={styles.bio} numberOfLines={1}>{item.bio}</Text>}
          </View>
        </View>

        {!isCurrentUser && (
          <TouchableOpacity
            style={[styles.followButton, item.is_following && styles.followingButton]}
            onPress={() => handleFollowToggle(item)}
          >
            <Text style={[styles.followButtonText, item.is_following && styles.followingButtonText]}>
              {item.is_following ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Followers</Text>
        <View style={{ width: 24 }} />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={24} color={Colors.primary} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadFollowers} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!error && followers.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color={Colors.mediumGray} />
          <Text style={styles.emptyStateText}>No followers yet</Text>
        </View>
      ) : (
        <FlatList
          data={followers}
          renderItem={renderFollower}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
  },
  errorContainer: {
    backgroundColor: '#FFE8EF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 15,
    marginTop: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  retryButton: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    backgroundColor: Colors.primary,
    borderRadius: 15,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.darkGray,
    marginTop: 15,
  },
  listContent: {
    paddingVertical: 10,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  userDetails: {
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: Colors.darkGray,
    marginBottom: 2,
  },
  bio: {
    fontSize: 13,
    color: Colors.darkGray,
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.primary,
  },
  followingButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.mediumGray,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  followingButtonText: {
    color: Colors.black,
  },
});
