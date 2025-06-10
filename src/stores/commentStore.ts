import { create } from 'zustand';
import { supabase, Comment } from '../lib/supabase';
import { toast } from 'sonner';

type CommentState = {
  comments: Comment[];
  loading: boolean;
  fetchComments: (videoId: string) => Promise<void>;
  addComment: (content: string, videoId: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
};

export const useCommentStore = create<CommentState>((set, get) => ({
  comments: [],
  loading: false,
  
  fetchComments: async (videoId) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles(id, username, avatar_url)
        `)
        .eq('video_id', videoId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      set({ comments: data, loading: false });
    } catch (error: any) {
      toast.error('Failed to fetch comments');
      set({ loading: false });
    }
  },
  
  addComment: async (content, videoId) => {
    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('comments')
        .insert({ 
          content, 
          video_id: videoId,
          user_id: user.id 
        });
      
      if (error) throw error;
      
      toast.success('Comment added');
      await get().fetchComments(videoId);
      set({ loading: false });
    } catch (error: any) {
      toast.error('Failed to add comment');
      set({ loading: false });
    }
  },
  
  deleteComment: async (commentId) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
      
      if (error) throw error;
      
      set(state => ({
        comments: state.comments.filter(c => c.id !== commentId)
      }));
      
      toast.success('Comment deleted');
    } catch (error: any) {
      toast.error('Failed to delete comment');
    }
  },
}));