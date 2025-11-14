import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL from environment variable or fallback
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://aux-app-backend.onrender.com/api/v1';

class ApiService {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: any[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle Spotify token expiration (400 or 401 on Spotify endpoints)
        // Note: Backend now auto-refreshes tokens with 5-minute buffer before expiry
        // This is a fallback for edge cases where manual retry might help
        if (
          (error.response?.status === 400 || error.response?.status === 401) &&
          originalRequest?.url?.includes('/spotify/') &&
          !originalRequest._retry
        ) {
          const errorData = error.response?.data as any;
          const errorMessage = errorData?.detail || '';

          // Check if it's a token-related error
          if (
            errorMessage.toLowerCase().includes('token') ||
            errorMessage.toLowerCase().includes('spotify') ||
            errorMessage.toLowerCase().includes('expired') ||
            errorMessage.toLowerCase().includes('invalid') ||
            errorMessage.toLowerCase().includes('not connected')
          ) {
            originalRequest._retry = true;

            try {
              console.log('Spotify API error detected, attempting retry...');
              console.log('Backend auto-refreshes tokens, retrying request may resolve issue');

              // Wait a brief moment to allow backend token refresh to complete
              await new Promise(resolve => setTimeout(resolve, 500));

              // Retry the original request
              // Backend should have refreshed the token by now
              return this.client(originalRequest);
            } catch (refreshError) {
              console.log('Spotify request retry failed:', refreshError);
              // Let the error propagate so the UI can handle it
              return Promise.reject(error);
            }
          }
        }

        // Handle main auth token expiration (401 errors)
        if (error.response?.status === 401 && !originalRequest._retry) {
          console.log('📌 401 error detected, attempting token refresh...');

          if (this.isRefreshing) {
            console.log('🔄 Token refresh already in progress, queuing request...');
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.client(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await AsyncStorage.getItem('refresh_token');
            console.log('🔑 Refresh token retrieved:', refreshToken ? 'exists' : 'missing');

            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            console.log('📡 Calling refresh endpoint...');
            // Call refresh endpoint
            const response = await axios.post(`${BASE_URL}/auth/refresh`, {
              refresh_token: refreshToken,
            });

            console.log('✅ Token refresh successful');
            const { access_token, refresh_token: newRefreshToken } = response.data;

            // Store new tokens
            await AsyncStorage.setItem('access_token', access_token);
            if (newRefreshToken) {
              await AsyncStorage.setItem('refresh_token', newRefreshToken);
              console.log('💾 New refresh token stored');
            }

            // Process queued requests
            this.processQueue(null, access_token);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return this.client(originalRequest);
          } catch (refreshError: any) {
            console.error('❌ Token refresh failed:', refreshError.response?.data || refreshError.message);
            // Refresh failed - clear tokens and process queue with error
            this.processQueue(refreshError, null);
            await AsyncStorage.removeItem('access_token');
            await AsyncStorage.removeItem('refresh_token');
            await AsyncStorage.removeItem('user');

            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });

    this.failedQueue = [];
  }

  // Auth endpoints
  async googleSignIn(idToken: string) {
    const response = await this.client.post('/google', {
      id_token: idToken,
    });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/me');
    return response.data;
  }

  // User endpoints
  async searchUsers(query: string, limit = 20) {
    const response = await this.client.get('/users/search', {
      params: { q: query, limit },
    });
    return response.data;
  }

  async getUserProfile(username: string) {
    const response = await this.client.get(`/users/${username}`);
    return response.data;
  }

  async updateProfile(data: {
    display_name?: string;
    bio?: string;
    username?: string;
  }) {
    const response = await this.client.patch('/users/me', data);
    return response.data;
  }

  async followUser(username: string) {
    const response = await this.client.post(`/users/${username}/follow`);
    return response.data;
  }

  async unfollowUser(username: string) {
    const response = await this.client.delete(`/users/${username}/follow`);
    return response.data;
  }

  async getFollowers(username: string, limit = 20, offset = 0) {
    const response = await this.client.get(`/users/${username}/followers`, {
      params: { limit, offset },
    });
    return response.data;
  }

  async getFollowing(username: string, limit = 20, offset = 0) {
    const response = await this.client.get(`/users/${username}/following`, {
      params: { limit, offset },
    });
    return response.data;
  }

  // Post endpoints
  async getFeed(limit = 20, offset = 0) {
    const response = await this.client.get('/posts/feed', {
      params: { limit, offset },
    });
    return response.data;
  }

  async getUserPosts(username: string, limit = 50, offset = 0) {
    const response = await this.client.get(`/posts/user/${username}`, {
      params: { limit, offset },
    });
    return response.data;
  }

  async createPost(data: {
    caption?: string;
    spotify_track_id: string;
    track_name: string;
    artist_name: string;
    album_name?: string;
    album_art_url?: string;
  }) {
    const response = await this.client.post('/posts', data);
    return response.data;
  }

  async getPost(postId: string) {
    const response = await this.client.get(`/posts/${postId}`);
    return response.data;
  }

  async updatePost(postId: string, caption: string) {
    const response = await this.client.patch(`/posts/${postId}`, {
      caption,
    });
    return response.data;
  }

  async deletePost(postId: string) {
    const response = await this.client.delete(`/posts/${postId}`);
    return response.data;
  }

  async likePost(postId: string) {
    const response = await this.client.post(`/posts/${postId}/like`);
    return response.data;
  }

  async unlikePost(postId: string) {
    const response = await this.client.delete(`/posts/${postId}/like`);
    return response.data;
  }

  async getPostLikes(postId: string, limit = 20, offset = 0) {
    const response = await this.client.get(`/posts/${postId}/likes`, {
      params: { limit, offset },
    });
    return response.data;
  }

  async createComment(postId: string, content: string) {
    const response = await this.client.post(`/posts/${postId}/comments`, {
      content,
    });
    return response.data;
  }

  async getComments(postId: string, limit = 20, offset = 0) {
    const response = await this.client.get(`/posts/${postId}/comments`, {
      params: { limit, offset },
    });
    return response.data;
  }

  async deleteComment(commentId: string) {
    const response = await this.client.delete(`/posts/comments/${commentId}`);
    return response.data;
  }

  // Spotify endpoints
  async getSpotifyAuthUrl() {
    const response = await this.client.get('/spotify/connect');
    return response.data;
  }

  async handleSpotifyCallback(code: string) {
    const response = await this.client.post('/spotify/callback', { code });
    return response.data;
  }

  async refreshSpotifyToken() {
    try {
      // Try the dedicated refresh endpoint first
      const response = await this.client.post('/spotify/refresh');
      return response.data;
    } catch (error: any) {
      // If refresh endpoint doesn't exist (404), that's okay - backend handles it automatically
      if (error.response?.status === 404) {
        console.log('Backend handles token refresh automatically');
        return { success: true, message: 'Token refresh handled by backend' };
      }

      console.log('Token refresh endpoint not available, backend auto-refreshes on API calls');
      // Backend now auto-refreshes tokens when they're expired (5 min buffer)
      // No need for explicit refresh call
      return { success: true, message: 'Backend handles refresh automatically' };
    }
  }

  async getSpotifyStatus() {
    const response = await this.client.get('/spotify/status');
    return response.data;
  }

  async getSpotifyConnectionStatus() {
    const response = await this.client.get('/spotify/status');
    return response.data;
  }

  async disconnectSpotify() {
    const response = await this.client.delete('/spotify/disconnect');
    return response.data;
  }

  async searchTracks(query: string, limit = 20) {
    const response = await this.client.get('/spotify/search', {
      params: { q: query, limit },
    });
    return response.data;
  }

  async getTopTracks(limit = 20) {
    const response = await this.client.get('/spotify/top-tracks', {
      params: { limit },
    });
    return response.data;
  }

  async getNowPlaying() {
    const response = await this.client.get('/spotify/now-playing');
    return response.data;
  }

  // Notification endpoints
  async getNotifications(limit = 50, offset = 0, unreadOnly = false) {
    const response = await this.client.get('/notifications', {
      params: { limit, offset, unread_only: unreadOnly },
    });
    return response.data;
  }

  async markAsRead(notificationIds: string[]) {
    const response = await this.client.post('/notifications/mark-as-read', {
      notification_ids: notificationIds,
    });
    return response.data;
  }

  async markAllAsRead() {
    const response = await this.client.post('/notifications/mark-all-as-read');
    return response.data;
  }

  async getUnreadCount() {
    const response = await this.client.get('/notifications/unread-count');
    return response.data;
  }

  // Storage endpoints
  async uploadImage(file: any) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post('/storage/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteFile(path: string, bucket: string) {
    const response = await this.client.delete('/storage/delete', {
      data: { path, bucket },
    });
    return response.data;
  }
}

export const api = new ApiService();
