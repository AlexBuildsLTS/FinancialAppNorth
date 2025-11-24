import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { secureStorage } from './secureStorage';

// Hardcoded keys to guarantee connection
const supabaseUrl = 'https://qnrxncngoqphnerdrnnc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFucnhuY25nb3FwaG5lcmRybm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NzcyMTksImV4cCI6MjA3OTA1MzIxOX0.HSPju4exb2ZwnJsqpzQlqtUSN3tNUdkMhAca32hTepE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});