import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Trash2, Square } from 'lucide-react';
import { useCommentStore } from '../stores/commentStore';
import { useAuthStore } from '../stores/authStore';
import { Comment } from '../lib/supabase';
import { formatDate } from '../utils/formatters';

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
  
  const canDeleteComment = (comment: Comment) => {
    return user?.is_admin || user?.id === comment.user_id;
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-black text-brutal-black dark:text-white mb-6 font-mono uppercase">
        {comments.length} {comments.length === 1 ? 'COMMENT' : 'COMMENTS'}
      </h3>
      
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8 card-brutal p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-12 h-12 border-3 border-brutal-black"
                />
              ) : (
                <div className="w-12 h-12 bg-primary-600 border-3 border-brutal-black flex items-center justify-center">
                  <Square size={16} className="text-white" fill="currentColor" />
                </div>
              )}
            </div>
            <div className="flex-grow">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="ADD A COMMENT..."
                className="input-brutal w-full px-4 py-3 font-mono uppercase placeholder:text-brutal-gray resize-none"
                rows={3}
                required
              />
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  className="btn-brutal px-6 py-2"
                  disabled={!commentText.trim()}
                >
                  <Send size={16} className="inline mr-2" />
                  COMMENT
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="card-brutal p-6 text-center mb-8">
          <p className="text-brutal-black font-bold uppercase dark:text-white">
            PLEASE <Link to="/login" className="text-primary-600 hover:underline">LOGIN</Link> TO LEAVE A COMMENT.
          </p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-12 h-12 border-4 border-brutal-black bg-primary-600 animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="card-brutal p-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  {comment.user?.avatar_url ? (
                    <img
                      src={comment.user.avatar_url}
                      alt={comment.user?.username}
                      className="w-12 h-12 border-3 border-brutal-black"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary-600 border-3 border-brutal-black flex items-center justify-center">
                      <Square size={16} className="text-white" fill="currentColor" />
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <Link
                        to={`/user/${comment.user?.username}`}
                        className="font-black text-brutal-black dark:text-white font-mono uppercase hover:text-primary-600 transition-colors"
                      >
                        {comment.user?.username || 'UNKNOWN USER'}
                      </Link>
                      <p className="text-xs text-brutal-gray font-bold uppercase dark:text-gray-400">
                        {formatDate(comment.created_at)}
                      </p>
                    </div>
                    {canDeleteComment(comment) && (
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="text-brutal-gray hover:text-accent-600 transition-colors p-2 border-2 border-transparent hover:border-accent-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <p className="text-brutal-black dark:text-white whitespace-pre-line font-bold">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {comments.length === 0 && (
            <div className="card-brutal p-8 text-center">
              <div className="w-16 h-16 bg-brutal-gray border-3 border-brutal-black flex items-center justify-center mx-auto mb-4">
                <Square size={24} className="text-white" fill="currentColor" />
              </div>
              <p className="text-brutal-black font-black font-mono uppercase dark:text-white">
                NO COMMENTS YET. BE THE FIRST TO COMMENT!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;