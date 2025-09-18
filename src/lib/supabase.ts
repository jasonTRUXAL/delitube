import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  email: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  is_admin: boolean;
};

export type Video = {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail_url: string;
  user_id: string;
  created_at: string;
  views: number;
  likes: number;
  user?: User;
};

export type Comment = {
  id: string;
  content: string;
  user_id: string;
  video_id: string;
  created_at: string;
  user?: User;
};