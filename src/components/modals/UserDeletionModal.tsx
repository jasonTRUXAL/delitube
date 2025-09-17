import React, { useState } from 'react';
import { X, AlertTriangle, Video, MessageSquare, User, Trash2 } from 'lucide-react';

type UserDeletionModalProps = {
  user: {
    id: string;
    username: string;
    email: string;
    videoCount?: number;
    commentCount?: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: {
    preserveVideos: boolean;
    preserveComments: boolean;
    anonymizeContent: boolean;
  }) => void;
  loading?: boolean;
  isOwnAccount?: boolean;
};

const UserDeletionModal: React.FC<UserDeletionModalProps> = ({
  user,
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  isOwnAccount = false
}) => {
  const [preserveVideos, setPreserveVideos] = useState(true);
  const [preserveComments, setPreserveComments] = useState(true);
  const [anonymizeContent, setAnonymizeContent] = useState(true);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({
      preserveVideos,
      preserveComments,
      anonymizeContent
    });
  };

  const hasContent = (user.videoCount || 0) > 0 || (user.commentCount || 0) > 0;

  return (
    <div className="fixed inset-0 bg-brutal-black/70 flex items-center justify-center z-50 p-4">
      <div className="card-brutal max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-600 border-3 border-brutal-black flex items-center justify-center">
                <AlertTriangle size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-brutal-black font-mono uppercase dark:text-white">
                  {isOwnAccount ? 'DELETE YOUR ACCOUNT' : 'DELETE USER ACCOUNT'}
                </h2>
                <p className="text-brutal-gray font-bold uppercase text-sm dark:text-gray-400">
                  {isOwnAccount ? 'CHOOSE WHAT HAPPENS TO YOUR CONTENT' : 'CONFIGURE DELETION OPTIONS'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-brutal-gray border-2 border-brutal-black flex items-center justify-center hover:bg-brutal-black hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* User Info */}
          <div className="card-brutal p-6 mb-6 bg-accent-50 dark:bg-accent-900">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary-600 border-2 border-brutal-black flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-black text-brutal-black font-mono uppercase dark:text-white">
                  {user.username}
                </h3>
                <p className="text-brutal-gray font-bold text-sm dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Video size={16} className="text-brutal-gray" />
                <span className="text-sm font-bold text-brutal-black font-mono uppercase dark:text-white">
                  {user.videoCount || 0} VIDEOS
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-brutal-gray" />
                <span className="text-sm font-bold text-brutal-black font-mono uppercase dark:text-white">
                  {user.commentCount || 0} COMMENTS
                </span>
              </div>
            </div>
          </div>

          {/* Content Options or No Content Message */}
          {hasContent ? (
            <div className="space-y-6 mb-8">
              <h3 className="text-lg font-black text-brutal-black font-mono uppercase dark:text-white">
                {isOwnAccount ? 'WHAT SHOULD HAPPEN TO YOUR CONTENT?' : 'CONTENT PRESERVATION OPTIONS'}
              </h3>

              {/* Preserve Videos */}
              {(user.videoCount || 0) > 0 && (
                <div className="card-brutal p-6">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      id="preserveVideos"
                      checked={preserveVideos}
                      onChange={(e) => setPreserveVideos(e.target.checked)}
                      className="w-5 h-5 mt-1 border-2 border-brutal-black accent-primary-600"
                    />
                    <div className="flex-grow">
                      <label htmlFor="preserveVideos" className="block font-black text-brutal-black font-mono uppercase cursor-pointer dark:text-white">
                        {isOwnAccount ? 'KEEP MY VIDEOS ONLINE' : 'PRESERVE VIDEOS'} ({user.videoCount || 0})
                      </label>
                      <p className="text-sm text-brutal-gray font-bold mt-1 dark:text-gray-400">
                        {isOwnAccount 
                          ? 'Your videos will remain accessible to the community even after your account is deleted.'
                          : 'Keep all videos uploaded by this user. Videos will remain accessible to the community.'
                        }
                      </p>
                      {!preserveVideos && (
                        <div className="mt-2 p-3 bg-accent-100 border-2 border-accent-600 dark:bg-accent-900">
                          <p className="text-sm font-bold text-accent-800 font-mono uppercase dark:text-accent-200">
                            ⚠️ ALL VIDEOS WILL BE PERMANENTLY DELETED
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Preserve Comments */}
              {(user.commentCount || 0) > 0 && (
                <div className="card-brutal p-6">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      id="preserveComments"
                      checked={preserveComments}
                      onChange={(e) => setPreserveComments(e.target.checked)}
                      className="w-5 h-5 mt-1 border-2 border-brutal-black accent-primary-600"
                    />
                    <div className="flex-grow">
                      <label htmlFor="preserveComments" className="block font-black text-brutal-black font-mono uppercase cursor-pointer dark:text-white">
                        {isOwnAccount ? 'KEEP MY COMMENTS' : 'PRESERVE COMMENTS'} ({user.commentCount || 0})
                      </label>
                      <p className="text-sm text-brutal-gray font-bold mt-1 dark:text-gray-400">
                        {isOwnAccount
                          ? 'Your comments will remain visible on videos to maintain conversation context.'
                          : 'Keep all comments made by this user. Comments will remain visible on videos.'
                        }
                      </p>
                      {!preserveComments && (
                        <div className="mt-2 p-3 bg-accent-100 border-2 border-accent-600 dark:bg-accent-900">
                          <p className="text-sm font-bold text-accent-800 font-mono uppercase dark:text-accent-200">
                            ⚠️ ALL COMMENTS WILL BE PERMANENTLY DELETED
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Anonymize Content */}
              {(preserveVideos || preserveComments) && (
                <div className="card-brutal p-6">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      id="anonymizeContent"
                      checked={anonymizeContent}
                      onChange={(e) => setAnonymizeContent(e.target.checked)}
                      className="w-5 h-5 mt-1 border-2 border-brutal-black accent-primary-600"
                    />
                    <div className="flex-grow">
                      <label htmlFor="anonymizeContent" className="block font-black text-brutal-black font-mono uppercase cursor-pointer dark:text-white">
                        {isOwnAccount ? 'REMOVE MY NAME FROM CONTENT' : 'ANONYMIZE PRESERVED CONTENT'}
                      </label>
                      <p className="text-sm text-brutal-gray font-bold mt-1 dark:text-gray-400">
                        {isOwnAccount
                          ? 'Replace your username with "DELETED USER" on preserved videos and comments.'
                          : 'Replace user attribution with "DELETED USER" for preserved videos and comments.'
                        }
                      </p>
                      {!anonymizeContent && (
                        <div className="mt-2 p-3 bg-warning-100 border-2 border-warning-600 dark:bg-warning-900">
                          <p className="text-sm font-bold text-warning-800 font-mono uppercase dark:text-warning-200">
                            ⚠️ {isOwnAccount ? 'YOUR USERNAME' : 'USERNAME'} WILL REMAIN VISIBLE ON PRESERVED CONTENT
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card-brutal p-6 mb-8 text-center">
              <div className="w-16 h-16 bg-brutal-gray border-3 border-brutal-black flex items-center justify-center mx-auto mb-4">
                <User size={24} className="text-white" />
              </div>
              <h3 className="font-black text-brutal-black font-mono uppercase mb-2 dark:text-white">
                NO CONTENT TO PRESERVE
              </h3>
              <p className="text-sm text-brutal-gray font-bold dark:text-gray-400">
                {isOwnAccount 
                  ? 'You haven\'t uploaded any videos or made any comments yet.'
                  : 'This user hasn\'t uploaded any videos or made any comments yet.'
                }
              </p>
            </div>
          )}

          {/* Warning */}
          <div className="card-brutal p-6 mb-8 bg-accent-50 border-accent-600 dark:bg-accent-900">
            <div className="flex items-start gap-4">
              <AlertTriangle size={20} className="text-accent-600 mt-1" />
              <div>
                <h4 className="font-black text-accent-800 font-mono uppercase mb-2 dark:text-accent-200">
                  PERMANENT ACTION
                </h4>
                <p className="text-sm font-bold text-accent-700 dark:text-accent-300">
                  {isOwnAccount
                    ? 'This action cannot be undone. Your account will be permanently deleted and you will lose access to the platform immediately.'
                    : 'This action cannot be undone. The user account will be permanently deleted and the user will lose access to the platform immediately.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="btn-brutal-secondary px-6 py-3"
            >
              CANCEL
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="btn-brutal-warning px-6 py-3"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin mr-3"></div>
                  DELETING...
                </span>
              ) : (
                <>
                  <Trash2 size={16} className="inline mr-2" />
                  {isOwnAccount ? 'DELETE MY ACCOUNT' : 'DELETE USER'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDeletionModal;