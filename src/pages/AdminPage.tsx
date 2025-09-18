import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Shield, ShieldOff, Users, Film, MessageSquare, Home } from 'lucide-react';
import { useAdminStore } from '../stores/adminStore';
import { useAuthStore } from '../stores/authStore';
import { useVideoStore } from '../stores/videoStore';

const AdminPage = () => {
  const { user } = useAuthStore();
  const { users, loading: loadingUsers, fetchUsers, deleteUser, toggleAdminStatus } = useAdminStore();
  const { videos, loading: loadingVideos, fetchVideos, deleteVideo } = useVideoStore();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'users' | 'videos' | 'comments'>('users');
  
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
      fetchVideos();
    }
  }, [user, fetchUsers, fetchVideos]);
  
  if (!user || !user.is_admin) {
    return null;
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <Home size={18} />
          <span>Back to Home</span>
        </button>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          className={`py-3 px-4 font-medium border-b-2 ${
            activeTab === 'users'
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
          onClick={() => setActiveTab('users')}
        >
          <div className="flex items-center gap-2">
            <Users size={18} />
            <span>Users</span>
          </div>
        </button>
        <button
          className={`py-3 px-4 font-medium border-b-2 ${
            activeTab === 'videos'
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
          onClick={() => setActiveTab('videos')}
        >
          <div className="flex items-center gap-2">
            <Film size={18} />
            <span>Videos</span>
          </div>
        </button>
        <button
          className={`py-3 px-4 font-medium border-b-2 ${
            activeTab === 'comments'
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
          onClick={() => setActiveTab('comments')}
        >
          <div className="flex items-center gap-2">
            <MessageSquare size={18} />
            <span>Comments</span>
          </div>
        </button>
      </div>
      
      {/* Users tab */}
      {activeTab === 'users' && (
        <>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Manage Users</h2>
          
          {loadingUsers ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700 text-left">
                      <th className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">User</th>
                      <th className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">Email</th>
                      <th className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">Created</th>
                      <th className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">Role</th>
                      <th className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.username}
                                className="w-8 h-8 rounded-full mr-3"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mr-3">
                                <span className="text-primary-700 dark:text-primary-300 font-semibold">
                                  {user.username.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <span className="font-medium text-gray-900 dark:text-white">{user.username}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{user.email}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.is_admin 
                              ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {user.is_admin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleAdminStatus(user.id, !user.is_admin)}
                              className={`p-1.5 rounded-md ${
                                user.is_admin
                                  ? 'text-primary-600 hover:text-primary-700 hover:bg-primary-100 dark:text-primary-400 dark:hover:text-primary-300 dark:hover:bg-primary-900/30'
                                  : 'text-gray-600 hover:text-primary-600 hover:bg-primary-100 dark:text-gray-400 dark:hover:text-primary-400 dark:hover:bg-primary-900/30'
                              }`}
                              title={user.is_admin ? 'Remove admin privileges' : 'Grant admin privileges'}
                            >
                              {user.is_admin ? <ShieldOff size={18} /> : <Shield size={18} />}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete the user "${user.username}"?`)) {
                                  deleteUser(user.id);
                                }
                              }}
                              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-100 dark:text-gray-400 dark:hover:text-red-500 dark:hover:bg-red-900/30 rounded-md"
                              title="Delete user"
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
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  No users found.
                </div>
              )}
            </div>
          )}
        </>
      )}
      
      {/* Videos tab */}
      {activeTab === 'videos' && (
        <>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Manage Videos</h2>
          
          {loadingVideos ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700 text-left">
                      <th className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">Video</th>
                      <th className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">Uploader</th>
                      <th className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">Uploaded</th>
                      <th className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">Views</th>
                      <th className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {videos.map(video => (
                      <tr key={video.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <img
                              src={video.thumbnail_url || 'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg'}
                              alt={video.title}
                              className="w-16 h-9 object-cover rounded mr-3"
                            />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{video.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                                {video.description || 'No description'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{video.user?.username || 'Unknown'}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          {new Date(video.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{video.views}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <a 
                              href={`/video/${video.id}`}
                              className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                              target="_blank"
                              rel="noreferrer"
                            >
                              View
                            </a>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete the video "${video.title}"?`)) {
                                  deleteVideo(video.id);
                                }
                              }}
                              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-100 dark:text-gray-400 dark:hover:text-red-500 dark:hover:bg-red-900/30 rounded-md"
                              title="Delete video"
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
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  No videos found.
                </div>
              )}
            </div>
          )}
        </>
      )}
      
      {/* Comments tab */}
      {activeTab === 'comments' && (
        <>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Manage Comments</h2>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Comments moderation is available on individual video pages.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPage;