import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface NotificationsScreenProps {
  navigation: any;
}

const mockNotifications = [
  {
    id: '1',
    type: 'comment',
    user: 'aditya_prasodjo',
    userName: 'Aditya Prasodjo',
    action: 'commented: Supercool',
    time: '45s',
    hasAction: true,
  },
  {
    id: '2',
    type: 'follow',
    user: 'ahsannnn_',
    userName: 'Ahsan',
    action: 'started following you',
    time: '1m',
    hasAction: true,
    actionType: 'follow',
  },
  {
    id: '3',
    type: 'like',
    user: 'emitasan3360',
    userName: 'Emita San',
    action: 'liked your track',
    time: '10m',
    hasAction: true,
  },
  {
    id: '4',
    type: 'follow',
    user: 'uibyanisa',
    userName: 'Uibya Nisa',
    action: 'started following you',
    time: 'Oct. 31',
    hasAction: false,
    actionType: 'following',
  },
];

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.devNotice}>
        <Ionicons name="construct-outline" size={20} color={Colors.primary} />
        <Text style={styles.devNoticeText}>Notifications feature under development</Text>
      </View>

      <ScrollView style={styles.notificationsList}>
        <Text style={styles.sectionTitle}>RECENT</Text>
        {mockNotifications.slice(0, 3).map((notif) => (
          <TouchableOpacity
            key={notif.id}
            style={styles.notificationItem}
            onPress={() => navigation.navigate('UserProfile', { userName: notif.userName })}
          >
            <View style={styles.avatar}>
              {notif.type === 'comment' && (
                <View style={styles.iconBadge}>
                  <Ionicons name="musical-notes" size={16} color={Colors.white} />
                </View>
              )}
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationText}>
                <Text style={styles.userName}>{notif.user}</Text>
                {'\n'}
                <Text style={styles.actionText}>{notif.action}</Text>
              </Text>
              <Text style={styles.timeText}>{notif.time}</Text>
            </View>
            {notif.hasAction && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  notif.actionType === 'follow' && styles.followButton,
                ]}
              >
                <Text
                  style={[
                    styles.actionButtonText,
                    notif.actionType === 'follow' && styles.followButtonText,
                  ]}
                >
                  {notif.actionType === 'follow' ? 'Follow' : '+'}
                </Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>LAST 7 DAYS</Text>
        {mockNotifications.slice(3).map((notif) => (
          <TouchableOpacity
            key={notif.id}
            style={styles.notificationItem}
            onPress={() => navigation.navigate('UserProfile', { userName: notif.userName })}
          >
            <View style={styles.avatar} />
            <View style={styles.notificationContent}>
              <Text style={styles.notificationText}>
                <Text style={styles.userName}>{notif.user}</Text>
                {'\n'}
                <Text style={styles.actionText}>{notif.action}</Text>
              </Text>
              <Text style={styles.timeText}>{notif.time}</Text>
            </View>
            {notif.actionType === 'following' && (
              <View style={styles.followingBadge}>
                <Text style={styles.followingText}>Following</Text>
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
  notificationsList: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.darkGray,
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.lightGray,
    marginRight: 15,
    position: 'relative',
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#9B59B6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userName: {
    fontWeight: '600',
    color: Colors.black,
  },
  actionText: {
    color: Colors.darkGray,
  },
  timeText: {
    fontSize: 12,
    color: Colors.darkGray,
    marginTop: 4,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#9B59B6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  followButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    width: 'auto',
    height: 'auto',
    borderRadius: 20,
  },
  actionButtonText: {
    fontSize: 24,
    fontWeight: '300',
    color: Colors.white,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  followingBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.mediumGray,
  },
  followingText: {
    fontSize: 14,
    color: Colors.black,
  },
});
