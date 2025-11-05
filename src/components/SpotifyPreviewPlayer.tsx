import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface SpotifyPreviewPlayerProps {
  previewUrl?: string;
}

export const SpotifyPreviewPlayer: React.FC<SpotifyPreviewPlayerProps> = ({ previewUrl }) => {
  const player = useAudioPlayer(previewUrl || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Cleanup when component unmounts or URL changes
    return () => {
      if (player.playing) {
        player.pause();
      }
    };
  }, [player]);

  const playPause = async () => {
    if (!previewUrl) return;

    try {
      setIsLoading(true);

      if (player.playing) {
        player.pause();
      } else {
        player.play();
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error playing preview:', error);
      setIsLoading(false);
    }
  };

  if (!previewUrl) {
    return (
      <View style={styles.noPreview}>
        <Ionicons name="musical-note-outline" size={16} color={Colors.darkGray} />
        <Text style={styles.noPreviewText}>No preview</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.playButton}
      onPress={playPause}
      disabled={isLoading}
    >
      {isLoading ? (
        <Ionicons name="ellipsis-horizontal" size={20} color={Colors.white} />
      ) : player.playing ? (
        <Ionicons name="pause" size={20} color={Colors.white} />
      ) : (
        <Ionicons name="play" size={20} color={Colors.white} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
  },
  noPreviewText: {
    fontSize: 12,
    color: Colors.darkGray,
  },
});
