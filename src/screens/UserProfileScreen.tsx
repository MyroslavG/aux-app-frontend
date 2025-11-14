import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { api } from '../services/api';
import { UserWithStats, Post } from '../types/api';
import { useAuth } from '../context/AuthContext';

interface UserProfileScreenProps {
  route: any;
  navigation: any;
}

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ route, navigation }) => {
  const { username } = route?.params || {};
  const { user: currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserWithStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (username) {
      loadUserProfile();
    }
  }, [username]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (username) {
        loadUserProfile();
      }
    }, [username])
  );

  const loadUserProfile = async () => {
    if (!username) return;

    try {
      setError(null);
      const profileData = await api.getUserProfile(username);
      setUserProfile(profileData);

      // Fetch posts specifically for this user
      const postsData = await api.getUserPosts(username);
      setPosts(postsData.items || postsData);
    } catch (err: any) {
      console.error('Failed to load profile:', err);
      setError(err.response?.data?.detail || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!userProfile) return;

    setFollowLoading(true);
    try {
      if (userProfile.is_following) {
        await api.unfollowUser(username);
        setUserProfile({
          ...userProfile,
          is_following: false,
          followers_count: userProfile.followers_count - 1
        });
      } else {
        await api.followUser(username);
        setUserProfile({
          ...userProfile,
          is_following: true,
          followers_count: userProfile.followers_count + 1
        });
      }
    } catch (error: any) {
      console.error('Failed to toggle follow:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error || !userProfile) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.black} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.primary} />
          <Text style={styles.errorText}>{error || 'User not found'}</Text>
        </View>
      </View>
    );
  }

  const isOwnProfile = currentUser?.id === userProfile.id;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.coverImage} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {userProfile.profile_image_url ? (
            <Image source={{ uri: userProfile.profile_image_url }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userProfile.display_name?.charAt(0).toUpperCase() || userProfile.username?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {!isOwnProfile && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.followButton,
                userProfile.is_following && styles.followingButton
              ]}
              onPress={handleFollowToggle}
              disabled={followLoading}
            >
              {followLoading ? (
                <ActivityIndicator size="small" color={userProfile.is_following ? Colors.black : Colors.white} />
              ) : (
                <Text style={[
                  styles.followButtonText,
                  userProfile.is_following && styles.followingButtonText
                ]}>
                  {userProfile.is_following ? 'Following' : 'Follow'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.name}>{userProfile.display_name || userProfile.username}</Text>
        <Text style={styles.handle}>@{userProfile.username}</Text>

        {userProfile.bio && <Text style={styles.bio}>{userProfile.bio}</Text>}

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{posts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => navigation.navigate('Followers', { username: userProfile.username })}
          >
            <Text style={styles.statValue}>{userProfile.followers_count}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => navigation.navigate('Following', { username: userProfile.username })}
          >
            <Text style={styles.statValue}>{userProfile.following_count}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
        </View>

        {posts.length > 0 ? (
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
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="musical-notes-outline" size={64} color={Colors.mediumGray} />
            <Text style={styles.emptyStateText}>No posts yet</Text>
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
  coverImage: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.lightGray,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
    marginRight: 10,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileSection: {
    paddingHorizontal: 20,
    marginTop: -50,
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
    borderWidth: 4,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: Colors.white,
  },
  avatarText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: Colors.white,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    marginBottom: 20,
  },
  followButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 24,
    minWidth: 120,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.mediumGray,
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  followingButtonText: {
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
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    color: Colors.primary,
    marginTop: 15,
    textAlign: 'center',
  },
});
