/**
 * Backend Configuration for Global Leaderboard
 * Toggle feature and store API keys
 */

export const BACKEND_CONFIG = {
    // Set to true to enable the global leaderboard
    // If false, the game will fall back to local storage only
    USE_GLOBAL_LEADERBOARD: true,

    // Supabase Configuration
    // You can find these in your Supabase project settings -> API
    SUPABASE_URL: 'https://tnaoeplwdtwzwzlaabjv.supabase.co', // e.g., 'https://your-project.supabase.co'
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuYW9lcGx3ZHR3end6bGFhYmp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTMxNzQsImV4cCI6MjA4Mzg4OTE3NH0.jv3I0d8Tyl1PsEaDvvvBqRUqsYqPqLiLFdHxW9P8qZ0', // Your public anon key

    // Database Table Name
    TABLE_NAME: 'leaderboard',

    // Settings
    MAX_TOP_SCORES: 10
};
