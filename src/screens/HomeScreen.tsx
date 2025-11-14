import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image, Linking, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { api } from '../services/api';
import { Post } from '../types/api';

interface HomeScreenProps {
  navigation: any;
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 95;
const POST_HEIGHT = SCREEN_HEIGHT - HEADER_HEIGHT;

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadFeed();
    loadUnreadCount();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFeed();
      loadUnreadCount();
    }, [])
  );

  const loadUnreadCount = async () => {
    try {
      const data = await api.getUnreadCount();
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  };

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

  const handlePlayOnSpotify = async (post: Post) => {
    if (!post?.spotify_track_id) return;

    // Construct Spotify URI from track ID if URI is not available
    const spotifyUri = post.spotify_uri || `spotify:track:${post.spotify_track_id}`;
    const spotifyWebUrl = `https://open.spotify.com/track/${post.spotify_track_id}`;

    try {
      // Try to open in Spotify app first
      const canOpen = await Linking.canOpenURL(spotifyUri);
      if (canOpen) {
        await Linking.openURL(spotifyUri);
      } else {
        // Fallback to web URL if Spotify app is not installed
        await Linking.openURL(spotifyWebUrl);
      }
    } catch (error) {
      console.error('Failed to open Spotify:', error);
      Alert.alert(
        'Cannot Open Spotify',
        'Please make sure you have Spotify installed or try again later.'
      );
    }
  };

  const renderPost = ({ item: post, index }: { item: Post; index: number }) => {
    if (!post || !post.user) return null;

    return (
      <View style={styles.postContainer}>
        {/* Album Art Background (full screen) */}
        <View style={styles.albumArtContainer}>
          {post.album_art_url ? (
            <Image source={{ uri: post.album_art_url }} style={styles.fullScreenAlbumArt} blurRadius={50} />
          ) : (
            <View style={styles.fullScreenAlbumArtPlaceholder}>
              <Ionicons name="musical-note" size={100} color={Colors.white} />
            </View>
          )}
          {/* Dark overlay for readability */}
          <View style={styles.darkOverlay} />
        </View>

        {/* Main Album Art (centered) */}
        <View style={styles.centerContent}>
          <TouchableOpacity
            style={styles.albumArtCard}
            activeOpacity={0.9}
            onPress={() => handlePlayOnSpotify(post)}
          >
            {post.album_art_url ? (
              <Image source={{ uri: post.album_art_url }} style={styles.albumArtMain} />
            ) : (
              <View style={styles.albumArtMainPlaceholder}>
                <Ionicons name="musical-note" size={80} color={Colors.white} />
              </View>
            )}
            {/* Play button overlay */}
            <View style={styles.playButtonOverlay}>
              <Ionicons name="play-circle" size={64} color={Colors.white} />
            </View>
          </TouchableOpacity>

          {/* Track Info */}
          <View style={styles.trackInfo}>
            <Text style={styles.trackName} numberOfLines={2}>
              {post.track_name}
            </Text>
            <Text style={styles.artistName} numberOfLines={1}>
              {post.artist_name}
            </Text>
          </View>
        </View>

        {/* Bottom User Info & Caption */}
        <View style={styles.bottomInfo}>
          <TouchableOpacity
            style={styles.userInfoRow}
            onPress={() => navigation.navigate('UserProfile', { username: post.user.username })}
          >
            {post.user.profile_image_url ? (
              <Image source={{ uri: post.user.profile_image_url }} style={styles.userAvatar} />
            ) : (
              <View style={styles.userAvatarPlaceholder}>
                <Text style={styles.userAvatarText}>
                  {post.user.display_name?.charAt(0).toUpperCase() || post.user.username?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.userTextInfo}>
              <Text style={styles.displayName}>{post.user.display_name || post.user.username}</Text>
              <Text style={styles.username}>@{post.user.username} · {formatTimeAgo(post.created_at)}</Text>
            </View>
          </TouchableOpacity>

          {post.caption && (
            <TouchableOpacity onPress={() => navigation.navigate('PostDetail', { post })}>
              <Text style={styles.caption} numberOfLines={3}>
                {post.caption}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContentLoading]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContentLoading]}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.primary} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadFeed} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!loading && posts.length === 0) {
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
            onPress={() => {
              navigation.navigate('Notifications');
              setUnreadCount(0);
            }}
          >
            <Ionicons name="notifications-outline" size={24} color={Colors.black} />
            {unreadCount > 0 && <View style={styles.badge} />}
          </TouchableOpacity>
        </View>

        {/* Empty State */}
        <View style={styles.centerContentLoading}>
          <Ionicons name="musical-notes-outline" size={64} color={Colors.mediumGray} />
          <Text style={styles.emptyStateText}>No posts yet</Text>
          <Text style={styles.emptyStateSubtext}>Follow some users to see their posts</Text>
        </View>
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
          onPress={() => {
            navigation.navigate('Notifications');
            setUnreadCount(0);
          }}
        >
          <Ionicons name="notifications-outline" size={24} color={Colors.black} />
          {unreadCount > 0 && <View style={styles.badge} />}
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={POST_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onRefresh={onRefresh}
        refreshing={refreshing}
        removeClippedSubviews={false}
        onViewableItemsChanged={({ viewableItems }) => {
          if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index || 0);
          }
        }}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        getItemLayout={(data, index) => ({
          length: POST_HEIGHT,
          offset: POST_HEIGHT * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  centerContentLoading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  postContainer: {
    width: SCREEN_WIDTH,
    height: POST_HEIGHT,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    // backdropFilter: 'blur(10px)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 36,
    height: 36,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 22,
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
  // Background album art (blurred)
  albumArtContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: POST_HEIGHT,
    top: 0,
    left: 0,
  },
  fullScreenAlbumArt: {
    width: '100%',
    height: '100%',
  },
  fullScreenAlbumArtPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  // Center content
  centerContent: {
    position: 'absolute',
    top: '15%',
    left: 0,
    right: 0,
    // transform: [{ translateY: -50 }],
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  albumArtCard: {
    width: SCREEN_WIDTH * 0.75,
    height: SCREEN_WIDTH * 0.75,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
  },
  albumArtMain: {
    width: '100%',
    height: '100%',
  },
  albumArtMainPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -32 }, { translateY: -32 }],
  },
  trackInfo: {
    marginTop: 25,
    alignItems: 'center',
    width: '100%',
  },
  trackName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  artistName: {
    fontSize: 18,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  // Bottom info
  bottomInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 120,
    paddingTop: 20,
    backgroundColor: 'transparent',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  userAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  userTextInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  username: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  caption: {
    fontSize: 15,
    color: Colors.white,
    lineHeight: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  postIndicator: {
    alignItems: 'center',
    marginTop: 15,
  },
  postIndicatorText: {
    fontSize: 13,
    color: Colors.white,
    opacity: 0.7,
    fontWeight: '600',
  },
  // Error and empty states
  errorText: {
    fontSize: 16,
    color: Colors.white,
    marginTop: 15,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 25,
    marginTop: 20,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.black,
    marginTop: 15,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: Colors.darkGray,
    textAlign: 'center',
  },
});
