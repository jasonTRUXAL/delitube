import { create } from 'zustand';
import { supabase, Video } from '../lib/supabase';
import { toast } from 'sonner';

type VideoState = {
  videos: Video[];
  recentVideos: Video[];
  currentVideo: Video | null;
  loading: boolean;
  searchQuery: string;
  fetchVideos: () => Promise<void>;
  fetchRecentVideos: (limit?: number) => Promise<void>;
  fetchVideoById: (id: string) => Promise<void>;
  searchVideos: (query: string) => Promise<void>;
  uploadVideo: (videoFile: File, thumbnailFile: File, title: string, description: string) => Promise<void>;
  incrementViews: (videoId: string) => Promise<void>;
  deleteVideo: (videoId: string) => Promise<void>;
  likeVideo: (videoId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
};

export const useVideoStore = create<VideoState>((set, get) => ({
  videos: [],
  recentVideos: [],
  currentVideo: null,
  loading: false,
  searchQuery: '',
  
  fetchVideos: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          user:profiles(id, username, avatar_url)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      set({ videos: data, loading: false });
    } catch (error: any) {
      toast.error('Failed to fetch videos');
      set({ loading: false });
    }
  },
  
  fetchRecentVideos: async (limit = 8) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          user:profiles(id, username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      set({ recentVideos: data, loading: false });
    } catch (error: any) {
      toast.error('Failed to fetch recent videos');
      set({ loading: false });
    }
  },
  
  fetchVideoById: async (id) => {
    set({ loading: true, currentVideo: null });
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          user:profiles(id, username, avatar_url)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      set({ currentVideo: data, loading: false });
    } catch (error: any) {
      toast.error('Failed to fetch video');
      set({ loading: false });
    }
  },
  
  searchVideos: async (query) => {
    set({ loading: true, searchQuery: query });
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          user:profiles(id, username, avatar_url)
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      set({ videos: data, loading: false });
    } catch (error: any) {
      toast.error('Failed to search videos');
      set({ loading: false });
    }
  },
  
  uploadVideo: async (videoFile, thumbnailFile, title, description) => {
    set({ loading: true });
    try {
      // Upload video
      const videoFileName = `${Date.now()}_${videoFile.name}`;
      const { error: videoUploadError } = await supabase.storage
        .from('videos')
        .upload(videoFileName, videoFile);
      
      if (videoUploadError) throw videoUploadError;
      
      // Upload thumbnail
      const thumbnailFileName = `${Date.now()}_${thumbnailFile.name}`;
      const { error: thumbnailUploadError } = await supabase.storage
        .from('thumbnails')
        .upload(thumbnailFileName, thumbnailFile);
      
      if (thumbnailUploadError) throw thumbnailUploadError;
      
      // Get URLs
      const videoUrl = supabase.storage.from('videos').getPublicUrl(videoFileName).data.publicUrl;
      const thumbnailUrl = supabase.storage.from('thumbnails').getPublicUrl(thumbnailFileName).data.publicUrl;
      
      // Create video record
      const { error: insertError } = await supabase
        .from('videos')
        .insert({
          title,
          description,
          url: videoUrl,
          thumbnail_url: thumbnailUrl,
          views: 0,
          likes: 0,
        });
      
      if (insertError) throw insertError;
      
      toast.success('Video uploaded successfully!');
      await get().fetchVideos();
      set({ loading: false });
    } catch (error: any) {
      toast.error('Failed to upload video');
      set({ loading: false });
    }
  },
  
  incrementViews: async (videoId) => {
    try {
      const { currentVideo } = get();
      if (!currentVideo) return;
      
      await supabase.rpc('increment_views', { video_id: videoId });
      
      set({
        currentVideo: { 
          ...currentVideo, 
          views: currentVideo.views + 1 
        }
      });
    } catch (error) {
      console.error('Failed to increment views', error);
    }
  },
  
  deleteVideo: async (videoId) => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);
      
      if (error) throw error;
      
      toast.success('Video deleted successfully');
      await get().fetchVideos();
    } catch (error: any) {
      toast.error('Failed to delete video');
    }
  },
  
  likeVideo: async (videoId) => {
    try {
      const { currentVideo } = get();
      if (!currentVideo) return;
      
      await supabase.rpc('increment_likes', { video_id: videoId });
      
      set({
        currentVideo: { 
          ...currentVideo, 
          likes: currentVideo.likes + 1 
        }
      });
    } catch (error) {
      console.error('Failed to like video', error);
    }
  },
  
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },
}));