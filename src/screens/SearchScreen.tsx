import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface SearchScreenProps {
  navigation: any;
}

const mockSearchResults = [
  { id: '1', type: 'genre', name: 'Electronic', followers: '767K', tracks: '30' },
  { id: '2', type: 'genre', name: 'Rock', followers: '', tracks: '' },
  { id: '3', type: 'user', name: 'Evan Dimas', handle: 'evannn_photography', avatar: true },
  { id: '4', type: 'user', name: 'Chris Hemsworth', handle: 'chrisphotography', avatar: true },
];

export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.darkGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={Colors.darkGray}
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
        </View>
      </View>

      <ScrollView style={styles.resultsList}>
        {mockSearchResults.map((result) => (
          <TouchableOpacity
            key={result.id}
            style={styles.resultItem}
            onPress={() => {
              if (result.type === 'user') {
                navigation.navigate('UserProfile', { userName: result.name });
              }
            }}
          >
            <View style={styles.resultLeft}>
              {result.type === 'genre' ? (
                <View style={styles.genreIcon}>
                  <Text style={styles.genreIconText}>#</Text>
                </View>
              ) : (
                <View style={styles.userAvatar} />
              )}
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{result.name}</Text>
                {result.type === 'genre' && result.followers && (
                  <Text style={styles.resultMeta}>
                    {result.followers} followers · {result.tracks} tracks
                  </Text>
                )}
                {result.type === 'user' && (
                  <Text style={styles.resultMeta}>{result.handle}</Text>
                )}
              </View>
            </View>
            <TouchableOpacity>
              <Ionicons name="close" size={24} color={Colors.darkGray} />
            </TouchableOpacity>
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    marginLeft: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: Colors.black,
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  resultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  genreIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  genreIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.black,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.lightGray,
    marginRight: 15,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
  },
  resultMeta: {
    fontSize: 14,
    color: Colors.darkGray,
    marginTop: 2,
  },
});
