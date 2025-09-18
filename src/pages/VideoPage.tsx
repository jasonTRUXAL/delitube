import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ThumbsUp, Eye, Flag, Share2 } from 'lucide-react';
import { useVideoStore } from '../stores/videoStore';
import { useAuthStore } from '../stores/authStore';
import VideoPlayer from '../components/VideoPlayer';
import CommentSection from '../components/CommentSection';
import VideoGrid from '../components/VideoGrid';

const VideoPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { 
    currentVideo, 
    loading, 
    fetchVideoById, 
    incrementViews, 
    likeVideo, 
    recentVideos,
    fetchRecentVideos
  } = useVideoStore();

  useEffect(() => {
    if (id) {
      fetchVideoById(id);
      fetchRecentVideos(4);
    }
  }, [id, fetchVideoById, fetchRecentVideos]);

  const handleVideoPlay = () => {
    if (id) {
      incrementViews(id);
    }
  };

  const handleLike = () => {
    if (!user) {
      alert('You need to be logged in to like videos');
      return;
    }

    if (id) {
      likeVideo(id);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentVideo?.title || 'Check out this video',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Video Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400">The video you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  // Filter out current video from related videos
  const relatedVideos = recentVideos.filter(v => v.id !== currentVideo.id);

  return (
    <div className="max-w-screen-xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Video player */}
          <VideoPlayer 
            src={currentVideo.url} 
            poster={currentVideo.thumbnail_url} 
            onPlay={handleVideoPlay}
          />

          {/* Video details */}
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {currentVideo.title}
            </h1>
            
            <div className="flex items-center justify-between flex-wrap gap-4 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                {/* User avatar and info */}
                <div className="flex items-center">
                  {currentVideo.user?.avatar_url ? (
                    <img
                      src={currentVideo.user.avatar_url}
                      alt={currentVideo.user?.username}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center mr-3">
                      <span className="text-primary-700 dark:text-primary-300 font-semibold">
                        {currentVideo.user?.username.substring(0, 2).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {currentVideo.user?.username || 'Unknown user'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(currentVideo.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2 px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <ThumbsUp size={18} />
                  <span>{currentVideo.likes}</span>
                </button>
                
                <div className="flex items-center gap-2 px-3 py-1.5 text-gray-700 dark:text-gray-300">
                  <Eye size={18} />
                  <span>{currentVideo.views}</span>
                </div>
                
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Share2 size={18} />
                  <span>Share</span>
                </button>
                
                <button className="flex items-center gap-2 px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:text-red-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Flag size={18} />
                  <span>Report</span>
                </button>
              </div>
            </div>
            
            {/* Video description */}
            <div className="py-4 border-b border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {currentVideo.description}
              </p>
            </div>
            
            {/* Comments section */}
            {id && <CommentSection videoId={id} />}
          </div>
        </div>
        
        {/* Related videos sidebar */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Related Videos
          </h3>
          
          <div className="space-y-4">
            {relatedVideos.length > 0 ? (
              relatedVideos.map(video => (
                <div key={video.id} className="flex gap-3">
                  <a href={`/video/${video.id}`} className="block w-40 flex-shrink-0">
                    <div className="aspect-video rounded-md overflow-hidden">
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </a>
                  <div>
                    <a 
                      href={`/video/${video.id}`} 
                      className="font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 line-clamp-2 transition-colors"
                    >
                      {video.title}
                    </a>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {video.user?.username || 'Unknown user'}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1 space-x-2">
                      <span>{video.views} views</span>
                      <span>•</span>
                      <span>{new Date(video.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No related videos found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;