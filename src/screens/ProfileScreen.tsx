import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Post, UserWithStats } from '../types/api';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserWithStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadUserProfile();
      }
    }, [user])
  );

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      setError(null);
      const [profileData, feedData] = await Promise.all([
        api.getUserProfile(user.username),
        api.getFeed(50, 0) // Get all posts, then filter by current user
      ]);

      setUserStats(profileData);
      // Filter posts by current user
      const userPosts = (feedData.items || feedData).filter(
        (post: Post) => post.user_id === user.id
      );
      setPosts(userPosts);
    } catch (err: any) {
      console.error('Failed to load profile:', err);
      setError(err.response?.data?.detail || 'Failed to load profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUserProfile();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary]}
        />
      }
    >
      <View style={styles.header}>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={24} color={Colors.primary} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {user?.profile_image_url ? (
            <Image source={{ uri: user.profile_image_url }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.display_name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <Text style={styles.name}>{user?.display_name || user?.username}</Text>
        <Text style={styles.handle}>@{user?.username}</Text>

        {user?.bio && <Text style={styles.bio}>{user.bio}</Text>}

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{posts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => navigation.navigate('Followers', { username: user?.username })}
          >
            <Text style={styles.statValue}>{userStats?.followers_count || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => navigation.navigate('Following', { username: user?.username })}
          >
            <Text style={styles.statValue}>{userStats?.following_count || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Text style={styles.tabText}>My Posts</Text>
          </TouchableOpacity>
        </View>

        {posts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="musical-notes-outline" size={64} color={Colors.mediumGray} />
            <Text style={styles.emptyStateText}>No posts yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Share your first song to get started
            </Text>
          </View>
        ) : (
          <View style={styles.postsGrid}>
            {posts.map((post) => (
              <TouchableOpacity
                key={post.id}
                style={styles.postItem}
                onPress={() => navigation.navigate('PostDetail', { post })}
              >
                <View style={styles.postImage}>
                  {post.album_art_url ? (
                    <Image source={{ uri: post.album_art_url }} style={styles.albumArt} />
                  ) : (
                    <View style={styles.albumArtPlaceholder}>
                      <Ionicons name="musical-note" size={48} color={Colors.white} />
                    </View>
                  )}
                  <View style={styles.playButton}>
                    <Ionicons name="play" size={24} color={Colors.white} />
                  </View>
                </View>
                <View style={styles.postInfo}>
                  <Text style={styles.postTrack} numberOfLines={1}>
                    {post.track_name}
                  </Text>
                  <Text style={styles.postArtist} numberOfLines={1}>
                    {post.artist_name}
                  </Text>
                  {post.caption && (
                    <Text style={styles.postCaption} numberOfLines={2}>
                      {post.caption}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
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
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
  },
  menuButton: {
    width: 40,
    height: 40,
  },
  errorContainer: {
    backgroundColor: '#FFE8EF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 15,
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
  profileSection: {
    paddingHorizontal: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: Colors.white,
  },
  editButton: {
    alignSelf: 'center',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.mediumGray,
    marginBottom: 20,
  },
  editButtonText: {
    fontSize: 14,
    color: Colors.black,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 4,
  },
  handle: {
    fontSize: 14,
    color: Colors.darkGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  bio: {
    fontSize: 14,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 20,
  },
  location: {
    fontSize: 14,
    color: Colors.darkGray,
    textAlign: 'center',
    marginBottom: 25,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.lightGray,
    marginBottom: 25,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.darkGray,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.black,
  },
  tabText: {
    fontSize: 14,
    color: Colors.black,
  },
  postsGrid: {
    marginTop: 10,
  },
  postItem: {
    marginBottom: 20,
  },
  postImage: {
    width: '100%',
    height: 250,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  albumArt: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  albumArtPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  postInfo: {
    paddingHorizontal: 5,
  },
  postTrack: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
  },
  postArtist: {
    fontSize: 14,
    color: Colors.darkGray,
    marginBottom: 4,
  },
  postCaption: {
    fontSize: 13,
    color: Colors.darkGray,
    lineHeight: 18,
  },
  signOutButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 30,
    borderWidth: 1,
    borderColor: Colors.mediumGray,
    alignSelf: 'center',
    marginBottom: 40,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
  },
});
