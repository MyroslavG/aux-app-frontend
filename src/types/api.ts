// User types
export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  profile_image_url?: string;
  bio?: string;
  spotify_connected?: boolean;
  created_at: string;
}

export interface UserWithStats extends User {
  followers_count: number;
  following_count: number;
  posts_count: number;
  is_following?: boolean;
}

// Auth types
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

// Post types
export interface Post {
  id: string;
  user_id: string;
  spotify_track_id: string;
  track_name: string;
  artist_name: string;
  album_art_url?: string;
  caption?: string;
  spotify_uri?: string; // Spotify URI for deep linking
  created_at: string;
  updated_at: string;
  user: User;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: User;
}

// Spotify types
export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  album_art_url?: string;
  preview_url?: string;
  duration_ms: number;
  uri?: string; // Spotify URI for deep linking (e.g., spotify:track:6rqhFgbbKwnb9MLmUQDhG6)
}

export interface SpotifyStatus {
  connected: boolean;
  user_id?: string;
}

// Notification types
export type NotificationType = 'like' | 'comment' | 'follow';

export interface NotificationActor {
  id: string;
  username: string;
  display_name?: string;
  profile_image_url?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body?: string;
  data?: {
    follower_id?: string;
    post_id?: string;
    [key: string]: any;
  };
  is_read: boolean;
  created_at: string;
  actor?: NotificationActor; // New field with current user data
}

// API Response types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface ErrorResponse {
  detail: string;
}
