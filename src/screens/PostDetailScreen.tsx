import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Post } from '../types/api';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface PostDetailScreenProps {
  route: any;
  navigation: any;
}

export const PostDetailScreen: React.FC<PostDetailScreenProps> = ({ route, navigation }) => {
  const { post } = route?.params || {};
  const { user: currentUser } = useAuth();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedCaption, setEditedCaption] = useState(post?.caption || '');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwnPost = currentUser?.id === post?.user?.id;

  const showUnderDevelopment = () => {
    Alert.alert('Under Development', 'This feature is coming soon!');
  };

  const handleEditPost = () => {
    setEditedCaption(post?.caption || '');
    setEditModalVisible(true);
  };

  const handleUpdatePost = async () => {
    if (!post) return;

    setUpdating(true);
    try {
      await api.updatePost(post.id, editedCaption);
      setEditModalVisible(false);
      Alert.alert('Success', 'Post updated successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Failed to update post:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to update post');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeletePost = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!post) return;

            setDeleting(true);
            try {
              await api.deletePost(post.id);
              Alert.alert('Success', 'Post deleted successfully!');
              navigation.goBack();
            } catch (error: any) {
              console.error('Failed to delete post:', error);
              Alert.alert('Error', error.response?.data?.detail || 'Failed to delete post');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
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

  const handlePlayOnSpotify = async () => {
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

  if (!post || !post.user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.primary} />
        <Text style={styles.errorText}>Post not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backToFeedButton}>
          <Text style={styles.backToFeedText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section on White Background */}
      <View style={styles.headerContainer}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.black} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.userInfo}
            onPress={() => navigation.navigate('UserProfile', { username: post.user.username })}
          >
            {post.user.profile_image_url ? (
              <Image source={{ uri: post.user.profile_image_url }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {post.user.display_name?.charAt(0).toUpperCase() || post.user.username?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.userTextInfo}>
              <Text style={styles.userName}>{post.user.display_name || post.user.username}</Text>
              <View style={styles.postMeta}>
                <Text style={styles.location}>@{post.user.username}</Text>
                <Text style={styles.dot}> · </Text>
                <Text style={styles.time}>{formatTimeAgo(post.created_at)}</Text>
              </View>
            </View>
          </TouchableOpacity>

          {isOwnPost && (
            <TouchableOpacity style={styles.moreButtonHeader} onPress={() => {
              Alert.alert(
                'Post Options',
                'What would you like to do?',
                [
                  {
                    text: 'Edit Caption',
                    onPress: handleEditPost,
                  },
                  {
                    text: 'Delete Post',
                    onPress: handleDeletePost,
                    style: 'destructive',
                  },
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                ]
              );
            }}>
              <Ionicons name="ellipsis-horizontal" size={24} color={Colors.black} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Album Art Section */}
      <View style={styles.postImageContainer}>
        <TouchableOpacity
          style={styles.postImage}
          onPress={handlePlayOnSpotify}
          activeOpacity={0.9}
        >
          {post.album_art_url ? (
            <Image source={{ uri: post.album_art_url }} style={styles.albumArt} />
          ) : (
            <View style={styles.albumArtPlaceholder}>
              <Ionicons name="musical-note" size={80} color={Colors.white} />
            </View>
          )}
          <View style={styles.playButtonLarge}>
            <Ionicons name="play" size={48} color={Colors.primary} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.devNotice}>
          <Ionicons name="construct-outline" size={20} color={Colors.primary} />
          <Text style={styles.devNoticeText}>Interactions under development</Text>
        </View>

        <View style={styles.actions}>
          <View style={styles.leftActions}>
            <TouchableOpacity style={styles.actionButton} onPress={showUnderDevelopment}>
              <Ionicons name="heart" size={28} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.actionCount}>Likes</Text>
          </View>
          <View style={styles.leftActions}>
            <TouchableOpacity style={styles.actionButton} onPress={showUnderDevelopment}>
              <Ionicons name="chatbubble" size={24} color={Colors.black} />
            </TouchableOpacity>
            <Text style={styles.actionCount}>Comments</Text>
          </View>
          <View style={styles.rightActions}>
            <TouchableOpacity style={styles.iconButton} onPress={showUnderDevelopment}>
              <Ionicons name="share-social" size={24} color={Colors.black} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={showUnderDevelopment}>
              <Ionicons name="bookmark" size={24} color={Colors.black} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.songInfo}>
          <Text style={styles.songTitle}>{post.track_name}</Text>
          <Text style={styles.artistName}>{post.artist_name}</Text>
        </View>

        {post.caption && (
          <View style={styles.captionSection}>
            <Text style={styles.captionText}>
              <Text style={styles.captionUsername}>@{post.user.username} </Text>
              {post.caption}
            </Text>
          </View>
        )}

        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>Comments</Text>
          <Text style={styles.noComments}>Comments feature coming soon</Text>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => setEditModalVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Text style={styles.modalCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Edit Caption</Text>
                <TouchableOpacity onPress={handleUpdatePost} disabled={updating}>
                  {updating ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <Text style={styles.modalSave}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
                <TextInput
                  style={styles.captionInput}
                  placeholder="Add a caption..."
                  placeholderTextColor={Colors.mediumGray}
                  value={editedCaption}
                  onChangeText={setEditedCaption}
                  multiline
                  maxLength={500}
                  autoFocus
                />
                <Text style={styles.characterCount}>{editedCaption.length}/500</Text>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Deleting Overlay */}
      {deleting && (
        <View style={styles.deletingOverlay}>
          <ActivityIndicator size="large" color={Colors.white} />
          <Text style={styles.deletingText}>Deleting post...</Text>
        </View>
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
  errorText: {
    fontSize: 18,
    color: Colors.darkGray,
    marginTop: 15,
    marginBottom: 20,
  },
  backToFeedButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 25,
  },
  backToFeedText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  headerContainer: {
    backgroundColor: Colors.white,
    paddingTop: 55,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  postImageContainer: {
    position: 'relative',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postHeader: {
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 15
  },
  userTextInfo: {
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  userName: {
    fontSize: 16,
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
    marginLeft: 4,
    color: Colors.darkGray,
  },
  time: {
    fontSize: 12,
    marginLeft: 4,
    color: Colors.darkGray,
  },
  compactAlbumSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginHorizontal: 20,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    padding: 10,
  },
  compactAlbumArt: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  compactAlbumArtPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  compactSongInfo: {
    flex: 1,
  },
  compactSongTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 2,
  },
  compactArtistName: {
    fontSize: 12,
    color: Colors.darkGray,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 20,
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.primary,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  moreButton: {
    width: 36,
    height: 36,
  },
  postImage: {
    width: '100%',
    height: 400,
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
  playButtonLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  content: {
    flex: 1,
  },
  devNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE8EF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 8,
    gap: 8,
  },
  devNoticeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 8,
  },
  actionCount: {
    fontSize: 14,
    color: Colors.black,
    marginRight: 20,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  songInfo: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  songTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 5,
  },
  artistName: {
    fontSize: 16,
    color: Colors.darkGray,
  },
  captionSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  captionText: {
    fontSize: 15,
    color: Colors.black,
    lineHeight: 22,
  },
  captionUsername: {
    fontWeight: '600',
    color: Colors.black,
  },
  commentsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 60,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 15,
  },
  noComments: {
    fontSize: 14,
    color: Colors.darkGray,
    textAlign: 'center',
    marginTop: 20,
  },
  moreButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlayTouchable: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    minHeight: 300,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  modalCancel: {
    fontSize: 16,
    color: Colors.darkGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    flexGrow: 1,
  },
  captionInput: {
    fontSize: 16,
    color: Colors.black,
    minHeight: 150,
    maxHeight: 400,
    textAlignVertical: 'top',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    marginBottom: 10,
  },
  characterCount: {
    fontSize: 12,
    color: Colors.mediumGray,
    textAlign: 'right',
    marginTop: 10,
  },
  deletingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  deletingText: {
    fontSize: 16,
    color: Colors.white,
    marginTop: 15,
    fontWeight: '500',
  },
});
