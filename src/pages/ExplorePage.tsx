import React, { useEffect, useState } from 'react';
import { useVideoStore } from '../stores/videoStore';
import { useHashtagStore } from '../stores/hashtagStore';
import VideoGrid from '../components/VideoGrid';
import Pagination from '../components/Pagination';
import { Search, Square, Hash, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const ExplorePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    videos, 
    loading, 
    fetchVideos, 
    searchVideos, 
    searchQuery,
    isSearchMode,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    setCurrentPage,
    clearSearch
  } = useVideoStore();
  const { hashtags, fetchHashtags, getVideosByHashtag } = useHashtagStore();
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [showHashtagDropdown, setShowHashtagDropdown] = useState(false);
  
  useEffect(() => {
    fetchHashtags();
  }, [fetchHashtags]);
  
  useEffect(() => {
    // Clear search state when navigating to explore page (not search route)
    if (location.pathname === '/explore') {
      clearSearch();
      setLocalSearchQuery('');
      setSelectedHashtag(null);
      fetchVideos(1);
    } else if (location.pathname === '/search' && searchQuery) {
      // If we're on the search route and have a search query, perform the search
      setLocalSearchQuery(searchQuery);
      searchVideos(searchQuery, 1);
      setSelectedHashtag(null);
    }
  }, [location.pathname, searchQuery, clearSearch, fetchVideos, searchVideos]);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedHashtag(null);
    setCurrentPage(1);
    if (localSearchQuery.trim()) {
      await searchVideos(localSearchQuery, 1);
      // Navigate to search route to maintain search state
      navigate('/search');
    } else {
      clearSearch();
      setLocalSearchQuery('');
      await fetchVideos(1);
      // Navigate back to explore if we're clearing search
      if (location.pathname === '/search') {
        navigate('/explore');
      }
    }
  };
  
  const handleHashtagSelect = async (hashtagName: string) => {
    setSelectedHashtag(hashtagName);
    setLocalSearchQuery('');
    clearSearch();
    setShowHashtagDropdown(false);
    setCurrentPage(1);
    await getVideosByHashtag(hashtagName, 1);
  };
  
  const clearHashtagFilter = async () => {
    setSelectedHashtag(null);
    setCurrentPage(1);
    clearSearch();
    setLocalSearchQuery('');
    await fetchVideos(1);
    // Navigate back to explore when clearing filters
    if (location.pathname === '/search') {
      navigate('/explore');
    }
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    
    if (selectedHashtag) {
      await getVideosByHashtag(selectedHashtag, page);
    } else if (isSearchMode && localSearchQuery.trim()) {
      await searchVideos(localSearchQuery, page);
    } else {
      await fetchVideos(page);
    }
  };
  
  // Get popular hashtags (top 10 by usage)
  const popularHashtags = hashtags.slice(0, 10);
  
  return (
    <div>
      {/* Header Section */}
      <div className="card-brutal p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-600 border-3 border-brutal-black flex items-center justify-center">
            <Search size={16} className="sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-brutal-black font-mono uppercase mb-2 dark:text-white">
              {location.pathname === '/search' ? 'SEARCH RESULTS' : 'EXPLORE VIDEOS'}
            </h1>
            <p className="text-brutal-gray font-bold uppercase tracking-wide text-sm sm:text-base dark:text-gray-400">
              {selectedHashtag 
                ? `VIDEOS TAGGED WITH #${selectedHashtag.toUpperCase()}`
                : location.pathname === '/search' 
                  ? 'FIND WHAT YOU\'RE LOOKING FOR' 
                  : 'DISCOVER THE GREATEST OF DOODLETOWN'
              }
            </p>
          </div>
        </div>
        
        {/* Search bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mb-4 sm:mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-grow relative">
              <input
                type="text"
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                placeholder="Search for videos..."
                className="input-brutal w-full px-3 py-3 sm:px-4 sm:py-4 pr-12 sm:pr-16 font-mono placeholder:text-brutal-gray text-sm sm:text-base lg:text-lg"
              />
              <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
                <Search size={16} className="sm:w-5 sm:h-5 text-brutal-gray" />
              </div>
            </div>
            <button
              type="submit"
              className="btn-brutal px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base lg:text-lg"
            >
              <Square size={16} className="inline mr-2" />
              SEARCH
            </button>
          </div>
        </form>
        
        {/* Clear search button when in search mode */}
        {(isSearchMode || selectedHashtag) && (
          <div className="mb-4">
            <button
              onClick={clearHashtagFilter}
              className="btn-brutal-secondary px-3 py-2 sm:px-4 text-xs sm:text-sm"
            >
              <X size={12} className="sm:w-3.5 sm:h-3.5 inline mr-1" />
              CLEAR ALL FILTERS
            </button>
          </div>
        )}
        
        {/* Hashtag Filter Section */}
        <div className="border-t-3 border-brutal-black pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <h3 className="text-base sm:text-lg font-black text-brutal-black font-mono uppercase dark:text-white">
              FILTER BY HASHTAG
            </h3>
            {selectedHashtag && (
              <button
                onClick={clearHashtagFilter}
                className="btn-brutal-secondary px-3 py-2 sm:px-4 text-xs sm:text-sm"
              >
                <X size={12} className="sm:w-3.5 sm:h-3.5 inline mr-1" />
                CLEAR FILTER
              </button>
            )}
          </div>
          
          {/* Selected hashtag display */}
          {selectedHashtag && (
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 bg-primary-600 text-white px-3 py-2 sm:px-4 border-3 border-brutal-black font-mono font-bold uppercase text-sm">
                <Hash size={12} className="sm:w-3.5 sm:h-3.5" />
                <span>{selectedHashtag}</span>
                <button
                  onClick={clearHashtagFilter}
                  className="hover:bg-white hover:text-primary-600 transition-colors p-0.5 sm:p-1 border border-transparent hover:border-brutal-black"
                >
                  <X size={10} className="sm:w-3 sm:h-3" />
                </button>
              </div>
            </div>
          )}
          
          {/* Popular hashtags */}
          {!selectedHashtag && popularHashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {popularHashtags.map((hashtag) => (
                <button
                  key={hashtag.id}
                  onClick={() => handleHashtagSelect(hashtag.name)}
                  className="flex items-center gap-1 bg-white text-brutal-black px-2 py-1 sm:px-3 sm:py-2 border-2 border-brutal-black hover:bg-secondary-100 transition-colors font-mono font-bold uppercase text-xs sm:text-sm brutal-hover dark:bg-brutal-dark-brown dark:text-white dark:hover:bg-secondary-900"
                >
                  <Hash size={10} className="sm:w-3 sm:h-3" />
                  <span>{hashtag.name}</span>
                </button>
              ))}
              
              {hashtags.length > 10 && (
                <div className="relative">
                  <button
                    onClick={() => setShowHashtagDropdown(!showHashtagDropdown)}
                    className="flex items-center gap-1 bg-brutal-gray text-white px-2 py-1 sm:px-3 sm:py-2 border-2 border-brutal-black hover:bg-brutal-black transition-colors font-mono font-bold uppercase text-xs sm:text-sm"
                  >
                    <span>+{hashtags.length - 10} MORE</span>
                  </button>
                  
                  {showHashtagDropdown && (
                    <div className="absolute top-full left-0 z-10 mt-1 card-brutal max-h-48 overflow-y-auto min-w-40 sm:min-w-48">
                      {hashtags.slice(10).map((hashtag) => (
                        <button
                          key={hashtag.id}
                          onClick={() => handleHashtagSelect(hashtag.name)}
                          className="w-full text-left px-3 py-2 sm:px-4 hover:bg-primary-100 transition-colors border-b border-brutal-black last:border-b-0 font-mono font-bold uppercase text-xs sm:text-sm dark:hover:bg-primary-900"
                        >
                          <Hash size={10} className="sm:w-3 sm:h-3 inline mr-2" />
                          {hashtag.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-brutal-black bg-primary-600 animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Results info */}
          {(isSearchMode && localSearchQuery) || selectedHashtag ? (
            <div className="card-brutal p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary-600 border-3 border-brutal-black flex items-center justify-center">
                  <Square size={12} className="sm:w-4 sm:h-4 text-white" fill="currentColor" />
                </div>
                <div>
                  <p className="text-sm sm:text-base lg:text-lg font-black text-brutal-black font-mono uppercase dark:text-white">
                    {totalCount === 0 ? 'NO RESULTS' : `${totalCount} RESULTS`}
                    {selectedHashtag && ` FOR #${selectedHashtag.toUpperCase()}`}
                    {isSearchMode && localSearchQuery && ` FOR "${localSearchQuery.toUpperCase()}"`}
                  </p>
                  <p className="text-brutal-gray font-bold uppercase text-xs sm:text-sm dark:text-gray-400">
                    {totalCount === 0 
                      ? selectedHashtag 
                        ? 'NO VIDEOS WITH THIS HASHTAG YET'
                        : 'TRY DIFFERENT KEYWORDS' 
                      : selectedHashtag
                        ? 'MATCHING THIS HASHTAG'
                        : 'MATCHING YOUR SEARCH'
                    }
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          
          <VideoGrid
            videos={videos}
            emptyMessage={
              selectedHashtag
                ? `NO VIDEOS FOUND WITH HASHTAG #${selectedHashtag.toUpperCase()}`
                : isSearchMode && localSearchQuery
                  ? `NO VIDEOS FOUND MATCHING "${localSearchQuery.toUpperCase()}"`
                  : "NO VIDEOS HAVE BEEN UPLOADED YET."
            }
          />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </>
      )}
    </div>
  );
};

export default ExplorePage;