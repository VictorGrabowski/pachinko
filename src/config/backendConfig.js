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
    SUPABASE_ANON_KEY: 'sb_publishable_YrwypUd14fWskQeAZBO1bA_Herf7nsq', // Your public anon key

    // Database Table Name
    TABLE_NAME: 'leaderboard',

    // Settings
    MAX_TOP_SCORES: 10
};
