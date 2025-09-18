import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useVideoStore } from '../stores/videoStore';
import { useAuthStore } from '../stores/authStore';
import VideoGrid from '../components/VideoGrid';

const MyVideosPage = () => {
  const { user } = useAuthStore();
  const { videos, loading, fetchVideos, deleteVideo } = useVideoStore();
  const navigate = useNavigate();
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  useEffect(() => {
    if (user) {
      fetchVideos();
    }
  }, [user, fetchVideos]);
  
  if (!user) return null;
  
  // Filter videos to only show the current user's videos
  const myVideos = videos.filter(video => video.user_id === user.id);
  
  const handleDelete = async (videoId: string, videoTitle: string) => {
    if (confirm(`Are you sure you want to delete "${videoTitle}"?`)) {
      await deleteVideo(videoId);
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Videos</h1>
        <button
          onClick={() => navigate('/upload')}
          className="flex items-center gap-2 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus size={18} />
          <span>Upload Video</span>
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {myVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myVideos.map(video => (
                <div key={video.id} className="relative group">
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <a
                        href={`/video/${video.id}`}
                        className="w-10 h-10 flex items-center justify-center bg-white text-primary-600 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Edit size={18} />
                      </a>
                      <button
                        onClick={() => handleDelete(video.id, video.title)}
                        className="w-10 h-10 flex items-center justify-center bg-white text-red-600 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <a
                    href={`/video/${video.id}`}
                    className="block overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-md"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={video.thumbnail_url || 'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg'}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
                        {video.title}
                      </h3>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                        <div className="flex items-center">
                          <Eye size={16} className="mr-1" />
                          <span>{video.views} views</span>
                        </div>
                        <div>
                          {new Date(video.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                You haven't uploaded any videos yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Get started by uploading your first video
              </p>
              <button
                onClick={() => navigate('/upload')}
                className="inline-flex items-center gap-2 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
              >
                <Plus size={18} />
                <span>Upload Video</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyVideosPage;