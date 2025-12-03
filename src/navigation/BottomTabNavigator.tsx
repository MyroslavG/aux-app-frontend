import 'react-native-gesture-handler';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

// Import screens
import { HomeScreen } from '../screens/HomeScreen';
import { DiscoverScreen } from '../screens/DiscoverScreen';
import { NewPostScreen } from '../screens/NewPostScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { PostDetailScreen } from '../screens/PostDetailScreen';
import { FollowersScreen } from '../screens/FollowersScreen';
import { FollowingScreen } from '../screens/FollowingScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const DiscoverStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const MessagesStack = createNativeStackNavigator();

// Home Stack Navigator
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeFeed" component={HomeScreen} />
      <HomeStack.Screen name="PostDetail" component={PostDetailScreen} />
      <HomeStack.Screen name="UserProfile" component={UserProfileScreen} />
      <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
      <HomeStack.Screen name="Followers" component={FollowersScreen} />
      <HomeStack.Screen name="Following" component={FollowingScreen} />
    </HomeStack.Navigator>
  );
};

// Discover Stack Navigator
const DiscoverStackNavigator = () => {
  return (
    <DiscoverStack.Navigator screenOptions={{ headerShown: false }}>
      <DiscoverStack.Screen name="DiscoverFeed" component={DiscoverScreen} />
      <DiscoverStack.Screen name="PostDetail" component={PostDetailScreen} />
      <DiscoverStack.Screen name="UserProfile" component={UserProfileScreen} />
      <DiscoverStack.Screen name="Followers" component={FollowersScreen} />
      <DiscoverStack.Screen name="Following" component={FollowingScreen} />
    </DiscoverStack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="PostDetail" component={PostDetailScreen} />
      <ProfileStack.Screen name="UserProfile" component={UserProfileScreen} />
      <ProfileStack.Screen name="Followers" component={FollowersScreen} />
      <ProfileStack.Screen name="Following" component={FollowingScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
};

// Messages Stack Navigator
const MessagesStackNavigator = () => {
  return (
    <MessagesStack.Navigator screenOptions={{ headerShown: false }}>
      <MessagesStack.Screen name="MessagesList" component={MessagesScreen} />
      <MessagesStack.Screen name="UserProfile" component={UserProfileScreen} />
    </MessagesStack.Navigator>
  );
};

export const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 84,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.white,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="view-grid-outline"
              size={28}
              color={focused ? Colors.tabActive : Colors.tabInactive}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="compass-outline"
              size={28}
              color={focused ? Colors.tabActive : Colors.tabInactive}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Create"
        component={NewPostScreen}
        options={{
          tabBarIcon: () => (
            <View style={styles.createIconContainer}>
              <View style={styles.createInner}>
                <Ionicons name="add" size={28} color={Colors.white} />
              </View>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="chatbubble-outline"
              size={28}
              color={focused ? Colors.tabActive : Colors.tabInactive}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="person-circle-outline"
              size={28}
              color={focused ? Colors.tabActive : Colors.tabInactive}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  createIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  createInner: {
    width: 58,
    height: 58,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
