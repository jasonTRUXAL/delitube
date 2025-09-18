import React from 'react';
import VideoCard from './VideoCard';
import { Video } from '../lib/supabase';
import { Square } from 'lucide-react';

type VideoGridProps = {
  videos: Video[];
  emptyMessage?: string;
};

const VideoGrid: React.FC<VideoGridProps> = ({ 
  videos, 
  emptyMessage = 'NO VIDEOS FOUND' 
}) => {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12 lg:py-16 card-brutal p-6 sm:p-8 lg:p-12">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brutal-gray border-3 border-brutal-black flex items-center justify-center mb-4">
          <Square size={16} className="sm:w-6 sm:h-6 text-white" fill="currentColor" />
        </div>
        <p className="text-sm sm:text-base lg:text-lg font-black text-brutal-black font-mono uppercase text-center">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {videos.map(video => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
};

export default VideoGrid;