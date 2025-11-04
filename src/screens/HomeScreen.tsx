import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface HomeScreenProps {
  navigation: any;
}

const showUnderDevelopment = () => {
  Alert.alert('Under Development', 'This feature is coming soon!');
};

const mockPosts = [
  {
    id: '1',
    user: { name: 'akmalnstlh', location: 'Bekasi', time: '1 mins ago' },
    song: { title: 'All Too Well', artist: 'Taylor Swift', likes: 349, comments: 760 },
    image: 'https://picsum.photos/400/400?random=1',
  },
  {
    id: '2',
    user: { name: 'akmalnstlh', location: 'Bekasi', time: '10 mins ago' },
    song: { title: 'Blinding Lights', artist: 'The Weeknd', likes: 245, comments: 432 },
    image: 'https://picsum.photos/400/400?random=2',
  },
  {
    id: '3',
    user: { name: 'akmalnstlh', location: 'Bekasi', time: '10 mins ago' },
    song: { title: 'Blinding Lights', artist: 'The Weeknd', likes: 245, comments: 432 },
    image: 'https://picsum.photos/400/400?random=2',
  },
];

const mockStories = [
  { id: '0', name: 'Your story', isYours: true },
  { id: '1', name: 'calista33' },
  { id: '2', name: 'azzahrrn' },
  { id: '3', name: 'adamsuseno' },
  { id: '4', name: 'adeliaaa' },
];

const HEADER_HEIGHT = 95;

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
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
      >
        {/* Stories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesContainer}>
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
      </ScrollView>

      {/* Posts */}
      {mockPosts.map((post) => (
        <View key={post.id} style={styles.post}>
          <View style={styles.postHeader}>
            <TouchableOpacity
              style={styles.postUser}
              onPress={() => navigation.navigate('UserProfile', { userName: post.user.name })}
            >
              <View style={styles.userAvatar} />
              <View>
                <Text style={styles.userName}>{post.user.name}</Text>
                <View style={styles.postMeta}>
                  <Text style={styles.location}>{post.user.location}</Text>
                  <Text style={styles.dot}> · </Text>
                  <Text style={styles.time}>{post.user.time}</Text>
                </View>
              </View>
            </TouchableOpacity>
            {/* <TouchableOpacity>
              <Ionicons name="ellipsis-horizontal" size={24} color={Colors.black} />
            </TouchableOpacity> */}
          </View>

          <TouchableOpacity
            style={styles.postImage}
            onPress={() => navigation.navigate('PostDetail', { post })}
          >
            <View style={styles.playButton}>
              <Ionicons name="play" size={32} color={Colors.primary} />
            </View>
          </TouchableOpacity>

          <View style={styles.songInfo}>
            <Text style={styles.songTitle}>{post.song.title}</Text>
            <Text style={styles.artistName}>{post.song.artist}</Text>
          </View>

          <View style={styles.postActions}>
            <View style={styles.actionLeft}>
              <TouchableOpacity style={styles.actionButton} onPress={showUnderDevelopment}>
                <Ionicons name="heart-outline" size={24} color={Colors.black} />
                <Text style={styles.actionText}>{post.song.likes} Likes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={showUnderDevelopment}>
                <Ionicons name="chatbubble-outline" size={24} color={Colors.black} />
                <Text style={styles.actionText}>{post.song.comments} Comments</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actionRight}>
              <TouchableOpacity onPress={showUnderDevelopment}>
                <Ionicons name="share-outline" size={24} color={Colors.black} />
              </TouchableOpacity>
              <TouchableOpacity onPress={showUnderDevelopment}>
                <Ionicons name="bookmark-outline" size={24} color={Colors.black} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
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
    backgroundColor: Colors.lightGray,
    marginRight: 10,
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
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  songInfo: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  songTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    position: 'absolute',
    bottom: 50,
    left: 15,
  },
  artistName: {
    fontSize: 14,
    color: Colors.white,
    position: 'absolute',
    bottom: 30,
    left: 15,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    fontSize: 14,
    color: Colors.black,
    marginLeft: 5,
  },
  actionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
});
