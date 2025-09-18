import React from 'react';
import VideoCard from './VideoCard';
import { Video } from '../lib/supabase';

type VideoGridProps = {
  videos: Video[];
  emptyMessage?: string;
};

const VideoGrid: React.FC<VideoGridProps> = ({ 
  videos, 
  emptyMessage = 'No videos found' 
}) => {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
        <p className="text-lg">{emptyMessage}</p>
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