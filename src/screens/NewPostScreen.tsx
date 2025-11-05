import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator, Image, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { api } from '../services/api';
import { SpotifyTrack } from '../types/api';
import { SpotifyTrackSearch } from '../components/SpotifyTrackSearch';

interface NewPostScreenProps {
  navigation: any;
}

export const NewPostScreen: React.FC<NewPostScreenProps> = ({ navigation }) => {
  const [caption, setCaption] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [showSpotifySearch, setShowSpotifySearch] = useState(false);
  const [posting, setPosting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);

  const handleSelectTrack = (track: SpotifyTrack, query: string, results: SpotifyTrack[]) => {
    setSelectedTrack(track);
    setSearchQuery(query);
    setSearchResults(results);
    setShowSpotifySearch(false);
  };

  const handleRemoveTrack = () => {
    setSelectedTrack(null);
  };

  const handlePost = async () => {
    if (!selectedTrack) {
      Alert.alert('Missing Track', 'Please select a track from Spotify');
      return;
    }

    setPosting(true);

    try {
      await api.createPost({
        caption: caption.trim() || undefined,
        spotify_track_id: selectedTrack.id,
        track_name: selectedTrack.name,
        artist_name: selectedTrack.artist,
        album_name: selectedTrack.album,
        album_art_url: selectedTrack.album_art_url,
      });

      Alert.alert(
        'Post Created!',
        `Your post with "${selectedTrack.name}" has been shared!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home'),
          },
        ]
      );
    } catch (err: any) {
      console.error('Failed to create post:', err);
      Alert.alert(
        'Error',
        err.response?.data?.detail || 'Failed to create post. Please try again.'
      );
    } finally {
      setPosting(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Post</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
        {selectedTrack ? (
          <View style={styles.selectedTrackCard}>
            <View style={styles.selectedTrackHeader}>
              <Text style={styles.selectedTrackLabel}>Selected Track</Text>
              <TouchableOpacity onPress={handleRemoveTrack} style={styles.removeButton}>
                <Ionicons name="close-circle" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.selectedTrackContainer}
              onPress={() => setShowSpotifySearch(true)}
              activeOpacity={0.7}
            >
              {selectedTrack.album_art_url ? (
                <Image
                  source={{ uri: selectedTrack.album_art_url }}
                  style={styles.selectedAlbumArt}
                />
              ) : (
                <View style={styles.selectedAlbumArtPlaceholder}>
                  <Ionicons name="musical-note" size={32} color={Colors.white} />
                </View>
              )}
              <View style={styles.selectedTrackInfo}>
                <Text style={styles.selectedTrackName} numberOfLines={1}>
                  {selectedTrack.name}
                </Text>
                <Text style={styles.selectedArtistName} numberOfLines={1}>
                  {selectedTrack.artist}
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={32} color="#27AE60" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadArea}
            onPress={() => setShowSpotifySearch(true)}
          >
            <View style={styles.uploadIcon}>
              <Ionicons name="musical-note" size={32} color={Colors.white} />
              <View style={styles.uploadBadge}>
                <Ionicons name="add-circle" size={20} color={Colors.primary} />
              </View>
            </View>
            <Text style={styles.uploadText}>Search Spotify Track</Text>
            <Text style={styles.uploadSubtext}>
              Tap to search for a song
            </Text>
          </TouchableOpacity>
        )}

        <TextInput
          style={styles.descriptionInput}
          placeholder="Add a caption (optional)..."
          placeholderTextColor={Colors.darkGray}
          value={caption}
          onChangeText={setCaption}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.postButton, !selectedTrack && styles.disabledButton]}
            onPress={handlePost}
            disabled={!selectedTrack || posting}
          >
            {posting ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.postButtonText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

        <Modal
          visible={showSpotifySearch}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <SpotifyTrackSearch
            onSelectTrack={handleSelectTrack}
            onClose={() => setShowSpotifySearch(false)}
            initialQuery={searchQuery}
            initialResults={searchResults}
          />
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  devNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE8EF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
    gap: 10,
  },
  devNoticeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  uploadArea: {
    height: 200,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    backgroundColor: '#FFE8EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  uploadIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  uploadIconSelected: {
    backgroundColor: '#27AE60',
  },
  uploadBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
  },
  uploadSubtext: {
    fontSize: 14,
    color: Colors.darkGray,
    marginTop: 5,
  },
  selectedTrackCard: {
    marginBottom: 20,
  },
  selectedTrackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedTrackLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.darkGray,
  },
  removeButton: {
    padding: 5,
  },
  selectedTrackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE8EF',
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  selectedAlbumArt: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  selectedAlbumArtPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedTrackInfo: {
    flex: 1,
    marginRight: 10,
  },
  selectedTrackName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
  },
  selectedArtistName: {
    fontSize: 14,
    color: Colors.darkGray,
  },
  descriptionInput: {
    height: 100,
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: Colors.black,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  actions: {
    flexDirection: 'row',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
  },
  postButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
