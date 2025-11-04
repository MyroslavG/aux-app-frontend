import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface PostDetailScreenProps {
  route: any;
  navigation: any;
}

export const PostDetailScreen: React.FC<PostDetailScreenProps> = ({ route, navigation }) => {
  const { post } = route?.params || {};

  const mockPost = post || {
    user: { name: 'wydawww', location: 'Bandung', time: '1 mins ago' },
    song: { title: 'Blinding Lights', artist: 'The Weeknd', likes: 1500, comments: 500 },
  };

  const showUnderDevelopment = () => {
    Alert.alert('Under Development', 'This feature is coming soon!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.postImageContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>

        <View style={styles.postHeader}>
          <View style={styles.headerRow}>
            <View style={styles.userInfo}>
              <View style={styles.avatar} />
              <View>
                <Text style={styles.userName}>{mockPost.user.name}</Text>
                <View style={styles.postMeta}>
                  <Text style={styles.location}>{mockPost.user.location}</Text>
                  <Text style={styles.dot}> · </Text>
                  <Text style={styles.time}>{mockPost.user.time}</Text>
                  <Text style={styles.dot}> · </Text>
                  <Ionicons name="earth" size={12} color={Colors.white} />
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.postImage}>
          <View style={styles.playButtonLarge}>
            <Ionicons name="play" size={48} color={Colors.primary} />
          </View>
        </View>
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
            <Text style={styles.actionCount}>{mockPost.song.likes} Likes</Text>
          </View>
          <View style={styles.leftActions}>
            <TouchableOpacity style={styles.actionButton} onPress={showUnderDevelopment}>
              <Ionicons name="chatbubble" size={24} color={Colors.black} />
            </TouchableOpacity>
            <Text style={styles.actionCount}>{mockPost.song.comments} Comments</Text>
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
          <Text style={styles.songTitle}>{mockPost.song.title}</Text>
          <Text style={styles.artistName}>{mockPost.song.artist}</Text>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>Comments</Text>
          <Text style={styles.noComments}>Comments feature coming soon</Text>
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
  postImageContainer: {
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 70,
    zIndex: 5,
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
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  location: {
    fontSize: 12,
    color: Colors.white,
  },
  dot: {
    fontSize: 12,
    color: Colors.white,
  },
  time: {
    fontSize: 12,
    color: Colors.white,
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
    height: 600,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 10,
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
    paddingVertical: 20,
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
  commentsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
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
});
