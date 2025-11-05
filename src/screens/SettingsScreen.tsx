import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { Colors } from '../constants/colors';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

WebBrowser.maybeCompleteAuthSession();

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { user, refreshUser, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(user?.spotify_connected || false);

  // Update spotifyConnected when user object changes
  useEffect(() => {
    setSpotifyConnected(user?.spotify_connected || false);
  }, [user?.spotify_connected]);

  const handleConnectSpotify = async () => {
    try {
      setLoading(true);

      // Get the Spotify authorization URL from backend
      const { auth_url } = await api.getSpotifyAuthUrl();

      // Open Spotify authorization page in browser
      const result = await WebBrowser.openAuthSessionAsync(
        auth_url,
        'com.auxapp:/spotify-callback'
      );

      if (result.type === 'success' && result.url) {
        // Extract the authorization code from the callback URL
        const url = new URL(result.url);
        const code = url.searchParams.get('code');

        if (code) {
          // Send the code to backend to exchange for tokens
          await api.handleSpotifyCallback(code);

          // Refresh user data to get updated spotify_connected field
          await refreshUser();

          Alert.alert('Success', 'Spotify account connected successfully!');
        } else {
          throw new Error('No authorization code received');
        }
      } else if (result.type === 'cancel') {
        Alert.alert('Cancelled', 'Spotify connection was cancelled');
      }
    } catch (error: any) {
      console.error('Failed to connect Spotify:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || error.message || 'Failed to connect to Spotify'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectSpotify = async () => {
    Alert.alert(
      'Disconnect Spotify',
      'Are you sure you want to disconnect your Spotify account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await api.disconnectSpotify();

              // Refresh user data to get updated spotify_connected field
              await refreshUser();

              Alert.alert('Success', 'Spotify account disconnected');
            } catch (error: any) {
              console.error('Failed to disconnect Spotify:', error);
              Alert.alert('Error', error.response?.data?.detail || 'Failed to disconnect Spotify');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Spotify Connection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Accounts</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#1DB954' }]}>
                <Ionicons name="musical-notes" size={24} color={Colors.white} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Spotify</Text>
                <Text style={styles.settingDescription}>
                  {spotifyConnected
                    ? 'Connected'
                    : 'Connect your Spotify account to share music'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.connectButton,
                spotifyConnected && styles.disconnectButton,
              ]}
              onPress={spotifyConnected ? handleDisconnectSpotify : handleConnectSpotify}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text
                  style={[
                    styles.connectButtonText,
                    spotifyConnected && styles.disconnectButtonText,
                  ]}
                >
                  {spotifyConnected ? 'Disconnect' : 'Connect'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-outline" size={24} color={Colors.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Edit Profile</Text>
                <Text style={styles.settingDescription}>
                  Update your profile information
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.mediumGray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="lock-closed-outline" size={24} color={Colors.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Privacy</Text>
                <Text style={styles.settingDescription}>
                  Manage your privacy settings
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.mediumGray} />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="information-circle-outline" size={24} color={Colors.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Help & Support</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.mediumGray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="document-text-outline" size={24} color={Colors.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Terms of Service</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.mediumGray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="shield-checkmark-outline" size={24} color={Colors.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Privacy Policy</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.mediumGray} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
  },
  placeholder: {
    width: 40,
  },
  content: {
    paddingVertical: 10,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE8EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.black,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.darkGray,
  },
  connectButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  connectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  disconnectButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.mediumGray,
  },
  disconnectButtonText: {
    color: Colors.black,
  },
  logoutSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    marginBottom: 50,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.primary,
    minWidth: 200,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
});
