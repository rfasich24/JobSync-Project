// supabase.js
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// TAMBAHKAN LOG INI:
console.log("Supabase Config:", { supabaseUrl, hasKey: !!supabaseAnonKey });

export const supabase = createClient(supabaseUrl, supabaseAnonKey);