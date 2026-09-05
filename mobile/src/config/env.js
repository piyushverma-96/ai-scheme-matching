// Safe environment variable accessor for React Native with Expo
export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000',
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
};
