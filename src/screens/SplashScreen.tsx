import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2000); // Show splash for 2 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoLines}>///.</Text>
        <Text style={styles.logoText}>AUX</Text>
      </View>
      <Text style={styles.versionText}>Version 1.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoLines: {
    fontSize: 72,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: -10,
  },
  logoText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: Colors.white,
    letterSpacing: 4,
  },
  versionText: {
    position: 'absolute',
    bottom: 60,
    fontSize: 14,
    color: Colors.white,
    opacity: 0.8,
  },
});
