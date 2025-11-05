// Google OAuth Configuration
// The Web Client ID is loaded from the .env file
// In Expo, environment variables prefixed with EXPO_PUBLIC_ are accessible via process.env

export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  '1036194485911-m8j51i4a51tu2m2n97gegekuhbr5hj71.apps.googleusercontent.com';

// Note: This should be the same Client ID that your backend uses for verification
// Your backend has the Client Secret, the frontend only needs the Client ID
