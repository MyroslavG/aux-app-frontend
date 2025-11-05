import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL from environment variable or fallback
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://aux-app-backend.onrender.com/api/v1';

class ApiService {
  private client: AxiosInstance;

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
        if (error.response?.status === 401) {
          // Token expired or invalid - clear storage and redirect to login
          await AsyncStorage.removeItem('access_token');
          await AsyncStorage.removeItem('user');
        }
        return Promise.reject(error);
      }
    );
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

  async markAsRead(notificationId: string) {
    const response = await this.client.put(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  }

  async markAllAsRead() {
    const response = await this.client.put('/notifications/read-all');
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
