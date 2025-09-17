import { create } from 'zustand';
import { supabase, Video } from '../lib/supabase';
import { useHashtagStore } from './hashtagStore';
import { STORAGE_KEYS } from '../utils/constants';
import { toast } from 'sonner';

type VideoState = {
  videos: Video[];
  recentVideos: Video[];
  currentVideo: Video | null;
  loading: boolean;
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  isSearchMode: boolean; // New flag to track if we're in search mode
  fetchVideos: (page?: number, pageSize?: number) => Promise<void>;
  fetchRecentVideos: (limit?: number) => Promise<void>;
  fetchVideoById: (id: string) => Promise<void>;
  searchVideos: (query: string, page?: number, pageSize?: number) => Promise<void>;
  uploadVideo: (videoFile: File, thumbnailFile: File, title: string, description: string, hashtags?: string[]) => Promise<void>;
  updateVideo: (id: string, updates: { title: string; description: string; thumbnailFile?: File | null; hashtags?: string[] }) => Promise<void>;
  incrementViews: (videoId: string) => Promise<void>;
  deleteVideo: (videoId: string) => Promise<void>;
  likeVideo: (videoId: string) => Promise<void>;
  hasLikedVideo: (videoId: string) => boolean;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void; // New method to clear search state
  setCurrentPage: (page: number) => void;
  fetchRelatedVideos: (videoId: string, limit?: number) => Promise<Video[]>;
};

// Helper function to safely fetch hashtags for videos
const fetchHashtagsForVideos = async (videos: Video[]): Promise<Video[]> => {
  if (!Array.isArray(videos) || videos.length === 0) {
    return [];
  }

  try {
    const videosWithHashtags: Video[] = [];
    
    // Process videos in batches to avoid overwhelming the database
    for (const video of videos) {
      try {
        const { data: hashtagData, error } = await supabase
          .from('video_hashtags')
          .select(`
            hashtag:hashtags(*)
          `)
          .eq('video_id', video.id);
        
        if (error) {
          console.warn(`Failed to fetch hashtags for video ${video.id}:`, error);
          videosWithHashtags.push({ ...video, hashtags: [] });
          continue;
        }
        
        const hashtags = Array.isArray(hashtagData) 
          ? hashtagData
              .map(item => item.hashtag)
              .filter(hashtag => hashtag && typeof hashtag === 'object' && hashtag.id)
          : [];
        
        videosWithHashtags.push({ ...video, hashtags });
      } catch (error) {
        console.warn(`Error processing hashtags for video ${video.id}:`, error);
        videosWithHashtags.push({ ...video, hashtags: [] });
      }
    }
    
    return videosWithHashtags;
  } catch (error) {
    console.warn('Failed to fetch hashtags for videos:', error);
    return videos.map(video => ({ ...video, hashtags: [] }));
  }
};

// Helper function to safely score videos
const scoreVideo = (video: Video, query: string, queryWords: string[], videoHashtags: string[]): number => {
  let score = 0;
  
  try {
    const title = (video.title || '').toLowerCase();
    const description = (video.description || '').toLowerCase();
    const hashtagText = videoHashtags.join(' ').toLowerCase();

    // Exact matches (highest priority)
    if (title === query.toLowerCase()) score += 100;
    if (title.includes(query.toLowerCase())) score += 50;
    
    // Hashtag matches
    if (videoHashtags.some(tag => tag.toLowerCase() === query.toLowerCase())) score += 80;
    if (hashtagText.includes(query.toLowerCase())) score += 40;

    // Word-by-word scoring
    for (const word of queryWords) {
      if (!word) continue;
      
      // Title word matches
      const titleWords = title.split(/\s+/).filter(Boolean);
      if (titleWords.some(titleWord => titleWord === word)) score += 30;
      if (title.includes(word)) score += 20;
      
      // Hashtag word matches
      if (videoHashtags.some(tag => tag.includes(word))) score += 25;
      
      // Description word matches
      const descWords = description.split(/\s+/).filter(Boolean);
      if (descWords.some(descWord => descWord === word)) score += 10;
      if (description.includes(word)) score += 5;
    }
  } catch (error) {
    console.warn(`Error scoring video ${video.id}:`, error);
  }

  return score;
};

