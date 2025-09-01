const fs = require('fs');
require('dotenv').config();

module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      ...(config.extra || {}),
      // support either SUPABASE_* or EXPO_PUBLIC_SUPABASE_* naming in .env
      SUPABASE_URL: process.env.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
      SUPABASE_FUNCTIONS_URL: process.env.SUPABASE_FUNCTIONS_URL ?? '',
      ADMIN_API_KEY: process.env.ADMIN_API_KEY ?? '',
    },
  };
};
