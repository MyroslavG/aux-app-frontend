import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useBiometricAuth } from '../hooks/useBiometricAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enable dismissing the browser on completion (for mobile)
WebBrowser.maybeCompleteAuthSession();

interface WelcomeScreenProps {
  onGoogleSignIn: (idToken: string) => Promise<void>;
  onBiometricAuth?: () => Promise<void>;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGoogleSignIn, onBiometricAuth }) => {
  const [loading, setLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  const { isBiometricSupported, biometricType, authenticate, getBiometricLabel } = useBiometricAuth();

  // Get the redirect URI - use custom scheme for both web and mobile
  const redirectUri = Platform.OS === 'web'
    ? `${window.location.origin}/`
    : 'com.auxapp:/oauth2redirect';

  // Use Expo Auth Session for both web and mobile
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    redirectUri: redirectUri,
  });

  // Check if biometric auth should be available
  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const biometricEnabled = await AsyncStorage.getItem('biometric_enabled');
      const hasRefreshToken = await AsyncStorage.getItem('refresh_token');

      // Show biometric option only if it's enabled and user has a refresh token (was previously signed in)
      setShowBiometric(biometricEnabled === 'true' && !!hasRefreshToken && isBiometricSupported);
    } catch (error) {
      console.error('Error checking biometric availability:', error);
    }
  };

  // Handle Expo Auth Session response
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        handleAuthSuccess(id_token);
      }
    } else if (response?.type === 'error') {
      console.error('Auth error:', response.error);
      Alert.alert('Sign In Error', 'Failed to sign in with Google');
      setLoading(false);
    } else if (response?.type === 'cancel') {
      setLoading(false);
    }
  }, [response]);

  const handleAuthSuccess = async (idToken: string) => {
    try {
      await onGoogleSignIn(idToken);
    } catch (error: any) {
      console.error('Sign in error:', error);
      Alert.alert('Sign In Failed', error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    promptAsync();
  };

  const handleBiometricSignIn = async () => {
    if (!onBiometricAuth) return;

    setBiometricLoading(true);
    try {
      const result = await authenticate('Sign in to AUX');
      if (result.success) {
        await onBiometricAuth();
      } else {
        Alert.alert('Authentication Failed', result.error || 'Could not authenticate with biometrics');
      }
    } catch (error: any) {
      console.error('Biometric auth error:', error);
      Alert.alert('Error', 'An error occurred during biometric authentication');
    } finally {
      setBiometricLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
      </View>

      <View style={styles.logoContainer}>
        <Text style={styles.logoLines}>///.</Text>
        <Text style={styles.subtitle}>
          Create a profile, follow other people's accounts,
          create your own playlist and much more.
        </Text>
      </View>

      <View style={styles.authSection}>
        {showBiometric && (
          <TouchableOpacity
            style={[styles.biometricButton, biometricLoading && styles.disabledButton]}
            onPress={handleBiometricSignIn}
            disabled={biometricLoading}
          >
            {biometricLoading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <Ionicons
                  name={biometricType === 'facial' ? 'scan-outline' : 'finger-print-outline'}
                  size={24}
                  color={Colors.white}
                  style={styles.biometricIcon}
                />
                <Text style={styles.biometricButtonLabel}>Sign in with {getBiometricLabel()}</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.googleButton, (loading || !request) && styles.disabledButton]}
          onPress={handleGoogleSignIn}
          disabled={loading || !request}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <>
              <Text style={styles.googleButtonText}>G</Text>
              <Text style={styles.googleButtonLabel}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.termsText}>
          By continuing, you agree to AUX's{' '}
          <Text style={styles.link}>Terms of Service</Text>
          {'\n'}and{' '}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>
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
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  language: {
    fontSize: 14,
    color: Colors.darkGray,
  },
  logoContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 40,
    marginBottom: 60,
  },
  logoLines: {
    fontSize: 64,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.darkGray,
    textAlign: 'center',
    lineHeight: 20,
  },
  authSection: {
    paddingHorizontal: 30,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  biometricIcon: {
    marginRight: 10,
  },
  biometricButtonLabel: {
    fontSize: 15,
    color: Colors.white,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.mediumGray,
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  googleButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginRight: 15,
  },
  googleButtonLabel: {
    fontSize: 15,
    color: Colors.black,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
  termsText: {
    fontSize: 12,
    color: Colors.darkGray,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  link: {
    color: Colors.black,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 30,
  },
});
