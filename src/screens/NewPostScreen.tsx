import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface NewPostScreenProps {
  navigation: any;
}

export const NewPostScreen: React.FC<NewPostScreenProps> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [trackSelected, setTrackSelected] = useState(false);

  const handleSelectTrack = () => {
    // Simulate track selection - in production this would open file picker
    setTrackSelected(true);
    Alert.alert('Track Selected', 'Track selection would happen here. For now, simulating a selected track.');
  };

  const handlePost = () => {
    if (!title.trim()) {
      Alert.alert('Missing Information', 'Please add a track title');
      return;
    }

    if (!trackSelected) {
      Alert.alert('Missing Track', 'Please upload a track');
      return;
    }

    // Simulate posting
    Alert.alert(
      'Post Created!',
      `Your track "${title}" has been posted successfully!`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Post</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.uploadArea} onPress={handleSelectTrack}>
          <View style={[styles.uploadIcon, trackSelected && styles.uploadIconSelected]}>
            <Ionicons
              name={trackSelected ? "checkmark" : "musical-note"}
              size={32}
              color={Colors.white}
            />
            {!trackSelected && (
              <View style={styles.uploadBadge}>
                <Ionicons name="add-circle" size={20} color={Colors.primary} />
              </View>
            )}
          </View>
          <Text style={styles.uploadText}>
            {trackSelected ? 'Track selected' : 'Upload your track'}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={styles.titleInput}
          placeholder="Track title..."
          placeholderTextColor={Colors.darkGray}
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={styles.descriptionInput}
          placeholder="Description..."
          placeholderTextColor={Colors.darkGray}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={6}
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
            style={[styles.postButton, (!title.trim() || !trackSelected) && styles.disabledButton]}
            onPress={handlePost}
            disabled={!title.trim() || !trackSelected}
          >
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    color: Colors.black,
  },
  titleInput: {
    height: 50,
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 20,
    fontSize: 16,
    color: Colors.black,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  descriptionInput: {
    height: 150,
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
