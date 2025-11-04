import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface ChatScreenProps {
  route: any;
  navigation: any;
}

const mockChatMessages = [
  { id: '1', text: 'Hey, Perry', time: '09:01 PM', isMine: false },
  { id: '2', text: 'Hello, Shane', time: '09:00 PM', isMine: true },
];

export const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { userName = 'Shane Smith' } = route?.params || {};
  const [message, setMessage] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <View style={styles.headerUser}>
          <View style={styles.avatar} />
          <View>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.onlineStatus}>● Online</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="call" size={24} color={Colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.messagesContainer}>
        {mockChatMessages.map((msg) => (
          <View
            key={msg.id}
            style={[styles.messageBubble, msg.isMine ? styles.myMessage : styles.theirMessage]}
          >
            <Text style={[styles.messageText, msg.isMine && styles.myMessageText]}>
              {msg.text}
            </Text>
            <Text style={[styles.messageTime, msg.isMine && styles.myMessageTime]}>
              {msg.time}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color={Colors.darkGray} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type Message..."
          placeholderTextColor={Colors.darkGray}
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.sendButton}>
          <Ionicons name="send" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  headerUser: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
  },
  onlineStatus: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 15,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.lightGray,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: Colors.black,
    marginBottom: 4,
  },
  myMessageText: {
    color: Colors.white,
  },
  messageTime: {
    fontSize: 11,
    color: Colors.darkGray,
  },
  myMessageTime: {
    color: Colors.white,
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    marginBottom: 15,
  },
  addButton: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.black,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});
