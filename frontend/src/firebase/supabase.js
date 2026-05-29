import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://iqgixtyaktxpbottjwbb.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_8uCNNh04Zddmtf3Hv2Jm7g_I2eLKU-n";

// Initialize Supabase Client
export const supabase = (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("YOUR_SUPABASE")) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const isSupabaseActive = !!supabase;
export default supabase;
