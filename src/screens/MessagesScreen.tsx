import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface MessagesScreenProps {
  navigation: any;
}

const mockMessages = [
  { id: '1', name: 'Robert Willions', message: 'We can schedule a party today?', time: '2 hours ago', unread: 2 },
  { id: '2', name: 'Shane Smith', message: 'Thanks for sharing.', time: '2 min ago', unread: 0 },
  { id: '3', name: 'Cody Fisher', message: 'Okay, got it.', time: '30 minute ago', unread: 0 },
  { id: '4', name: 'Perry Mate', message: 'Can we have call now?', time: '1 day ago', unread: 0 },
  { id: '5', name: 'Mark Allen', message: 'Wanna go outside someday?', time: '1 day ago', unread: 0 },
  { id: '6', name: 'John Heggings', message: 'Will go on monday in the evening.', time: '1 day ago', unread: 0 },
  { id: '7', name: 'Alexa Johnson', message: 'Can you give description details.', time: '1 day ago', unread: 0 },
];

export const MessagesScreen: React.FC<MessagesScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <View style={styles.devNotice}>
        <Ionicons name="construct-outline" size={20} color={Colors.primary} />
        <Text style={styles.devNoticeText}>Messaging feature under development</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.darkGray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor={Colors.darkGray}
          editable={false}
        />
      </View>

      <ScrollView style={styles.messagesList}>
        {mockMessages.map((msg) => (
          <TouchableOpacity
            key={msg.id}
            style={styles.messageItem}
            onPress={() => navigation.navigate('Chat', { userName: msg.name })}
          >
            <View style={styles.avatar} />
            <View style={styles.messageContent}>
              <View style={styles.messageHeader}>
                <Text style={styles.messageName}>{msg.name}</Text>
                <Text style={styles.messageTime}>{msg.time}</Text>
              </View>
              <Text style={styles.messageText}>{msg.message}</Text>
            </View>
            {msg.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{msg.unread}</Text>
              </View>
            )}
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
    justifyContent: 'center',
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
  devNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE8EF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 8,
    gap: 8,
  },
  devNoticeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: Colors.black,
  },
  messagesList: {
    flex: 1,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.lightGray,
    marginRight: 15,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  messageName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
  },
  messageTime: {
    fontSize: 12,
    color: Colors.darkGray,
  },
  messageText: {
    fontSize: 14,
    color: Colors.darkGray,
  },
  unreadBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.white,
  },
});
