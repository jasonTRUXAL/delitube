import { create } from 'zustand';
import { supabase, Hashtag } from '../lib/supabase';
import { toast } from 'sonner';

type HashtagState = {
  hashtags: Hashtag[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  fetchHashtags: () => Promise<void>;
  createHashtag: (name: string) => Promise<Hashtag>;
  addHashtagsToVideo: (videoId: string, hashtagNames: string[]) => Promise<void>;
  removeHashtagsFromVideo: (videoId: string) => Promise<void>;
  getVideoHashtags: (videoId: string) => Promise<Hashtag[]>;
  getVideosByHashtag: (hashtagName: string, page?: number, pageSize?: number) => Promise<void>;
  setCurrentPage: (page: number) => void;
};

export const useHashtagStore = create<HashtagState>((set, get) => ({
  hashtags: [],
  loading: false,
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  pageSize: 12,
  
  fetchHashtags: async () => {
    set({ loading: true });
    try {
      // Get hashtags ordered by usage count
      const { data, error } = await supabase
        .from('hashtags')
        .select(`
          *,
          video_count:video_hashtags(count)
        `)
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      // Sort by usage count (most used first), then by name
      const sortedHashtags = data.sort((a, b) => {
        const aCount = a.video_count?.[0]?.count || 0;
        const bCount = b.video_count?.[0]?.count || 0;
        if (bCount !== aCount) return bCount - aCount;
        return a.name.localeCompare(b.name);
      });
      
      set({ hashtags: sortedHashtags, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch hashtags:', error);
      set({ loading: false });
    }
  },
  
  createHashtag: async (name) => {
    try {
      // Normalize hashtag name (lowercase, no spaces, no special chars except underscore)
      const normalizedName = name.toLowerCase().replace(/[^a-z0-9_]/g, '').substring(0, 30);
      
      if (!normalizedName) {
        throw new Error('Invalid hashtag name');
      }
      
      // Check if hashtag already exists - use maybeSingle() to handle zero results
      const { data: existing } = await supabase
        .from('hashtags')
        .select('*')
        .eq('name', normalizedName)
        .maybeSingle();
      
      if (existing) {
        return existing;
      }
      
      // Create new hashtag
      const { data, error } = await supabase
        .from('hashtags')
        .insert({ name: normalizedName })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      set(state => ({
        hashtags: [...state.hashtags, data].sort((a, b) => a.name.localeCompare(b.name))
      }));
      
      return data;
    } catch (error: any) {
      console.error('Failed to create hashtag:', error);
      throw error;
    }
  },
  
  addHashtagsToVideo: async (videoId, hashtagNames) => {
    try {
      // Remove existing hashtags for this video
      await get().removeHashtagsFromVideo(videoId);
      
      // Limit to 3 hashtags
      const limitedHashtags = hashtagNames.slice(0, 3);
      
      if (limitedHashtags.length === 0) return;
      
      // Create or get hashtags
      const hashtags = await Promise.all(
        limitedHashtags.map(name => get().createHashtag(name))
      );
      
      // Create video-hashtag relationships
      const videoHashtags = hashtags.map(hashtag => ({
        video_id: videoId,
        hashtag_id: hashtag.id
      }));
      
      const { error } = await supabase
        .from('video_hashtags')
        .insert(videoHashtags);
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Failed to add hashtags to video:', error);
      throw error;
    }
  },
  
  removeHashtagsFromVideo: async (videoId) => {
    try {
      const { error } = await supabase
        .from('video_hashtags')
        .delete()
        .eq('video_id', videoId);
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Failed to remove hashtags from video:', error);
      throw error;
    }
  },
  
  getVideoHashtags: async (videoId) => {
    try {
      const { data, error } = await supabase
        .from('video_hashtags')
        .select(`
          hashtag:hashtags(*)
        `)
        .eq('video_id', videoId);
      
      if (error) throw error;
      
      return data.map(item => item.hashtag).filter(Boolean);
    } catch (error: any) {
      console.error('Failed to get video hashtags:', error);
      return [];
    }
  },
  
  getVideosByHashtag: async (hashtagName, page = 1, pageSize = 12) => {
    set({ loading: true, currentPage: page });
    try {
      // First get total count for this hashtag
      const { data: hashtagData, error: hashtagError } = await supabase
        .from('hashtags')
        .select('id')
        .eq('name', hashtagName)
        .single();
      
      if (hashtagError) throw hashtagError;
      
      const { count, error: countError } = await supabase
        .from('video_hashtags')
        .select('*', { count: 'exact', head: true })
        .eq('hashtag_id', hashtagData.id);
      
      if (countError) throw countError;
      
      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);
      
      // Get paginated videos for this hashtag
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error } = await supabase.rpc('get_videos_by_hashtag', {
        hashtag_name: hashtagName
      });
      
      if (error) throw error;
      
      // Apply pagination to the results
      const paginatedData = data.slice(from, to + 1);
      
      // Fetch user data for the videos
      const videoIds = paginatedData.map(v => v.id);
      const { data: videosWithUsers, error: usersError } = await supabase
        .from('videos')
        .select(`
          *,
          user:profiles(id, username, avatar_url)
        `)
        .in('id', videoIds);
      
      if (usersError) throw usersError;
      
      // Merge the data maintaining the order from the hashtag query
      const videosWithHashtags = paginatedData.map(hashtagVideo => {
        const videoWithUser = videosWithUsers?.find(v => v.id === hashtagVideo.id);
        return videoWithUser || hashtagVideo;
      });
      
      // Update the video store with filtered results
      const { useVideoStore } = await import('./videoStore');
      useVideoStore.setState({ 
        videos: videosWithHashtags, 
        loading: false,
        totalCount,
        totalPages,
        currentPage: page,
        pageSize
      });
      
      set({ loading: false, totalCount, totalPages, currentPage: page, pageSize });
    } catch (error: any) {
      console.error('Failed to get videos by hashtag:', error);
      toast.error('FAILED TO FETCH VIDEOS BY HASHTAG');
      set({ loading: false, totalCount: 0, totalPages: 1 });
    }
  },
  
  setCurrentPage: (page) => {
    set({ currentPage: page });
  },
}));