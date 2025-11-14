import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, TextInput, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Colors } from '../constants/colors';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useBiometricAuth } from '../hooks/useBiometricAuth';

WebBrowser.maybeCompleteAuthSession();

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { user, refreshUser, signOut, biometricEnabled, enableBiometric, disableBiometric } = useAuth();
  const { isBiometricSupported, getBiometricLabel, authenticate } = useBiometricAuth();
  const [loading, setLoading] = useState(false);
  const [checkingSpotifyStatus, setCheckingSpotifyStatus] = useState(true);
  const [spotifyConnected, setSpotifyConnected] = useState(user?.spotify_connected || false);
  const [username, setUsername] = useState(user?.username || '');
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [displayNameError, setDisplayNameError] = useState('');

  // Update state when user object changes
  useEffect(() => {
    setSpotifyConnected(user?.spotify_connected || false);
    setUsername(user?.username || '');
    setDisplayName(user?.display_name || '');
    setBio(user?.bio || '');
  }, [user]);

  // Check Spotify connection status when screen loads
  useEffect(() => {
    checkSpotifyStatus();
  }, []);

  const checkSpotifyStatus = async () => {
    try {
      setCheckingSpotifyStatus(true);
      const status = await api.getSpotifyStatus();
      setSpotifyConnected(status.connected || false);
    } catch (error) {
      console.error('Failed to check Spotify status:', error);
      // Fall back to user object status
      setSpotifyConnected(user?.spotify_connected || false);
    } finally {
      setCheckingSpotifyStatus(false);
    }
  };

  // Track changes to profile fields and validate
  useEffect(() => {
    const usernameChanged = username !== (user?.username || '');
    const nameChanged = displayName !== (user?.display_name || '');
    const bioChanged = bio !== (user?.bio || '');
    setHasChanges(usernameChanged || nameChanged || bioChanged);

    // Validate username
    if (usernameChanged) {
      const usernameRegex = /^[a-z][a-z0-9_-]{2,29}$/;
      if (username.trim().length < 3) {
        setUsernameError('Username must be at least 3 characters');
      } else if (username.trim().length > 30) {
        setUsernameError('Username must be at most 30 characters');
      } else if (!usernameRegex.test(username.trim())) {
        setUsernameError('Username must start with a letter and contain only lowercase letters, numbers, underscores, and hyphens');
      } else {
        setUsernameError('');
      }
    } else {
      setUsernameError('');
    }

    // Validate display name
    if (nameChanged && displayName.trim().length === 0) {
      setDisplayNameError('Display name must be at least 1 character');
    } else {
      setDisplayNameError('');
    }
  }, [username, displayName, bio, user]);

  const handleSaveProfile = async () => {
    if (!hasChanges) return;

    // Validate username
    const usernameRegex = /^[a-z][a-z0-9_-]{2,29}$/;
    if (username !== (user?.username || '')) {
      if (username.trim().length < 3 || username.trim().length > 30) {
        Alert.alert('Validation Error', 'Username must be between 3 and 30 characters');
        return;
      }
      if (!usernameRegex.test(username.trim())) {
        Alert.alert('Validation Error', 'Username must start with a letter and contain only lowercase letters, numbers, underscores, and hyphens');
        return;
      }
    }

    // Validate display name
    if (displayName.trim().length === 0) {
      Alert.alert('Validation Error', 'Display name must be at least 1 character');
      return;
    }

    try {
      setLoading(true);

      const updateData: any = {};
      if (username !== (user?.username || '')) {
        updateData.username = username.trim().toLowerCase();
      }
      if (displayName !== (user?.display_name || '')) {
        updateData.display_name = displayName.trim();
      }
      if (bio !== (user?.bio || '')) {
        updateData.bio = bio.trim();
      }

      await api.updateProfile(updateData);
      await refreshUser();

      Alert.alert('Success', 'Profile updated successfully!');
      setHasChanges(false);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to update profile'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConnectSpotify = async () => {
    try {
      setLoading(true);

      // Get the proper redirect URI for this app
      const redirectUri = makeRedirectUri({
        scheme: 'auxapp',
        path: 'spotify-callback'
      });
      console.log('Redirect URI:', redirectUri);

      // Get the Spotify authorization URL from backend
      const { auth_url } = await api.getSpotifyAuthUrl();

      // Open Spotify authorization page in browser
      const result = await WebBrowser.openAuthSessionAsync(
        auth_url,
        redirectUri
      );
      console.log('Auth session result:', result);

      // Dismiss the auth session immediately to prevent HTML display
      WebBrowser.dismissAuthSession();

      if (result.type === 'success' && result.url) {
        // Extract the authorization code from the callback URL
        const url = new URL(result.url);
        const code = url.searchParams.get('code');

        if (code) {
          // Send the code to backend to exchange for tokens
          // Backend returns JSON with success status
          const response = await api.handleSpotifyCallback(code);
          console.log(response);
          // Check if the response indicates success
          if (response.success) {
            // Immediately update local state to show connected status
            setSpotifyConnected(true);

            // Refresh user data to get updated spotify_connected field
            await refreshUser();

            Alert.alert(
              'Success',
              response.message || 'Spotify account connected successfully!',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    console.log('Spotify connected for user:', response.spotify_display_name);
                    // Go back to previous screen (Profile)
                    navigation.goBack();
                  },
                },
              ]
            );
          } else {
            throw new Error(response.message || 'Failed to connect Spotify');
          }
        } else {
          const error = url.searchParams.get('error');
          if (error) {
            throw new Error(`Spotify authorization failed: ${error}`);
          }
          throw new Error('No authorization code received');
        }
      } else if (result.type === 'cancel') {
        // User cancelled - go back to previous screen
        console.log('User cancelled Spotify connection');
        navigation.goBack();
      }
    } catch (error: any) {
      console.error('Failed to connect Spotify:', error);

      // Enhanced error handling for different error types
      let errorMessage = 'Failed to connect to Spotify';

      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Connection Error', errorMessage);
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

              // Immediately update local state to show disconnected status
              setSpotifyConnected(false);

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

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      // Enabling biometric - require authentication first
      try {
        const result = await authenticate('Authenticate to enable biometric login');
        if (result.success) {
          await enableBiometric();
          Alert.alert('Success', `${getBiometricLabel()} login enabled`);
        } else {
          Alert.alert('Authentication Failed', result.error || 'Could not authenticate');
        }
      } catch (error) {
        console.error('Error enabling biometric:', error);
        Alert.alert('Error', 'Failed to enable biometric authentication');
      }
    } else {
      // Disabling biometric
      try {
        await disableBiometric();
        Alert.alert('Success', `${getBiometricLabel()} login disabled`);
      } catch (error) {
        console.error('Error disabling biometric:', error);
        Alert.alert('Error', 'Failed to disable biometric authentication');
      }
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView}>
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
          {/* Profile Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile</Text>

            <View style={styles.profileForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  style={[styles.input, usernameError && styles.inputError]}
                  placeholder="Your username"
                  placeholderTextColor={Colors.darkGray}
                  value={username}
                  onChangeText={(text) => setUsername(text.toLowerCase())}
                  maxLength={30}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View style={styles.inputFooter}>
                  {usernameError ? (
                    <Text style={styles.errorText}>{usernameError}</Text>
                  ) : (
                    <View />
                  )}
                  <Text style={styles.charCount}>{username.length}/30</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Display Name</Text>
                <TextInput
                  style={[styles.input, displayNameError && styles.inputError]}
                  placeholder="Your display name"
                  placeholderTextColor={Colors.darkGray}
                  value={displayName}
                  onChangeText={setDisplayName}
                  maxLength={50}
                />
                <View style={styles.inputFooter}>
                  {displayNameError ? (
                    <Text style={styles.errorText}>{displayNameError}</Text>
                  ) : (
                    <View />
                  )}
                  <Text style={styles.charCount}>{displayName.length}/50</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  placeholder="Tell us about yourself"
                  placeholderTextColor={Colors.darkGray}
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={2}
                  maxLength={100}
                  textAlignVertical="top"
                />
                <View style={styles.inputFooter}>
                  <View />
                  <Text style={styles.charCount}>{bio.length}/100</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveButton, (!hasChanges || usernameError || displayNameError) && styles.saveButtonDisabled]}
                onPress={handleSaveProfile}
                disabled={!hasChanges || loading || !!usernameError || !!displayNameError}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

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

              {checkingSpotifyStatus ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
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
              )}
            </View>
          </View>

          {/* Security Section */}
          {isBiometricSupported && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Security</Text>

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: Colors.primary }]}>
                    <Ionicons
                      name="finger-print"
                      size={24}
                      color={Colors.white}
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>{getBiometricLabel()}</Text>
                    <Text style={styles.settingDescription}>
                      {biometricEnabled
                        ? 'Quick sign in with biometrics'
                        : 'Enable biometric authentication'}
                    </Text>
                  </View>
                </View>

                <Switch
                  value={biometricEnabled}
                  onValueChange={handleBiometricToggle}
                  trackColor={{ false: Colors.mediumGray, true: Colors.primary }}
                  thumbColor={Colors.white}
                  ios_backgroundColor={Colors.mediumGray}
                />
              </View>
            </View>
          )}

          {/* Logout Button */}
          <View style={styles.logoutSection}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={Colors.primary} />
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
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
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.primary,
    lineHeight: 18,
  },
  profileForm: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    // marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.black,
  },
  inputError: {
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  errorText: {
    fontSize: 12,
    color: Colors.primary,
    flex: 1,
  },
  bioInput: {
    minHeight: 80,
    paddingTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: Colors.mediumGray,
    textAlign: 'right',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 16
  },
  saveButtonDisabled: {
    backgroundColor: Colors.mediumGray,
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.lightGray,
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
    paddingVertical: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.primary,
    minWidth: 200,
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
});
