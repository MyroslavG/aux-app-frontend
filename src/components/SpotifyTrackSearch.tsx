import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { api } from '../services/api';
import { SpotifyTrack } from '../types/api';

interface SpotifyTrackSearchProps {
  onSelectTrack: (track: SpotifyTrack, query: string, results: SpotifyTrack[]) => void;
  onClose: () => void;
  initialQuery?: string;
  initialResults?: SpotifyTrack[];
}

export const SpotifyTrackSearch: React.FC<SpotifyTrackSearchProps> = ({
  onSelectTrack,
  onClose,
  initialQuery = '',
  initialResults = [],
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [tracks, setTracks] = useState<SpotifyTrack[]>(initialResults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const results = await api.searchTracks(query, 20);
      setTracks(results.tracks || results);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.response?.data?.detail || 'Failed to search tracks');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTrack = (track: SpotifyTrack) => {
    onSelectTrack(track, query, tracks);
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderTrack = ({ item }: { item: SpotifyTrack }) => (
    <TouchableOpacity
      style={styles.trackItem}
      onPress={() => handleSelectTrack(item)}
    >
      {item.album_art_url ? (
        <Image source={{ uri: item.album_art_url }} style={styles.albumArt} />
      ) : (
        <View style={styles.albumArtPlaceholder}>
          <Ionicons name="musical-note" size={24} color={Colors.white} />
        </View>
      )}
      <View style={styles.trackInfo}>
        <Text style={styles.trackName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.artistName} numberOfLines={1}>
          {item.artist}
        </Text>
        <View style={styles.trackMeta}>
          <Text style={styles.albumName} numberOfLines={1}>
            {item.album}
          </Text>
          {item.duration_ms > 0 && (
            <>
              <Text style={styles.metaSeparator}> • </Text>
              <Text style={styles.duration}>{formatDuration(item.duration_ms)}</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search Spotify</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={Colors.black} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.darkGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a song or artist..."
            placeholderTextColor={Colors.darkGray}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={24} color={Colors.primary} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Searching Spotify...</Text>
        </View>
      ) : tracks.length === 0 && !error ? (
        <View style={styles.emptyState}>
          <Ionicons name="musical-notes-outline" size={64} color={Colors.mediumGray} />
          <Text style={styles.emptyStateText}>Search for tracks</Text>
          <Text style={styles.emptyStateSubtext}>
            Find the perfect song for your post
          </Text>
        </View>
      ) : (
        <FlatList
          data={tracks}
          renderItem={renderTrack}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.trackList}
          showsVerticalScrollIndicator={false}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.black,
  },
  closeButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.black,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    borderRadius: 25,
    paddingHorizontal: 20,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 90,
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  errorContainer: {
    backgroundColor: '#FFE8EF',
    paddingVertical: 12,
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
  trackList: {
    paddingHorizontal: 20,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  albumArt: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 15,
  },
  albumArtPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  trackInfo: {
    flex: 1,
    marginRight: 10,
  },
  trackName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
  },
  artistName: {
    fontSize: 14,
    color: Colors.darkGray,
    marginBottom: 4,
  },
  trackMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  albumName: {
    fontSize: 12,
    color: Colors.darkGray,
    flex: 1,
  },
  metaSeparator: {
    fontSize: 12,
    color: Colors.darkGray,
  },
  duration: {
    fontSize: 12,
    color: Colors.darkGray,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.darkGray,
    marginTop: 15,
  },
});
