import React, { useEffect, useState } from 'react';
import { useVideoStore } from '../stores/videoStore';
import VideoGrid from '../components/VideoGrid';
import { Search } from 'lucide-react';

const ExplorePage = () => {
  const { videos, loading, fetchVideos, searchVideos } = useVideoStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchVideos(searchQuery);
    } else {
      fetchVideos();
    }
  };
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Explore Videos</h1>
        
        {/* Search bar */}
        <form onSubmit={handleSearch} className="max-w-2xl">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for videos..."
              className="w-full pl-4 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <Search size={20} />
            </button>
          </div>
        </form>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {searchQuery && (
            <div className="mb-6">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                {videos.length === 0 ? 'No results' : `${videos.length} results`} for "{searchQuery}"
              </p>
            </div>
          )}
          
          <VideoGrid
            videos={videos}
            emptyMessage={
              searchQuery
                ? `No videos found matching "${searchQuery}"`
                : "No videos have been uploaded yet."
            }
          />
        </>
      )}
    </div>
  );
};

export default ExplorePage;