export const useVideoStore = create<VideoState>((set, get) => ({
  videos: [],
  recentVideos: [],
  currentVideo: null,
  loading: false,
  searchQuery: '',
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  pageSize: 12,
  isSearchMode: false,
  
  fetchVideos: async (page = 1, pageSize = 12) => {
    set({ loading: true, currentPage: page, isSearchMode: false, searchQuery: '' });
    try {
      // First get the total count
      const { count, error: countError } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);
      
      // Then get the paginated data
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          user:profiles(id, username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      const safeData = Array.isArray(data) ? data : [];
      const videosWithHashtags = await fetchHashtagsForVideos(safeData);
      
      set({ 
        videos: videosWithHashtags, 
        loading: false,
        totalCount,
        totalPages,
        currentPage: page,
        pageSize,
        isSearchMode: false,
        searchQuery: ''
      });
    } catch (error: any) {
      console.error('Fetch videos error:', error);
      toast.error('FAILED TO FETCH VIDEOS');
      set({ videos: [], loading: false, totalCount: 0, totalPages: 1, isSearchMode: false, searchQuery: '' });
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
      
      const safeData = Array.isArray(data) ? data : [];
      const videosWithHashtags = await fetchHashtagsForVideos(safeData);
      
      set({ recentVideos: videosWithHashtags, loading: false });
    } catch (error: any) {
      console.error('Fetch recent videos error:', error);
      toast.error('FAILED TO FETCH RECENT VIDEOS');
      set({ recentVideos: [], loading: false });
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
      
      // Fetch hashtags for this video
      let hashtags: any[] = [];
      try {
        const { data: hashtagData, error: hashtagError } = await supabase
          .from('video_hashtags')
          .select(`
            hashtag:hashtags(*)
          `)
          .eq('video_id', id);
        
        if (!hashtagError && Array.isArray(hashtagData)) {
          hashtags = hashtagData
            .map(item => item.hashtag)
            .filter(hashtag => hashtag && typeof hashtag === 'object' && hashtag.id);
        }
      } catch (hashtagError) {
        console.warn('Failed to fetch hashtags for video:', hashtagError);
      }
      
      set({ currentVideo: { ...data, hashtags }, loading: false });
    } catch (error: any) {
      console.error('Fetch video by ID error:', error);
      toast.error('FAILED TO FETCH VIDEO');
      set({ loading: false });
    }
  },
  
  searchVideos: async (query, page = 1, pageSize = 12) => {
    if (!query || typeof query !== 'string' || !query.trim()) {
      await get().fetchVideos(page, pageSize);
      return;
    }

    set({ loading: true, searchQuery: query, currentPage: page, isSearchMode: true });
    
    try {
      console.log('Starting search for:', query);
      
      // Step 1: Search in video titles and descriptions with pagination
      let videoResults: any[] = [];
      let totalVideoCount = 0;
      
      try {
        // Get total count for search results
        const { count: videoCount, error: videoCountError } = await supabase
          .from('videos')
          .select('*', { count: 'exact', head: true })
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`);
        
        if (!videoCountError) {
          totalVideoCount = videoCount || 0;
        }
        
        // Get paginated search results
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        
        const { data: videoData, error: videoError } = await supabase
          .from('videos')
          .select(`
            *,
            user:profiles(id, username, avatar_url)
          `)
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .order('created_at', { ascending: false })
          .range(from, to);
        
        if (videoError) {
          console.warn('Video search error:', videoError);
        } else if (Array.isArray(videoData)) {
          videoResults = videoData;
        }
      } catch (videoSearchError) {
        console.warn('Video search failed:', videoSearchError);
      }

      console.log('Video search results:', videoResults.length);

      // Step 2: Search for videos by hashtag (for current page)
      let hashtagVideoResults: any[] = [];
      let totalHashtagCount = 0;
      
      try {
        // First find hashtags that match the query
        const { data: matchingHashtags, error: hashtagError } = await supabase
          .from('hashtags')
          .select('id')
          .ilike('name', `%${query}%`);

        if (!hashtagError && Array.isArray(matchingHashtags) && matchingHashtags.length > 0) {
          const hashtagIds = matchingHashtags.map(h => h.id).filter(Boolean);
          
          if (hashtagIds.length > 0) {
            // Get total count for hashtag-based results
            const { count: hashtagCount, error: hashtagCountError } = await supabase
              .from('video_hashtags')
              .select('video_id', { count: 'exact', head: true })
              .in('hashtag_id', hashtagIds);
            
            if (!hashtagCountError) {
              totalHashtagCount = hashtagCount || 0;
            }
            
            // Find video-hashtag relationships with pagination
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            
            const { data: videoHashtagData, error: videoHashtagError } = await supabase
              .from('video_hashtags')
              .select('video_id')
              .in('hashtag_id', hashtagIds)
              .range(from, to);

            if (!videoHashtagError && Array.isArray(videoHashtagData) && videoHashtagData.length > 0) {
              const videoIds = videoHashtagData.map(vh => vh.video_id).filter(Boolean);
              
              if (videoIds.length > 0) {
                // Get the actual video data
                const { data: hashtagVideos, error: hashtagVideoError } = await supabase
                  .from('videos')
                  .select(`
                    *,
                    user:profiles(id, username, avatar_url)
                  `)
                  .in('id', videoIds);

                if (!hashtagVideoError && Array.isArray(hashtagVideos)) {
                  hashtagVideoResults = hashtagVideos;
                }
              }
            }
          }
        }
      } catch (hashtagSearchError) {
        console.warn('Hashtag search failed (non-fatal):', hashtagSearchError);
      }

      console.log('Hashtag search results:', hashtagVideoResults.length);

      // Step 3: Combine and deduplicate results
      const combinedResults = [...videoResults];
      
      // Add hashtag results that aren't already in video results
      for (const hashtagVideo of hashtagVideoResults) {
        if (!combinedResults.find(v => v.id === hashtagVideo.id)) {
          combinedResults.push(hashtagVideo);
        }
      }

      console.log('Combined results:', combinedResults.length);

      // Step 4: Fetch hashtags for all videos and score them
      const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean);
      const scoredResults: Array<Video & { score: number }> = [];
      
      for (const video of combinedResults) {
        try {
          // Fetch hashtags for this video
          let videoHashtags: string[] = [];
          try {
            const { data: hashtagData, error: hashtagError } = await supabase
              .from('video_hashtags')
              .select(`
                hashtag:hashtags(*)
              `)
              .eq('video_id', video.id);
            
            if (!hashtagError && Array.isArray(hashtagData)) {
              videoHashtags = hashtagData
                .map(item => item.hashtag?.name)
                .filter(name => name && typeof name === 'string');
            }
          } catch (hashtagError) {
            console.warn(`Failed to fetch hashtags for scoring video ${video.id}:`, hashtagError);
          }

          // Score the video
          const score = scoreVideo(video, query, queryWords, videoHashtags);
          
          // Add hashtags to video object
          const hashtags = videoHashtags.map(name => ({ 
            id: '', 
            name, 
            created_at: '' 
          }));
          
          scoredResults.push({ 
            ...video, 
            hashtags, 
            score 
          });
        } catch (videoProcessError) {
          console.warn(`Error processing video ${video.id}:`, videoProcessError);
          // Add video with minimal data to avoid losing it
          scoredResults.push({ 
            ...video, 
            hashtags: [], 
            score: 0 
          });
        }
      }

      // Step 5: Filter and sort results
      const filteredResults = scoredResults
        .filter(result => result.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ score, ...video }) => video);

      console.log('Final filtered results:', filteredResults.length);

      // Calculate pagination info for search results
      const totalSearchCount = Math.max(totalVideoCount, totalHashtagCount);
      const totalPages = Math.ceil(totalSearchCount / pageSize);

      set({ 
        videos: filteredResults, 
        loading: false,
        totalCount: totalSearchCount,
        totalPages,
        currentPage: page,
        pageSize,
        isSearchMode: true,
        searchQuery: query
      });
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error('FAILED TO SEARCH VIDEOS');
      set({ loading: false, videos: [], totalCount: 0, totalPages: 1, isSearchMode: true });
    }
  },
  
  uploadVideo: async (videoFile, thumbnailFile, title, description, hashtags = []) => {
    set({ loading: true });
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Not authenticated');

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
      
      // Create video record with user_id
      const { data: videoData, error: insertError } = await supabase
        .from('videos')
        .insert({
          title,
          description,
          url: videoUrl,
          thumbnail_url: thumbnailUrl,
          views: 0,
          likes: 0,
          user_id: user.id
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      // Add hashtags if provided
      if (Array.isArray(hashtags) && hashtags.length > 0) {
        try {
          await useHashtagStore.getState().addHashtagsToVideo(videoData.id, hashtags);
        } catch (hashtagError) {
          console.warn('Failed to add hashtags:', hashtagError);
          // Don't fail the entire upload for hashtag errors
        }
      }
      
      toast.success('VIDEO UPLOADED SUCCESSFULLY!');
      await get().fetchVideos();
      set({ loading: false });
    } catch (error: any) {
      console.error('Upload video error:', error);
      toast.error('FAILED TO UPLOAD VIDEO');
      set({ loading: false });
    }
  },
  
  updateVideo: async (id, updates) => {
    try {
      let thumbnailUrl = undefined;
      
      // Upload new thumbnail if provided
      if (updates.thumbnailFile) {
        const thumbnailFileName = `${Date.now()}_${updates.thumbnailFile.name}`;
        const { error: thumbnailUploadError } = await supabase.storage
          .from('thumbnails')
          .upload(thumbnailFileName, updates.thumbnailFile);
        
        if (thumbnailUploadError) throw thumbnailUploadError;
        
        thumbnailUrl = supabase.storage.from('thumbnails').getPublicUrl(thumbnailFileName).data.publicUrl;
      }
      
      const { error } = await supabase
        .from('videos')
        .update({
          title: updates.title,
          description: updates.description,
          ...(thumbnailUrl && { thumbnail_url: thumbnailUrl }),
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update hashtags if provided
      if (Array.isArray(updates.hashtags)) {
        try {
          await useHashtagStore.getState().addHashtagsToVideo(id, updates.hashtags);
        } catch (hashtagError) {
          console.warn('Failed to update hashtags:', hashtagError);
          // Don't fail the entire update for hashtag errors
        }
      }
      
      // Update local state
      const { currentVideo } = get();
      if (currentVideo && currentVideo.id === id) {
        set({
          currentVideo: {
            ...currentVideo,
            title: updates.title,
            description: updates.description,
            ...(thumbnailUrl && { thumbnail_url: thumbnailUrl }),
          }
        });
      }
      
      // Refresh videos list
      await get().fetchVideos();
      
      toast.success('VIDEO UPDATED SUCCESSFULLY');
    } catch (error: any) {
      console.error('Update video error:', error);
      toast.error('FAILED TO UPDATE VIDEO');
      throw error;
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
      
      toast.success('VIDEO DELETED SUCCESSFULLY');
      await get().fetchVideos();
    } catch (error: any) {
      console.error('Delete video error:', error);
      toast.error('FAILED TO DELETE VIDEO');
    }
  },
  
  likeVideo: async (videoId) => {
    try {
      const { currentVideo } = get();
      if (!currentVideo) return;
      
      // Check if video has already been liked
      if (get().hasLikedVideo(videoId)) {
        toast.error('YOU HAVE ALREADY LIKED THIS VIDEO');
        return;
      }

      await supabase.rpc('increment_likes', { video_id: videoId });
      
      // Store the like in localStorage
      try {
        const likedVideos = JSON.parse(localStorage.getItem(STORAGE_KEYS.likedVideos) || '[]');
        if (Array.isArray(likedVideos)) {
          likedVideos.push(videoId);
          localStorage.setItem(STORAGE_KEYS.likedVideos, JSON.stringify(likedVideos));
        }
      } catch (storageError) {
        console.warn('Failed to update liked videos in localStorage:', storageError);
      }
      
      set({
        currentVideo: { 
          ...currentVideo, 
          likes: currentVideo.likes + 1 
        }
      });

      toast.success('VIDEO LIKED!');
    } catch (error) {
      console.error('Failed to like video', error);
      toast.error('FAILED TO LIKE VIDEO');
    }
  },

  hasLikedVideo: (videoId) => {
    try {
      const likedVideos = JSON.parse(localStorage.getItem(STORAGE_KEYS.likedVideos) || '[]');
      return Array.isArray(likedVideos) && likedVideos.includes(videoId);
    } catch (error) {
      console.warn('Failed to check liked videos:', error);
      return false;
    }
  },
  
  setSearchQuery: (query) => {
    set({ searchQuery: query || '', isSearchMode: !!query });
  },
  
  clearSearch: () => {
    set({ searchQuery: '', isSearchMode: false });
  },
  
  setCurrentPage: (page) => {
    set({ currentPage: page });
  },
  
  fetchRelatedVideos: async (videoId, limit = 4) => {
    try {
      const { data, error } = await supabase.rpc('get_related_videos_by_hashtags', {
        video_uuid: videoId,
        limit_count: limit
      });
      
      if (error) {
        console.warn('Related videos RPC error:', error);
        throw error;
      }
      
      // If no hashtag-based related videos, fall back to recent videos
      if (!Array.isArray(data) || data.length === 0) {
        const { data: recentData, error: recentError } = await supabase
          .from('videos')
          .select(`
            *,
            user:profiles(id, username, avatar_url)
          `)
          .neq('id', videoId)
          .order('created_at', { ascending: false })
          .limit(limit);
        
        if (recentError) {
          console.warn('Recent videos fallback error:', recentError);
          return [];
        }
        
        return Array.isArray(recentData) ? recentData : [];
      }
      
      // Fetch user data for hashtag-based results
      const videoIds = data.map(v => v.id).filter(Boolean);
      if (videoIds.length === 0) return [];
      
      const { data: videosWithUsers, error: usersError } = await supabase
        .from('videos')
        .select(`
          *,
          user:profiles(id, username, avatar_url)
        `)
        .in('id', videoIds);
      
      if (usersError) {
        console.warn('Users data error for related videos:', usersError);
        return data; // Return without user data rather than failing
      }
      
      // Merge the data maintaining the order from the hashtag query
      const relatedVideos = data.map(hashtagVideo => {
        const videoWithUser = Array.isArray(videosWithUsers) 
          ? videosWithUsers.find(v => v.id === hashtagVideo.id)
          : null;
        return videoWithUser || hashtagVideo;
      }).filter(Boolean);
      
      return relatedVideos;
    } catch (error: any) {
      console.warn('Failed to fetch related videos:', error);
      return [];
    }
  },
}));