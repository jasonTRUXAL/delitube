import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, ThumbsUp, Clock, Square, Hash } from 'lucide-react';
import { Video } from '../lib/supabase';
import { formatRelativeTime } from '../utils/formatters';

type VideoCardProps = {
  video: Video;
  className?: string;
};

const VideoCard: React.FC<VideoCardProps> = ({ video, className = '' }) => {
  return (
    <Link
      to={`/video/${video.id}`}
      className={`group block card-brutal brutal-hover ${className}`}
    >
      <div className="relative aspect-video overflow-hidden bg-brutal-black">
        <img
          src={video.thumbnail_url || 'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg'}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-brutal-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-4">
          <div className="flex items-center space-x-4 text-white text-sm font-mono font-bold uppercase">
            <div className="flex items-center bg-primary-600 border-2 border-white px-2 py-1">
              <Eye size={12} className="mr-1" />
              <span>{video.views}</span>
            </div>
            <div className="flex items-center bg-secondary-600 border-2 border-white px-2 py-1">
              <ThumbsUp size={12} className="mr-1" />
              <span>{video.likes}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Fixed height content container with consistent spacing */}
      <div className="p-4 bg-white dark:bg-brutal-dark-brown flex flex-col h-40">
        {/* Title - Fixed height container */}
        <div className="h-14 mb-3 flex items-start">
          <h3 className="font-black text-brutal-black line-clamp-2 group-hover:text-primary-600 transition-colors text-lg leading-tight font-mono uppercase dark:text-white">
            {video.title}
          </h3>
        </div>
        
        {/* Hashtags - Fixed height container */}
        <div className="h-8 mb-3 flex items-start">
          {video.hashtags && video.hashtags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {video.hashtags.slice(0, 2).map((hashtag) => (
                <div
                  key={hashtag.id}
                  className="flex items-center gap-1 bg-secondary-100 text-secondary-800 px-2 py-1 border border-brutal-black font-mono font-bold uppercase text-xs"
                >
                  <Hash size={8} />
                  <span className="truncate max-w-16">{hashtag.name}</span>
                </div>
              ))}
              {video.hashtags.length > 2 && (
                <div className="flex items-center gap-1 bg-brutal-gray/20 text-brutal-gray px-2 py-1 border border-brutal-black font-mono font-bold uppercase text-xs">
                  <span>+{video.hashtags.length - 2}</span>
                </div>
              )}
            </div>
          ) : (
            <div></div> // Empty div to maintain spacing
          )}
        </div>
        
        {/* Bottom section - User and time info */}
        <div className="flex-grow flex flex-col justify-end">
          <div className="flex items-center justify-between text-sm text-brutal-black font-bold dark:text-white">
            {/* User info - Fixed width container */}
            <div className="flex items-center min-w-0 flex-1 mr-2">
              {video.user?.avatar_url ? (
                <img 
                  src={video.user.avatar_url} 
                  alt={video.user?.username} 
                  className="w-6 h-6 border-2 border-brutal-black mr-2 flex-shrink-0"
                />
              ) : (
                <div className="w-6 h-6 bg-primary-600 border-2 border-brutal-black mr-2 flex items-center justify-center flex-shrink-0">
                  <Square size={10} className="text-white" fill="currentColor" />
                </div>
              )}
              <Link
                to={`/user/${video.user?.username}`}
                className="font-mono uppercase hover:text-primary-600 transition-colors truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {video.user?.username || 'UNKNOWN'}
              </Link>
            </div>
            
            {/* Time info - Fixed width */}
            <div className="flex items-center bg-brutal-gray/20 border border-brutal-black px-2 py-1 font-mono flex-shrink-0">
              <Clock size={10} className="mr-1" />
              <span className="text-xs whitespace-nowrap">{formatRelativeTime(video.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;