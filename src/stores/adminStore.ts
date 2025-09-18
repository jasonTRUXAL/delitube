import { create } from 'zustand';
import { supabase, User } from '../lib/supabase';
import { API_ENDPOINTS } from '../utils/constants';
import { toast } from 'sonner';

type AdminState = {
  users: User[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
  deleteUser: (userId: string, options?: {
    preserveVideos: boolean;
    preserveComments: boolean;
    anonymizeContent: boolean;
  }) => Promise<void>;
  toggleAdminStatus: (userId: string, isAdmin: boolean) => Promise<void>;
  getUserContentCounts: (userId: string) => Promise<{ videoCount: number; commentCount: number }>;
  getUserDetails: (userId: string) => Promise<any>;
};

export const useAdminStore = create<AdminState>((set, get) => ({
  users: [],
  loading: false,
  
  fetchUsers: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      set({ users: data, loading: false });
    } catch (error: any) {
      toast.error('Failed to fetch users');
      set({ loading: false });
    }
  },
  
  getUserContentCounts: async (userId: string) => {
    try {
      // Get video count
      const { count: videoCount, error: videoError } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (videoError) throw videoError;
      
      // Get comment count
      const { count: commentCount, error: commentError } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (commentError) throw commentError;
      
      return {
        videoCount: videoCount || 0,
        commentCount: commentCount || 0
      };
    } catch (error) {
      console.error('Failed to get user content counts:', error);
      return { videoCount: 0, commentCount: 0 };
    }
  },

  getUserDetails: async (userId: string) => {
    try {
      // Get user's videos with their comments
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select(`
          *,
          comments(
            id,
            content,
            created_at,
            user:profiles(id, username, avatar_url)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (videosError) throw videosError;
      
      // Get user's comments on other people's videos
      const { data: commentsOnOtherVideos, error: commentsError } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          video_id,
          video:videos(
            id,
            title,
            thumbnail_url,
            user:profiles(id, username)
          )
        `)
        .eq('user_id', userId)
        .not('video.user_id', 'eq', userId)
        .order('created_at', { ascending: false });
      
      if (commentsError) throw commentsError;
      
      // Calculate totals
      const totalViews = videos?.reduce((sum, video) => sum + (video.views || 0), 0) || 0;
      
      // Calculate total comments correctly:
      // Comments on own videos + comments on other people's videos
      const commentsOnOwnVideos = videos?.reduce((sum, video) => sum + (video.comments?.length || 0), 0) || 0;
      const commentsOnOthersVideos = commentsOnOtherVideos?.length || 0;
      const totalComments = commentsOnOwnVideos + commentsOnOthersVideos;
      
      return {
        videos: videos || [],
        commentsOnOtherVideos: commentsOnOtherVideos || [],
        commentsOnOwnVideos, // Add this for clarity
        commentsOnOthersVideos, // Add this for clarity
        totalViews,
        totalComments
      };
    } catch (error) {
      console.error('Failed to get user details:', error);
      throw error;
    }
  },
  
  deleteUser: async (userId, options = {
    preserveVideos: true,
    preserveComments: true,
    anonymizeContent: true
  }) => {
    try {
      // Get the current session to include auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      // Call the edge function to delete the user
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}${API_ENDPOINTS.deleteUser}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          options
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }

      // Update local state
      set(state => ({
        users: state.users.filter(u => u.id !== userId)
      }));

      toast.success(result.message);
    } catch (error: any) {
      console.error('Delete user error:', error);
      toast.error(error.message || 'Failed to delete user');
      throw error;
    }
  },
  
  toggleAdminStatus: async (userId, isAdmin) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: isAdmin })
        .eq('id', userId);
      
      if (error) throw error;
      
      set(state => ({
        users: state.users.map(u => 
          u.id === userId ? { ...u, is_admin: isAdmin } : u
        )
      }));
      
      toast.success(`User is ${isAdmin ? 'now' : 'no longer'} an admin`);
    } catch (error: any) {
      toast.error('Failed to update admin status');
    }
  },
}));