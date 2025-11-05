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
}

export interface SpotifyStatus {
  connected: boolean;
  user_id?: string;
}

// Notification types
export type NotificationType = 'like' | 'comment' | 'follow';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  is_read: boolean;
  created_at: string;
  actor: User;
  post_id?: string;
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
