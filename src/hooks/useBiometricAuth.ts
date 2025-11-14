import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometricType?: 'fingerprint' | 'facial' | 'iris' | 'none';
}

export const useBiometricAuth = () => {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'facial' | 'iris' | 'none'>('none');

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      // Check if hardware is available
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      console.log('📱 Biometric hardware available:', hasHardware);

      if (!hasHardware) {
        setIsBiometricSupported(false);
        return;
      }

      // Check if biometrics are enrolled
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      console.log('🔐 Biometrics enrolled:', enrolled);
      setIsEnrolled(enrolled);

      // Get supported authentication types
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      console.log('🔑 Supported auth types:', supportedTypes);

      // Determine biometric type
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('facial');
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('fingerprint');
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        setBiometricType('iris');
      } else {
        setBiometricType('none');
      }

      setIsBiometricSupported(hasHardware && enrolled);
    } catch (error) {
      console.error('❌ Error checking biometric support:', error);
      setIsBiometricSupported(false);
    }
  };

  const authenticate = async (promptMessage?: string): Promise<BiometricAuthResult> => {
    try {
      if (!isBiometricSupported) {
        return {
          success: false,
          error: 'Biometric authentication is not available on this device',
          biometricType: 'none',
        };
      }

      console.log('🔓 Attempting biometric authentication...');
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage || 'Authenticate to continue',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
      });

      console.log('✅ Authentication result:', result.success);

      if (result.success) {
        return {
          success: true,
          biometricType,
        };
      } else {
        return {
          success: false,
          error: result.error || 'Authentication failed',
          biometricType,
        };
      }
    } catch (error: any) {
      console.error('❌ Biometric authentication error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred during authentication',
        biometricType: 'none',
      };
    }
  };

  const getBiometricLabel = (): string => {
    switch (biometricType) {
      case 'facial':
        return 'Face ID';
      case 'fingerprint':
        return 'Touch ID';
      case 'iris':
        return 'Iris Recognition';
      default:
        return 'Biometric';
    }
  };

  return {
    isBiometricSupported,
    isEnrolled,
    biometricType,
    authenticate,
    getBiometricLabel,
    checkBiometricSupport,
  };
};
