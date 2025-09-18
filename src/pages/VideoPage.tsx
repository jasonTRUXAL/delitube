import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ThumbsUp, Eye, Flag, Share2, Square, Hash } from 'lucide-react';
import { useVideoStore } from '../stores/videoStore';
import { useAuthStore } from '../stores/authStore';
import VideoPlayer from '../components/VideoPlayer';
import CommentSection from '../components/CommentSection';

const VideoPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { 
    currentVideo, 
    loading, 
    fetchVideoById, 
    incrementViews, 
    likeVideo,
    hasLikedVideo,
    fetchRelatedVideos
  } = useVideoStore();
  
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchVideoById(id);
    }
  }, [id, fetchVideoById]);
  
  useEffect(() => {
    if (id) {
      fetchRelatedVideos(id, 4).then(setRelatedVideos);
    }
  }, [id, fetchRelatedVideos]);

  const handleVideoPlay = () => {
    if (id) {
      incrementViews(id);
    }
  };

  const handleLike = () => {
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
      alert('LINK COPIED TO CLIPBOARD');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-16 h-16 border-4 border-brutal-black bg-primary-600 animate-spin"></div>
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <div className="text-center py-20 card-brutal p-12">
        <div className="w-16 h-16 bg-brutal-gray border-3 border-brutal-black flex items-center justify-center mx-auto mb-4">
          <Square size={24} className="text-white" fill="currentColor" />
        </div>
        <h2 className="text-2xl font-black text-brutal-black mb-4 font-mono uppercase dark:text-white">VIDEO NOT FOUND</h2>
        <p className="text-brutal-gray font-bold uppercase dark:text-gray-400">THE VIDEO YOU'RE LOOKING FOR DOESN'T EXIST OR HAS BEEN REMOVED.</p>
      </div>
    );
  }

  const isLiked = id ? hasLikedVideo(id) : false;

  return (
    <div className="max-w-screen-xl mx-auto">
      {/* Main content */}
      <div className="max-w-4xl mx-auto">
        {/* Video player container with fixed aspect ratio */}
        <div className="relative bg-brutal-black border-4 border-brutal-black overflow-hidden">
          <div className="aspect-video">
            <VideoPlayer 
              src={currentVideo.url} 
              poster={currentVideo.thumbnail_url} 
              onPlay={handleVideoPlay}
            />
          </div>
        </div>

        {/* Video details */}
        <div className="mt-6">
          <h1 className="text-2xl font-black text-brutal-black dark:text-white mb-4 font-mono uppercase">
            {currentVideo.title}
          </h1>
          
          {/* Hashtags */}
          {currentVideo.hashtags && currentVideo.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {currentVideo.hashtags.map((hashtag) => (
                <div
                  key={hashtag.id}
                  className="flex items-center gap-1 bg-secondary-600 text-white px-3 py-1 border-2 border-brutal-black font-mono font-bold uppercase text-sm"
                >
                  <Hash size={12} />
                  <span>{hashtag.name}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="card-brutal p-6 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                {/* User avatar and info */}
                <div className="flex items-center">
                  {currentVideo.user?.avatar_url ? (
                    <img
                      src={currentVideo.user.avatar_url}
                      alt={currentVideo.user?.username}
                      className="w-12 h-12 border-3 border-brutal-black mr-4"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary-600 border-3 border-brutal-black flex items-center justify-center mr-4">
                      <Square size={16} className="text-white" fill="currentColor" />
                    </div>
                  )}
                  <div>
                    <Link
                      to={`/user/${currentVideo.user?.username}`}
                      className="font-black text-brutal-black dark:text-white font-mono uppercase hover:text-primary-600 transition-colors"
                    >
                      {currentVideo.user?.username || 'UNKNOWN USER'}
                    </Link>
                    <p className="text-sm text-brutal-gray font-bold uppercase dark:text-gray-400">
                      {new Date(currentVideo.created_at).toLocaleDateString().toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap gap-2">
                <button
                  onClick={handleLike}
                  disabled={isLiked}
                  className={`flex items-center gap-1 sm:gap-2 px-2 py-2 sm:px-4 border-3 border-brutal-black font-bold uppercase transition-colors text-xs sm:text-sm ${
                    isLiked
                      ? 'text-primary-600 bg-primary-100'
                      : 'text-brutal-black bg-white hover:bg-primary-100 dark:bg-brutal-dark-brown dark:text-white dark:hover:bg-primary-900'
                  }`}
                >
                  <ThumbsUp size={14} className={`sm:w-[18px] sm:h-[18px] ${isLiked ? 'fill-current' : ''}`} />
                  <span>{currentVideo.likes}</span>
                </button>
                
                <div className="flex items-center gap-1 sm:gap-2 px-2 py-2 sm:px-4 border-3 border-brutal-black bg-white text-brutal-black font-bold uppercase text-xs sm:text-sm dark:bg-brutal-dark-brown dark:text-white">
                  <Eye size={14} className="sm:w-[18px] sm:h-[18px]" />
                  <span>{currentVideo.views}</span>
                </div>
                
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1 sm:gap-2 px-2 py-2 sm:px-4 border-3 border-brutal-black bg-white text-brutal-black hover:bg-secondary-100 transition-colors font-bold uppercase text-xs sm:text-sm dark:bg-brutal-dark-brown dark:text-white dark:hover:bg-secondary-900"
                >
                  <Share2 size={14} className="sm:w-[18px] sm:h-[18px]" />
                  <span>SHARE</span>
                </button>
                
                <button className="flex items-center gap-1 sm:gap-2 px-2 py-2 sm:px-4 border-3 border-brutal-black bg-white text-brutal-black hover:bg-accent-100 transition-colors font-bold uppercase text-xs sm:text-sm dark:bg-brutal-dark-brown dark:text-white dark:hover:bg-accent-900">
                  <Flag size={14} className="sm:w-[18px] sm:h-[18px]" />
                  <span>REPORT</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Video description */}
          {currentVideo.description && (
            <div className="card-brutal p-6 mb-6">
              <h4 className="font-black text-brutal-black dark:text-white mb-3 font-mono uppercase">DESCRIPTION</h4>
              <p className="text-brutal-black dark:text-white whitespace-pre-line font-bold">
                {currentVideo.description}
              </p>
            </div>
          )}
          
          {/* Comments section */}
          {id && <CommentSection videoId={id} />}
        </div>

        {/* Related videos section */}
        <div className="mt-12">
          <h3 className="text-xl font-black text-brutal-black dark:text-white mb-6 font-mono uppercase">
            RELATED VIDEOS
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedVideos.length > 0 ? (
              relatedVideos.map(video => (
                <a 
                  key={video.id} 
                  href={`/video/${video.id}`}
                  className="card-brutal p-4 brutal-hover"
                >
                  <div className="flex gap-4">
                    <div className="w-32 flex-shrink-0">
                      <div className="aspect-video border-2 border-brutal-black overflow-hidden">
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-black text-brutal-black dark:text-white line-clamp-2 transition-colors font-mono uppercase text-sm">
                        {video.title}
                      </h4>
                      <Link
                        to={`/user/${video.user?.username}`}
                        className="text-sm text-brutal-gray mt-1 font-bold uppercase hover:text-primary-600 transition-colors dark:text-gray-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {video.user?.username || 'UNKNOWN USER'}
                      </Link>
                      <div className="flex items-center text-xs text-brutal-gray mt-1 space-x-2 font-bold uppercase dark:text-gray-400">
                        <span>{video.views} VIEWS</span>
                        <span>•</span>
                        <span>{new Date(video.created_at).toLocaleDateString().toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <div className="card-brutal p-8 text-center col-span-2">
                <div className="w-16 h-16 bg-brutal-gray border-3 border-brutal-black flex items-center justify-center mx-auto mb-4">
                  <Square size={24} className="text-white" fill="currentColor" />
                </div>
                <p className="text-brutal-black font-black font-mono uppercase dark:text-white">
                  NO RELATED VIDEOS FOUND.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;