import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit, Square } from 'lucide-react';
import { useVideoStore } from '../stores/videoStore';
import { useAuthStore } from '../stores/authStore';
import VideoGrid from '../components/VideoGrid';
import Pagination from '../components/Pagination';

const MyVideosPage = () => {
  const { user } = useAuthStore();
  const { 
    videos, 
    loading, 
    fetchVideos, 
    deleteVideo,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    setCurrentPage
  } = useVideoStore();
  const navigate = useNavigate();
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  useEffect(() => {
    if (user) {
      fetchVideos(1);
    }
  }, [user, fetchVideos]);
  
  if (!user) return null;
  
  // Filter videos to only show the current user's videos
  const myVideos = videos.filter(video => video.user_id === user.id);
  const myVideosCount = myVideos.length;
  
  const handleDelete = async (videoId: string, videoTitle: string) => {
    if (confirm(`ARE YOU SURE YOU WANT TO DELETE "${videoTitle.toUpperCase()}"?`)) {
      await deleteVideo(videoId);
    }
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    await fetchVideos(page);
  };

  return (
    <div className="max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="card-brutal p-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-primary-400 border-3 border-brutal-black flex items-center justify-center dark:border-brutal-dark-brown">
              <Square size={24} className="text-brutal-black" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-brutal-black font-mono uppercase mb-2 dark:text-white">
                MY VIDEOS
              </h1>
              <p className="text-brutal-gray font-bold uppercase tracking-wide dark:text-gray-400">
                {myVideosCount} {myVideosCount === 1 ? 'VIDEO' : 'VIDEOS'} UPLOADED
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/upload')}
            className="btn-brutal px-6 py-3"
          >
            <Plus size={18} className="inline mr-2" />
            UPLOAD VIDEO
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-16 h-16 border-4 border-brutal-black bg-primary-400 animate-spin dark:border-brutal-dark-brown"></div>
        </div>
      ) : (
        <>
          {myVideos.length > 0 ? (
            <>
              {/* Custom video grid with edit/delete actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                {myVideos.map(video => (
                  <div key={video.id} className="relative group">
                    {/* Video card */}
                    <div className="card-brutal brutal-hover">
                      <div className="relative aspect-video overflow-hidden bg-brutal-black">
                        <img
                          src={video.thumbnail_url || 'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg'}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Hover overlay with actions */}
                        <div className="absolute inset-0 bg-brutal-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => navigate(`/video/${video.id}`)}
                              className="w-12 h-12 bg-primary-400 border-3 border-white flex items-center justify-center brutal-hover"
                              title="VIEW VIDEO"
                            >
                              <Square size={16} className="text-brutal-black" fill="currentColor" />
                            </button>
                            <button
                              onClick={() => navigate(`/video/${video.id}/edit`)}
                              className="w-12 h-12 bg-warning-500 border-3 border-white flex items-center justify-center brutal-hover"
                              title="EDIT VIDEO"
                            >
                              <Edit size={16} className="text-white" />
                            </button>
                            <button
                              onClick={() => handleDelete(video.id, video.title)}
                              className="w-12 h-12 bg-accent-600 border-3 border-white flex items-center justify-center brutal-hover"
                              title="DELETE VIDEO"
                            >
                              <Trash2 size={16} className="text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-white dark:bg-brutal-cream">
                        <h3 className="font-black text-brutal-black line-clamp-2 mb-3 text-lg leading-tight font-mono uppercase">
                          {video.title}
                        </h3>
                        
                        <div className="flex items-center justify-between text-sm text-brutal-black font-bold">
                          <div className="flex items-center bg-brutal-gray/20 border border-brutal-black px-2 py-1 font-mono dark:border-brutal-dark-brown">
                            <span className="text-xs">{video.views} VIEWS</span>
                          </div>
                          
                          <div className="flex items-center bg-brutal-gray/20 border border-brutal-black px-2 py-1 font-mono dark:border-brutal-dark-brown">
                            <span className="text-xs">{new Date(video.created_at).toLocaleDateString().toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination for all videos (not just user's videos) */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                loading={loading}
              />
            </>
          ) : (
            <div className="card-brutal p-12 text-center">
              <div className="w-16 h-16 bg-brutal-gray border-3 border-brutal-black flex items-center justify-center mx-auto mb-6 dark:border-brutal-dark-brown">
                <Square size={24} className="text-white" fill="currentColor" />
              </div>
              <h3 className="text-xl font-black text-brutal-black mb-4 font-mono uppercase dark:text-white">
                NO VIDEOS UPLOADED YET
              </h3>
              <p className="text-brutal-gray font-bold uppercase mb-6 dark:text-gray-400">
                GET STARTED BY UPLOADING YOUR FIRST VIDEO
              </p>
              <button
                onClick={() => navigate('/upload')}
                className="btn-brutal px-6 py-3"
              >
                <Plus size={18} className="inline mr-2" />
                UPLOAD VIDEO
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyVideosPage;