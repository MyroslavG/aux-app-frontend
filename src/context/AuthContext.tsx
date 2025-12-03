import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { User as ApiUser } from '../types/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: ApiUser | null;
  loading: boolean;
  signIn: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing auth token on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      console.log('🔑 Token status:', {
        hasAccessToken: !!token,
        hasRefreshToken: !!refreshToken
      });

      if (token) {
        // Verify token is still valid by fetching user
        // If access token is expired, the api interceptor will automatically
        // use the refresh token to get a new access token
        const userData = await api.getCurrentUser();
        console.log('✅ Auth check successful, user:', userData.username);
        setUser(userData);
        setIsAuthenticated(true);
      } else if (refreshToken) {
        // If we have a refresh token but no access token, try to refresh
        console.log('🔄 No access token but refresh token exists, attempting refresh...');
        try {
          const userData = await api.getCurrentUser();
          console.log('✅ Token refresh successful via getCurrentUser, user:', userData.username);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (refreshError) {
          console.log('❌ Refresh failed, clearing all tokens');
          // Only clear if refresh fails
          await AsyncStorage.removeItem('access_token');
          await AsyncStorage.removeItem('refresh_token');
          await AsyncStorage.removeItem('user');
        }
      }
    } catch (error: any) {
      console.log('⚠️ Auth check error:', error.response?.status, error.message);
      // If it's a 401 and we have a refresh token, the interceptor should handle it
      // Don't immediately clear the refresh token - let the interceptor try
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) {
        // Only clear if no refresh token exists
        console.log('❌ No refresh token available, clearing storage');
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('user');
      } else {
        console.log('🔄 Error occurred but refresh token exists, interceptor should handle it');
        // The interceptor will handle the refresh, but if we're here it failed
        // Clear everything if we got an error and couldn't recover
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        await AsyncStorage.removeItem('user');
      }
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (idToken: string) => {
    try {
      const response = await api.googleSignIn(idToken);

      // Store tokens and user data
      await AsyncStorage.setItem('access_token', response.access_token);
      await AsyncStorage.setItem('refresh_token', response.refresh_token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));

      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear storage
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('user');

      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
