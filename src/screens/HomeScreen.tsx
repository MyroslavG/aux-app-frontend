import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { api } from '../services/api';
import { Post } from '../types/api';

interface HomeScreenProps {
  navigation: any;
}

const mockStories = [
  { id: '0', name: 'Your story', isYours: true },
  { id: '1', name: 'calista33' },
  { id: '2', name: 'azzahrrn' },
  { id: '3', name: 'adamsuseno' },
  { id: '4', name: 'adeliaaa' },
];

const HEADER_HEIGHT = 95;

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setError(null);
      const feedData = await api.getFeed(20, 0);
      setPosts(feedData.items || feedData);
    } catch (err: any) {
      console.error('Failed to load feed:', err);
      setError(err.response?.data?.detail || 'Failed to load feed');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFeed();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
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
      {/* Sticky Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>///.</Text>
          </View>
          <Text style={styles.appName}>AUX</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color={Colors.black} />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Stories */}
        {/* <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesContainer}>
          {mockStories.map((story) => (
            <View key={story.id} style={styles.storyItem}>
              <View style={[styles.storyCircle, story.isYours && styles.yourStory]}>
                <View style={styles.storyAvatar}>
                  {story.isYours && (
                    <View style={styles.addStoryButton}>
                      <Ionicons name="add" size={16} color={Colors.white} />
                    </View>
                  )}
                </View>
              </View>
              <Text style={styles.storyName}>{story.name}</Text>
            </View>
          ))}
        </ScrollView> */}

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={24} color={Colors.primary} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadFeed} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Posts */}
        {posts.map((post: Post) => {
          if (!post || !post.user) return null;

          return (
          <View key={post.id} style={styles.post}>
            <View style={styles.postHeader}>
              <TouchableOpacity
                style={styles.postUser}
                onPress={() => navigation.navigate('UserProfile', { username: post.user.username })}
              >
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {post.user.display_name?.charAt(0).toUpperCase() || post.user.username?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.userName}>{post.user.display_name}</Text>
                  <View style={styles.postMeta}>
                    <Text style={styles.location}>@{post.user.username}</Text>
                    <Text style={styles.dot}> · </Text>
                    <Text style={styles.time}>{formatTimeAgo(post.created_at)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.postImage}
              onPress={() => navigation.navigate('PostDetail', { post })}
            >
              {post.album_art_url ? (
                <Image source={{ uri: post.album_art_url }} style={styles.albumArt} />
              ) : (
                <View style={styles.albumArtPlaceholder}>
                  <Ionicons name="musical-note" size={64} color={Colors.white} />
                </View>
              )}
              <View style={styles.overlay}>
                <Text style={styles.songTitle}>{post.track_name}</Text>
                <Text style={styles.artistName}>{post.artist_name}</Text>
              </View>
              <View style={styles.playButton}>
                <Ionicons name="play" size={32} color={Colors.primary} />
              </View>
            </TouchableOpacity>

            {post.caption && (
              <View style={styles.captionContainer}>
                <Text style={styles.captionText}>
                  <Text style={styles.captionUsername}>{post.user.username} </Text>
                  {post.caption}
                </Text>
              </View>
            )}
          </View>
          );
        })}

        {/* Empty State */}
        {!loading && !error && posts.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="musical-notes-outline" size={64} color={Colors.mediumGray} />
            <Text style={styles.emptyStateText}>No posts yet</Text>
            <Text style={styles.emptyStateSubtext}>Follow some users to see their posts</Text>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingTop: 45,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    zIndex: 1000,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: HEADER_HEIGHT + 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.black,
  },
  notificationButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  storiesContainer: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  storyItem: {
    marginRight: 15,
    alignItems: 'center',
  },
  storyCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: Colors.primary,
    padding: 3,
    marginBottom: 5,
  },
  yourStory: {
    borderColor: Colors.mediumGray,
  },
  storyAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    backgroundColor: Colors.lightGray,
    position: 'relative',
  },
  addStoryButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  storyName: {
    fontSize: 12,
    color: Colors.black,
  },
  errorContainer: {
    backgroundColor: '#FFE8EF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 15,
    marginBottom: 20,
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
  post: {
    marginBottom: 20,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 12,
  },
  postUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.black,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  location: {
    fontSize: 12,
    color: Colors.darkGray,
  },
  dot: {
    fontSize: 12,
    color: Colors.darkGray,
  },
  time: {
    fontSize: 12,
    color: Colors.darkGray,
  },
  postImage: {
    width: '100%',
    height: 380,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
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
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  songTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 4,
  },
  artistName: {
    fontSize: 14,
    color: Colors.white,
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  captionContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  captionText: {
    fontSize: 14,
    color: Colors.black,
    lineHeight: 20,
  },
  captionUsername: {
    fontWeight: '600',
    color: Colors.black,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 8,
  },
  actionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
});
