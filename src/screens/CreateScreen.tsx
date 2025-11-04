import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';

interface CreateScreenProps {
  navigation: any;
}

export const CreateScreen: React.FC<CreateScreenProps> = ({ navigation }) => {
  useEffect(() => {
    navigation.navigate('NewPost');
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>+</Text>
        </TouchableOpacity>
        <Text style={styles.placeholderText}>Create something new</Text>
        <Text style={styles.subText}>Share your music with the world</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  createButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  createButtonText: {
    fontSize: 48,
    color: Colors.white,
    fontWeight: '300',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: Colors.darkGray,
  },
});
