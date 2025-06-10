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
      <div className="flex flex-col items-center justify-center py-16 card-brutal p-12">
        <div className="w-16 h-16 bg-brutal-gray border-3 border-brutal-black flex items-center justify-center mb-4">
          <Square size={24} className="text-white" fill="currentColor" />
        </div>
        <p className="text-lg font-black text-brutal-black font-mono uppercase">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {videos.map(video => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
};

export default VideoGrid;