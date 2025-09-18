import React, { useEffect, useState } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { useCommentStore } from '../stores/commentStore';
import { useAuthStore } from '../stores/authStore';
import { Comment } from '../lib/supabase';

type CommentSectionProps = {
  videoId: string;
};

const CommentSection: React.FC<CommentSectionProps> = ({ videoId }) => {
  const { user } = useAuthStore();
  const { comments, loading, fetchComments, addComment, deleteComment } = useCommentStore();
  const [commentText, setCommentText] = useState('');
  
  useEffect(() => {
    fetchComments(videoId);
  }, [videoId, fetchComments]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    try {
      await addComment(commentText, videoId);
      setCommentText('');
    } catch (error) {
      console.error('Failed to add comment', error);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const canDeleteComment = (comment: Comment) => {
    return user?.is_admin || user?.id === comment.user_id;
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </h3>
      
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                  <span className="text-primary-700 dark:text-primary-300 font-semibold">
                    {user.username.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-grow">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white resize-none"
                rows={3}
                required
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
                  disabled={!commentText.trim()}
                >
                  <Send size={16} />
                  <span>Comment</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-center mb-8">
          <p className="text-gray-700 dark:text-gray-300">
            Please <a href="/login" className="text-primary-600 dark:text-primary-400 hover:underline">login</a> to leave a comment.
          </p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="flex-shrink-0">
                {comment.user?.avatar_url ? (
                  <img
                    src={comment.user.avatar_url}
                    alt={comment.user?.username}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                    <span className="text-primary-700 dark:text-primary-300 font-semibold">
                      {comment.user?.username.substring(0, 2).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {comment.user?.username || 'Unknown user'}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                  {canDeleteComment(comment) && (
                    <button
                      onClick={() => deleteComment(comment.id)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
          
          {comments.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;