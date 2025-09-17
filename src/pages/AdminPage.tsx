import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Shield, ShieldOff, Users, Film, MessageSquare, Home, Square, ChevronLeft, ChevronRight, User, Calendar, Eye, ThumbsUp, ArrowLeft } from 'lucide-react';
import { useAdminStore } from '../stores/adminStore';
import { useAuthStore } from '../stores/authStore';
import { useVideoStore } from '../stores/videoStore';
import UserDeletionModal from '../components/modals/UserDeletionModal';
import { formatDate } from '../utils/formatters';

const AdminPage = () => {
  const { user } = useAuthStore();
  const { users, loading: loadingUsers, fetchUsers, deleteUser, toggleAdminStatus, getUserContentCounts, getUserDetails } = useAdminStore();
  const { videos, loading: loadingVideos, fetchVideos, deleteVideo, currentPage, totalPages, totalCount, pageSize, setCurrentPage } = useVideoStore();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'users' | 'videos' | 'comments'>('users');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const [deletionModal, setDeletionModal] = useState<{
    isOpen: boolean;
    user: any;
    loading: boolean;
  }>({
    isOpen: false,
    user: null,
    loading: false
  });
  
  // Redirect if not logged in or not an admin
  useEffect(() => {
    if (user && !user.is_admin) {
      navigate('/');
    } else if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  useEffect(() => {
    if (user?.is_admin) {
      fetchUsers();
      fetchVideos(1); // Start with page 1
    }
  }, [user, fetchUsers, fetchVideos]);
  
  if (!user || !user.is_admin) {
    return null;
  }

  const handleVideoPageChange = async (page: number) => {
    setCurrentPage(page);
    await fetchVideos(page);
  };

  const handleDeleteUserClick = async (userToDelete: any) => {
    try {
      const contentCounts = await getUserContentCounts(userToDelete.id);
      setDeletionModal({
        isOpen: true,
        user: {
          ...userToDelete,
          ...contentCounts
        },
        loading: false
      });
    } catch (error) {
      console.error('Failed to get user content counts:', error);
      setDeletionModal({
        isOpen: true,
        user: {
          ...userToDelete,
          videoCount: 0,
          commentCount: 0
        },
        loading: false
      });
    }
  };

  const handleConfirmDeletion = async (options: {
    preserveVideos: boolean;
    preserveComments: boolean;
    anonymizeContent: boolean;
  }) => {
    setDeletionModal(prev => ({ ...prev, loading: true }));
    
    try {
      await deleteUser(deletionModal.user.id, options);
      setDeletionModal({ isOpen: false, user: null, loading: false });
      // Clear selected user if they were deleted
      if (selectedUser && selectedUser.id === deletionModal.user.id) {
        setSelectedUser(null);
        setUserDetails(null);
      }
    } catch (error) {
      setDeletionModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleUserSelect = async (user: any) => {
    setSelectedUser(user);
    setLoadingUserDetails(true);
    
    try {
      const details = await getUserDetails(user.id);
      setUserDetails(details);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      setUserDetails(null);
    } finally {
      setLoadingUserDetails(false);
    }
  };

  const handleBackToUserList = () => {
    setSelectedUser(null);
    setUserDetails(null);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="card-brutal p-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-accent-600 border-3 border-brutal-black flex items-center justify-center">
              <Shield size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-brutal-black font-mono uppercase mb-2 dark:text-white">
                ADMIN DASHBOARD
              </h1>
              <p className="text-brutal-gray font-bold uppercase tracking-wide dark:text-gray-400">
                MANAGE DELITUBE PLATFORM
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="btn-brutal-secondary px-6 py-3"
          >
            <Home size={18} className="inline mr-2" />
            BACK TO HOME
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b-4 border-brutal-black mb-8 bg-white dark:bg-brutal-dark-brown">
        <button
          className={`py-4 px-6 font-black border-r-3 border-brutal-black transition-colors font-mono uppercase ${
            activeTab === 'users'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-brutal-black hover:bg-primary-100 dark:bg-brutal-dark-brown dark:text-white dark:hover:bg-primary-900'
          }`}
          onClick={() => {
            setActiveTab('users');
            setSelectedUser(null);
            setUserDetails(null);
          }}
        >
          <div className="flex items-center gap-2">
            <Users size={18} />
            <span>USERS</span>
          </div>
        </button>
        <button
          className={`py-4 px-6 font-black border-r-3 border-brutal-black transition-colors font-mono uppercase ${
            activeTab === 'videos'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-brutal-black hover:bg-primary-100 dark:bg-brutal-dark-brown dark:text-white dark:hover:bg-primary-900'
          }`}
          onClick={() => setActiveTab('videos')}
        >
          <div className="flex items-center gap-2">
            <Film size={18} />
            <span>VIDEOS</span>
          </div>
        </button>
        <button
          className={`py-4 px-6 font-black transition-colors font-mono uppercase ${
            activeTab === 'comments'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-brutal-black hover:bg-primary-100 dark:bg-brutal-dark-brown dark:text-white dark:hover:bg-primary-900'
          }`}
          onClick={() => setActiveTab('comments')}
        >
          <div className="flex items-center gap-2">
            <MessageSquare size={18} />
            <span>COMMENTS</span>
          </div>
        </button>
      </div>
      
      {/* Users tab */}
      {activeTab === 'users' && (
        <>
          {selectedUser ? (
            /* User Details View */
            <div>
              {/* Back button and user header */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={handleBackToUserList}
                  className="btn-brutal-secondary px-4 py-2"
                >
                  <ArrowLeft size={16} className="inline mr-2" />
                  BACK TO USERS
                </button>
                <h2 className="text-xl font-black text-brutal-black font-mono uppercase dark:text-white">
                  USER DETAILS: {selectedUser.username}
                </h2>
              </div>

              {/* User Info Card */}
              <div className="card-brutal p-6 mb-8">
                <div className="flex items-center gap-6">
                  {selectedUser.avatar_url ? (
                    <img
                      src={selectedUser.avatar_url}
                      alt={selectedUser.username}
                      className="w-20 h-20 border-3 border-brutal-black"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-primary-600 border-3 border-brutal-black flex items-center justify-center">
                      <Square size={24} className="text-white" fill="currentColor" />
                    </div>
                  )}
                  <div className="flex-grow">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-2xl font-black text-brutal-black font-mono uppercase dark:text-white">
                        {selectedUser.username}
                      </h3>
                      {selectedUser.is_admin && (
                        <span className="bg-primary-600 text-white px-3 py-1 border-2 border-brutal-black font-mono font-bold uppercase text-sm">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-brutal-gray font-bold mb-2 dark:text-gray-400">{selectedUser.email}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-brutal-gray" />
                        <span className="font-bold text-brutal-black font-mono uppercase dark:text-white">
                          JOINED {formatDate(selectedUser.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAdminStatus(selectedUser.id, !selectedUser.is_admin)}
                      className={`p-3 border-2 border-brutal-black transition-colors ${
                        selectedUser.is_admin
                          ? 'text-primary-600 bg-white hover:bg-primary-100 dark:bg-brutal-dark-brown dark:hover:bg-primary-900'
                          : 'text-brutal-black bg-white hover:bg-primary-100 dark:bg-brutal-dark-brown dark:text-white dark:hover:bg-primary-900'
                      }`}
                      title={selectedUser.is_admin ? 'REMOVE ADMIN PRIVILEGES' : 'GRANT ADMIN PRIVILEGES'}
                    >
                      {selectedUser.is_admin ? <ShieldOff size={20} /> : <Shield size={20} />}
                    </button>
                    <button
                      onClick={() => handleDeleteUserClick(selectedUser)}
                      className="p-3 text-accent-600 bg-white border-2 border-brutal-black hover:bg-accent-100 transition-colors dark:bg-brutal-dark-brown dark:hover:bg-accent-900"
                      title="DELETE USER"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Overview */}
              {loadingUserDetails ? (
                <div className="flex justify-center py-20">
                  <div className="w-16 h-16 border-4 border-brutal-black bg-primary-600 animate-spin"></div>
                </div>
              ) : userDetails ? (
                <div className="space-y-8">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="card-brutal p-6 text-center">
                      <div className="w-12 h-12 bg-primary-600 border-2 border-brutal-black flex items-center justify-center mx-auto mb-3">
                        <Film size={20} className="text-white" />
                      </div>
                      <div className="text-2xl font-black text-brutal-black font-mono dark:text-white">
                        {userDetails.videos?.length || 0}
                      </div>
                      <div className="text-sm font-bold text-brutal-gray uppercase dark:text-gray-400">
                        VIDEOS UPLOADED
                      </div>
                    </div>
                    
                    <div className="card-brutal p-6 text-center">
                      <div className="w-12 h-12 bg-secondary-600 border-2 border-brutal-black flex items-center justify-center mx-auto mb-3">
                        <MessageSquare size={20} className="text-white" />
                      </div>
                      <div className="text-2xl font-black text-brutal-black font-mono dark:text-white">
                        {userDetails.totalComments || 0}
                      </div>
                      <div className="text-sm font-bold text-brutal-gray uppercase dark:text-gray-400">
                        TOTAL COMMENTS
                      </div>
                    </div>
                    
                    <div className="card-brutal p-6 text-center">
                      <div className="w-12 h-12 bg-warning-600 border-2 border-brutal-black flex items-center justify-center mx-auto mb-3">
                        <MessageSquare size={20} className="text-white" />
                      </div>
                      <div className="text-2xl font-black text-brutal-black font-mono dark:text-white">
                        {userDetails.commentsOnOwnVideos || 0}
                      </div>
                      <div className="text-sm font-bold text-brutal-gray uppercase dark:text-gray-400">
                        ON OWN VIDEOS
                      </div>
                    </div>
                    
                    <div className="card-brutal p-6 text-center">
                      <div className="w-12 h-12 bg-success-600 border-2 border-brutal-black flex items-center justify-center mx-auto mb-3">
                        <Eye size={20} className="text-white" />
                      </div>
                      <div className="text-2xl font-black text-brutal-black font-mono dark:text-white">
                        {userDetails.totalViews || 0}
                      </div>
                      <div className="text-sm font-bold text-brutal-gray uppercase dark:text-gray-400">
                        TOTAL VIDEO VIEWS
                      </div>
                    </div>
                  </div>

                  {/* User's Videos */}
                  {userDetails.videos && userDetails.videos.length > 0 && (
                    <div className="card-brutal p-6">
                      <h3 className="text-lg font-black text-brutal-black font-mono uppercase mb-6 dark:text-white">
                        UPLOADED VIDEOS ({userDetails.videos.length})
                      </h3>
                      <div className="space-y-4">
                        {userDetails.videos.map((video: any) => (
                          <div key={video.id} className="border-2 border-brutal-black p-4 bg-white dark:bg-brutal-dark-brown">
                            <div className="flex items-start gap-4">
                              <img
                                src={video.thumbnail_url || 'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg'}
                                alt={video.title}
                                className="w-24 h-14 object-cover border-2 border-brutal-black flex-shrink-0"
                              />
                              <div className="flex-grow min-w-0">
                                <h4 className="font-black text-brutal-black line-clamp-1 font-mono uppercase text-sm mb-2 dark:text-white">
                                  {video.title}
                                </h4>
                                <div className="flex items-center gap-4 text-xs text-brutal-gray font-bold uppercase mb-2 dark:text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <Eye size={12} />
                                    <span>{video.views} VIEWS</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <ThumbsUp size={12} />
                                    <span>{video.likes} LIKES</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MessageSquare size={12} />
                                    <span>{video.comments?.length || 0} COMMENTS</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    <span>{formatDate(video.created_at)}</span>
                                  </div>
                                </div>
                                {video.description && (
                                  <p className="text-xs text-brutal-gray line-clamp-2 dark:text-gray-400">
                                    {video.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <a
                                  href={`/video/${video.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-primary-600 hover:underline font-black font-mono uppercase text-xs dark:text-primary-400"
                                >
                                  VIEW
                                </a>
                                <button
                                  onClick={() => {
                                    if (confirm(`DELETE VIDEO "${video.title.toUpperCase()}"?`)) {
                                      deleteVideo(video.id);
                                      // Refresh user details
                                      handleUserSelect(selectedUser);
                                    }
                                  }}
                                  className="text-accent-600 hover:underline font-black font-mono uppercase text-xs"
                                >
                                  DELETE
                                </button>
                              </div>
                            </div>
                            
                            {/* Comments on this video */}
                            {video.comments && video.comments.length > 0 && (
                              <div className="mt-4 pt-4 border-t-2 border-brutal-black">
                                <h5 className="font-black text-brutal-black font-mono uppercase text-xs mb-3 dark:text-white">
                                  COMMENTS ON THIS VIDEO ({video.comments.length})
                                </h5>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                  {video.comments.map((comment: any) => (
                                    <div key={comment.id} className="bg-brutal-gray/10 p-3 border border-brutal-black">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-grow min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-brutal-black font-mono uppercase text-xs dark:text-white">
                                              {comment.user?.username || 'UNKNOWN USER'}
                                            </span>
                                            <span className="text-xs text-brutal-gray font-bold dark:text-gray-400">
                                              {formatDate(comment.created_at)}
                                            </span>
                                          </div>
                                          <p className="text-xs text-brutal-black line-clamp-2 dark:text-white">
                                            {comment.content}
                                          </p>
                                        </div>
                                        <button
                                          onClick={() => {
                                            if (confirm('DELETE THIS COMMENT?')) {
                                              // You'd implement comment deletion here
                                              console.log('Delete comment:', comment.id);
                                            }
                                          }}
                                          className="text-accent-600 hover:text-accent-700 p-1"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* User's Comments on Other Videos */}
                  {userDetails.commentsOnOtherVideos && userDetails.commentsOnOtherVideos.length > 0 && (
                    <div className="card-brutal p-6">
                      <h3 className="text-lg font-black text-brutal-black font-mono uppercase mb-6 dark:text-white">
                        COMMENTS ON OTHER VIDEOS ({userDetails.commentsOnOtherVideos.length})
                      </h3>
                      <div className="space-y-4">
                        {userDetails.commentsOnOtherVideos.map((comment: any) => (
                          <div key={comment.id} className="border-2 border-brutal-black p-4 bg-white dark:bg-brutal-dark-brown">
                            <div className="flex items-start gap-4">
                              <img
                                src={comment.video?.thumbnail_url || 'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg'}
                                alt={comment.video?.title}
                                className="w-16 h-10 object-cover border-2 border-brutal-black flex-shrink-0"
                              />
                              <div className="flex-grow min-w-0">
                                <h4 className="font-black text-brutal-black line-clamp-1 font-mono uppercase text-sm mb-2 dark:text-white">
                                  ON: {comment.video?.title || 'UNKNOWN VIDEO'}
                                </h4>
                                <p className="text-sm text-brutal-black mb-2 dark:text-white">
                                  "{comment.content}"
                                </p>
                                <div className="flex items-center gap-4 text-xs text-brutal-gray font-bold uppercase dark:text-gray-400">
                                  <span>{formatDate(comment.created_at)}</span>
                                  <span>BY {comment.video?.user?.username || 'UNKNOWN USER'}</span>
                                </div>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <a
                                  href={`/video/${comment.video_id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-primary-600 hover:underline font-black font-mono uppercase text-xs dark:text-primary-400"
                                >
                                  VIEW VIDEO
                                </a>
                                <button
                                  onClick={() => {
                                    if (confirm('DELETE THIS COMMENT?')) {
                                      // You'd implement comment deletion here
                                      console.log('Delete comment:', comment.id);
                                    }
                                  }}
                                  className="text-accent-600 hover:underline font-black font-mono uppercase text-xs"
                                >
                                  DELETE
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {(!userDetails.videos || userDetails.videos.length === 0) && 
                   (!userDetails.commentsOnOtherVideos || userDetails.commentsOnOtherVideos.length === 0) && (
                    <div className="card-brutal p-12 text-center">
                      <div className="w-16 h-16 bg-brutal-gray border-3 border-brutal-black flex items-center justify-center mx-auto mb-4">
                        <User size={24} className="text-white" />
                      </div>
                      <h3 className="font-black text-brutal-black font-mono uppercase mb-2 dark:text-white">
                        NO CONTENT FOUND
                      </h3>
                      <p className="text-sm text-brutal-gray font-bold dark:text-gray-400">
                        This user hasn't uploaded any videos or made any comments yet.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card-brutal p-8 text-center">
                  <div className="w-16 h-16 bg-brutal-gray border-3 border-brutal-black flex items-center justify-center mx-auto mb-4">
                    <Square size={24} className="text-white" fill="currentColor" />
                  </div>
                  <p className="text-brutal-black font-black font-mono uppercase dark:text-white">
                    FAILED TO LOAD USER DETAILS
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* User List View */
            <>
              <h2 className="text-xl font-black text-brutal-black mb-6 font-mono uppercase dark:text-white">MANAGE USERS</h2>
              
              {loadingUsers ? (
                <div className="flex justify-center py-8">
                  <div className="w-12 h-12 border-4 border-brutal-black bg-primary-600 animate-spin"></div>
                </div>
              ) : (
                <div className="card-brutal overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-brutal-gray text-left border-b-3 border-brutal-black">
                          <th className="py-4 px-4 text-white font-black font-mono uppercase">USER</th>
                          <th className="py-4 px-4 text-white font-black font-mono uppercase">EMAIL</th>
                          <th className="py-4 px-4 text-white font-black font-mono uppercase">CREATED</th>
                          <th className="py-4 px-4 text-white font-black font-mono uppercase">ROLE</th>
                          <th className="py-4 px-4 text-white font-black font-mono uppercase">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-brutal-dark-brown">
                        {users.map((user, index) => (
                          <tr 
                            key={user.id} 
                            className={`${index % 2 === 0 ? 'bg-white dark:bg-brutal-dark-brown' : 'bg-primary-50 dark:bg-primary-900'} border-b-2 border-brutal-black hover:bg-primary-100 dark:hover:bg-primary-800 cursor-pointer transition-colors`}
                            onClick={() => handleUserSelect(user)}
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center">
                                {user.avatar_url ? (
                                  <img
                                    src={user.avatar_url}
                                    alt={user.username}
                                    className="w-10 h-10 border-2 border-brutal-black mr-3"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-primary-600 border-2 border-brutal-black flex items-center justify-center mr-3">
                                    <Square size={12} className="text-white" fill="currentColor" />
                                  </div>
                                )}
                                <span className="font-black text-brutal-black font-mono uppercase dark:text-white">{user.username}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-brutal-black font-bold dark:text-white">{user.email}</td>
                            <td className="py-4 px-4 text-brutal-black font-bold dark:text-white">
                              {new Date(user.created_at).toLocaleDateString().toUpperCase()}
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center px-3 py-1 border-2 border-brutal-black text-xs font-black font-mono uppercase ${
                                user.is_admin 
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-white text-brutal-black dark:bg-brutal-dark-brown dark:text-white'
                              }`}>
                                {user.is_admin ? 'ADMIN' : 'USER'}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => toggleAdminStatus(user.id, !user.is_admin)}
                                  className={`p-2 border-2 border-brutal-black transition-colors ${
                                    user.is_admin
                                      ? 'text-primary-600 bg-white hover:bg-primary-100 dark:bg-brutal-dark-brown dark:hover:bg-primary-900'
                                      : 'text-brutal-black bg-white hover:bg-primary-100 dark:bg-brutal-dark-brown dark:text-white dark:hover:bg-primary-900'
                                  }`}
                                  title={user.is_admin ? 'REMOVE ADMIN PRIVILEGES' : 'GRANT ADMIN PRIVILEGES'}
                                >
                                  {user.is_admin ? <ShieldOff size={18} /> : <Shield size={18} />}
                                </button>
                                <button
                                  onClick={() => handleDeleteUserClick(user)}
                                  className="p-2 text-accent-600 bg-white border-2 border-brutal-black hover:bg-accent-100 transition-colors dark:bg-brutal-dark-brown dark:hover:bg-accent-900"
                                  title="DELETE USER"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {users.length === 0 && (
                    <div className="py-8 text-center">
                      <div className="w-16 h-16 bg-brutal-gray border-3 border-brutal-black flex items-center justify-center mx-auto mb-4">
                        <Square size={24} className="text-white" fill="currentColor" />
                      </div>
                      <p className="text-brutal-black font-black font-mono uppercase dark:text-white">NO USERS FOUND.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
      
      {/* Videos tab */}
      {activeTab === 'videos' && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-brutal-black font-mono uppercase dark:text-white">MANAGE VIDEOS</h2>
            <div className="text-sm font-bold text-brutal-gray font-mono uppercase dark:text-gray-400">
              SHOWING {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalCount)} OF {totalCount} VIDEOS
            </div>
          </div>
          
          {loadingVideos ? (
            <div className="flex justify-center py-8">
              <div className="w-12 h-12 border-4 border-brutal-black bg-primary-600 animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="card-brutal overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-brutal-gray text-left border-b-3 border-brutal-black">
                        <th className="py-4 px-4 text-white font-black font-mono uppercase">VIDEO</th>
                        <th className="py-4 px-4 text-white font-black font-mono uppercase">UPLOADER</th>
                        <th className="py-4 px-4 text-white font-black font-mono uppercase">UPLOADED</th>
                        <th className="py-4 px-4 text-white font-black font-mono uppercase">VIEWS</th>
                        <th className="py-4 px-4 text-white font-black font-mono uppercase">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-brutal-dark-brown">
                      {videos.map((video, index) => (
                        <tr key={video.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-brutal-dark-brown' : 'bg-primary-50 dark:bg-primary-900'} border-b-2 border-brutal-black`}>
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <img
                                src={video.thumbnail_url || 'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg'}
                                alt={video.title}
                                className="w-20 h-11 object-cover border-2 border-brutal-black mr-3"
                              />
                              <div>
                                <p className="font-black text-brutal-black line-clamp-1 font-mono uppercase text-sm dark:text-white">{video.title}</p>
                                <p className="text-xs text-brutal-gray font-bold uppercase line-clamp-1 mt-1 dark:text-gray-400">
                                  {video.description || 'NO DESCRIPTION'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-brutal-black font-bold font-mono uppercase dark:text-white">{video.user?.username || 'UNKNOWN'}</td>
                          <td className="py-4 px-4 text-brutal-black font-bold dark:text-white">
                            {new Date(video.created_at).toLocaleDateString().toUpperCase()}
                          </td>
                          <td className="py-4 px-4 text-brutal-black font-bold dark:text-white">{video.views}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <a 
                                href={`/video/${video.id}`}
                                className="text-primary-600 hover:underline font-black font-mono uppercase dark:text-primary-400"
                                target="_blank"
                                rel="noreferrer"
                              >
                                VIEW
                              </a>
                              <button
                                onClick={() => {
                                  if (confirm(`ARE YOU SURE YOU WANT TO DELETE THE VIDEO "${video.title.toUpperCase()}"?`)) {
                                    deleteVideo(video.id);
                                  }
                                }}
                                className="p-2 text-accent-600 bg-white border-2 border-brutal-black hover:bg-accent-100 transition-colors dark:bg-brutal-dark-brown dark:hover:bg-accent-900"
                                title="DELETE VIDEO"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {videos.length === 0 && (
                  <div className="py-8 text-center">
                    <div className="w-16 h-16 bg-brutal-gray border-3 border-brutal-black flex items-center justify-center mx-auto mb-4">
                      <Square size={24} className="text-white" fill="currentColor" />
                    </div>
                    <p className="text-brutal-black font-black font-mono uppercase dark:text-white">NO VIDEOS FOUND.</p>
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="card-brutal p-6">
                  <div className="flex items-center justify-center gap-2">
                    {/* Previous button */}
                    <button
                      onClick={() => handleVideoPageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loadingVideos}
                      className={`flex items-center gap-2 px-3 py-2 border-2 border-brutal-black font-bold uppercase text-sm transition-colors ${
                        currentPage === 1 || loadingVideos
                          ? 'bg-brutal-gray/20 text-brutal-gray cursor-not-allowed'
                          : 'bg-white text-brutal-black hover:bg-primary-100 brutal-hover dark:bg-brutal-dark-brown dark:text-white dark:hover:bg-primary-900'
                      }`}
                    >
                      <ChevronLeft size={16} />
                      <span className="hidden sm:inline">PREV</span>
                    </button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                      {pageNumbers.map((page, index) => (
                        <React.Fragment key={index}>
                          {page === '...' ? (
                            <span className="px-3 py-2 text-brutal-gray font-bold dark:text-gray-400">...</span>
                          ) : (
                            <button
                              onClick={() => handleVideoPageChange(page as number)}
                              disabled={loadingVideos}
                              className={`px-3 py-2 border-2 border-brutal-black font-bold text-sm transition-colors ${
                                currentPage === page
                                  ? 'bg-primary-600 text-white'
                                  : loadingVideos
                                    ? 'bg-brutal-gray/20 text-brutal-gray cursor-not-allowed'
                                    : 'bg-white text-brutal-black hover:bg-primary-100 brutal-hover dark:bg-brutal-dark-brown dark:text-white dark:hover:bg-primary-900'
                              }`}
                            >
                              {page}
                            </button>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Next button */}
                    <button
                      onClick={() => handleVideoPageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loadingVideos}
                      className={`flex items-center gap-2 px-3 py-2 border-2 border-brutal-black font-bold uppercase text-sm transition-colors ${
                        currentPage === totalPages || loadingVideos
                          ? 'bg-brutal-gray/20 text-brutal-gray cursor-not-allowed'
                          : 'bg-white text-brutal-black hover:bg-primary-100 brutal-hover dark:bg-brutal-dark-brown dark:text-white dark:hover:bg-primary-900'
                      }`}
                    >
                      <span className="hidden sm:inline">NEXT</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Loading indicator */}
                  {loadingVideos && (
                    <div className="flex items-center justify-center mt-4 pt-4 border-t-2 border-brutal-black">
                      <div className="w-8 h-8 border-2 border-brutal-black bg-primary-600 animate-spin"></div>
                      <span className="ml-3 text-sm font-bold text-brutal-black font-mono uppercase dark:text-white">
                        LOADING...
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
      
      {/* Comments tab */}
      {activeTab === 'comments' && (
        <>
          <h2 className="text-xl font-black text-brutal-black mb-6 font-mono uppercase dark:text-white">MANAGE COMMENTS</h2>
          
          <div className="card-brutal p-8 text-center">
            <div className="w-16 h-16 bg-brutal-gray border-3 border-brutal-black flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={24} className="text-white" />
            </div>
            <p className="text-brutal-black font-black font-mono uppercase dark:text-white">
              COMMENTS MODERATION IS AVAILABLE ON INDIVIDUAL VIDEO PAGES.
            </p>
          </div>
        </>
      )}

      {/* User Deletion Modal */}
      <UserDeletionModal
        user={deletionModal.user}
        isOpen={deletionModal.isOpen}
        onClose={() => setDeletionModal({ isOpen: false, user: null, loading: false })}
        onConfirm={handleConfirmDeletion}
        loading={deletionModal.loading}
      />
    </div>
  );
};

export default AdminPage;