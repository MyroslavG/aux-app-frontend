import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { api } from '../services/api';
import { Notification } from '../types/api';

interface NotificationsScreenProps {
  navigation: any;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followingStatus, setFollowingStatus] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setError(null);
      const data = await api.getNotifications(50, 0, false);
      const notificationList = Array.isArray(data) ? data : (data.items || []);
      setNotifications(notificationList);

      // Initialize following status from notification data
      const statusMap: { [key: string]: boolean } = {};

      // Fetch following status for all follow notifications
      const followNotifications = notificationList.filter((n: Notification) => n.type === 'follow');

      for (const n of followNotifications) {
        // Use actor data (new format) if available, otherwise try legacy data
        const username = n.actor?.username;
        if (username) {
          try {
            const userProfile = await api.getUserProfile(username);
            statusMap[username] = userProfile.is_following || false;
          } catch (err) {
            console.error(`Failed to fetch profile for ${username}:`, err);
          }
        }
      }

      setFollowingStatus(statusMap);

      // Mark all unread notifications as read after loading
      const unreadIds = notificationList
        .filter((n: Notification) => !n.is_read)
        .map((n: Notification) => n.id);

      if (unreadIds.length > 0) {
        // Mark as read without waiting (fire and forget)
        api.markAsRead(unreadIds).catch(err => {
          console.error('Failed to mark notifications as read:', err);
        });

        // Update local state immediately
        setNotifications(notificationList.map((n: Notification) => ({
          ...n,
          is_read: true,
        })));
      }
    } catch (err: any) {
      console.error('Failed to load notifications:', err);
      setError(err.response?.data?.detail || 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleFollowUser = async (username: string) => {
    try {
      await api.followUser(username);
      // Update local following status
      setFollowingStatus(prev => ({ ...prev, [username]: true }));
      Alert.alert('Success', `You are now following @${username}`);
    } catch (err: any) {
      console.error('Failed to follow user:', err);
      Alert.alert('Error', err.response?.data?.detail || 'Failed to follow user');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getRecentNotifications = () => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return notifications.filter(n => new Date(n.created_at) > oneDayAgo);
  };

  const getOlderNotifications = () => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return notifications.filter(n => new Date(n.created_at) <= oneDayAgo);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  const recentNotifications = getRecentNotifications();
  const olderNotifications = getOlderNotifications();

  const renderNotification = (notif: Notification) => {
    // Use new actor field with current user data
    const actorUsername = notif.actor?.username || 'Unknown';
    const actorDisplayName = notif.actor?.display_name || actorUsername;
    const profileImageUrl = notif.actor?.profile_image_url;
    const postId = notif.data?.post_id;
    const isFollowing = followingStatus[actorUsername] || false;

    return (
      <TouchableOpacity
        key={notif.id}
        style={[styles.notificationItem, !notif.is_read && styles.unreadNotification]}
        onPress={() => {
          if (postId) {
            navigation.navigate('PostDetail', { postId });
          } else {
            navigation.navigate('UserProfile', { username: actorUsername });
          }
        }}
      >
        <View style={styles.avatarContainer}>
          {profileImageUrl ? (
            <Image source={{ uri: profileImageUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {actorDisplayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {notif.type === 'comment' && (
            <View style={styles.iconBadge}>
              <Ionicons name="chatbubble" size={16} color={Colors.white} />
            </View>
          )}
          {notif.type === 'like' && (
            <View style={[styles.iconBadge, styles.likeBadge]}>
              <Ionicons name="heart" size={16} color={Colors.white} />
            </View>
          )}
          {notif.type === 'follow' && (
            <View style={[styles.iconBadge, styles.followBadge]}>
              <Ionicons name="person-add" size={16} color={Colors.white} />
            </View>
          )}
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationText}>
            <Text style={styles.userName}>{actorDisplayName}</Text>
          </Text>
          {notif.body && (
            <Text style={styles.bodyText} numberOfLines={2}>{notif.body}</Text>
          )}
          <Text style={styles.timeText}>{formatTimeAgo(notif.created_at)}</Text>
        </View>
        {notif.type === 'follow' && !isFollowing && (
          <TouchableOpacity
            style={styles.followButton}
            onPress={(e) => {
              e.stopPropagation();
              handleFollowUser(actorUsername);
            }}
          >
            <Text style={styles.followButtonText}>Follow</Text>
          </TouchableOpacity>
        )}
        {!notif.is_read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={24} color={Colors.primary} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadNotifications} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.notificationsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {recentNotifications.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>RECENT</Text>
            {recentNotifications.map(renderNotification)}
          </>
        )}

        {olderNotifications.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>EARLIER</Text>
            {olderNotifications.map(renderNotification)}
          </>
        )}

        {!loading && !error && notifications.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={64} color={Colors.mediumGray} />
            <Text style={styles.emptyStateText}>No notifications yet</Text>
            <Text style={styles.emptyStateSubtext}>
              When someone likes, comments, or follows you, you'll see it here
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
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
  },
  errorContainer: {
    backgroundColor: '#FFE8EF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 20,
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
  notificationsList: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.darkGray,
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    position: 'relative',
  },
  unreadNotification: {
    backgroundColor: '#FFF5F8',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#9B59B6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  likeBadge: {
    backgroundColor: Colors.primary,
  },
  followBadge: {
    backgroundColor: '#3498db',
  },
  unreadDot: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userName: {
    fontWeight: '600',
    color: Colors.black,
  },
  actionText: {
    color: Colors.darkGray,
  },
  bodyText: {
    fontSize: 13,
    color: Colors.darkGray,
    lineHeight: 18,
  },
  timeText: {
    fontSize: 12,
    color: Colors.darkGray,
    marginTop: 4,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#9B59B6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  followButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    width: 'auto',
    height: 'auto',
    borderRadius: 20,
  },
  actionButtonText: {
    fontSize: 24,
    fontWeight: '300',
    color: Colors.white,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  followingBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.mediumGray,
  },
  followingText: {
    fontSize: 14,
    color: Colors.black,
  },
});
