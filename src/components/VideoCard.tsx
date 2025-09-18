import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, ThumbsUp, Clock } from 'lucide-react';
import { Video } from '../lib/supabase';

type VideoCardProps = {
  video: Video;
  className?: string;
};

const VideoCard: React.FC<VideoCardProps> = ({ video, className = '' }) => {
  // Format date to relative time (e.g., "2 days ago")
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  return (
    <Link
      to={`/video/${video.id}`}
      className={`group block overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 ${className}`}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={video.thumbnail_url || 'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg'}
          alt={video.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <div className="flex items-center space-x-3 text-white text-sm">
            <div className="flex items-center">
              <Eye size={16} className="mr-1" />
              <span>{video.views}</span>
            </div>
            <div className="flex items-center">
              <ThumbsUp size={16} className="mr-1" />
              <span>{video.likes}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {video.title}
        </h3>
        
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-2">
          <div className="flex items-center">
            {video.user?.avatar_url ? (
              <img 
                src={video.user.avatar_url} 
                alt={video.user?.username} 
                className="w-6 h-6 rounded-full mr-2"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 mr-2" />
            )}
            <span>{video.user?.username || 'Unknown user'}</span>
          </div>
          
          <div className="flex items-center ml-auto">
            <Clock size={14} className="mr-1" />
            <span>{formatRelativeTime(video.created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;