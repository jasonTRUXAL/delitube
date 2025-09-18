import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Video, Calendar, ArrowLeft, Square } from 'lucide-react';
import { supabase, User as UserType, Video as VideoType } from '../lib/supabase';
import VideoGrid from '../components/VideoGrid';
import Pagination from '../components/Pagination';

const UserProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<UserType | null>(null);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 12;

  useEffect(() => {
    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  useEffect(() => {
    if (user) {
      fetchUserVideos(1);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // User not found
          setUser(null);
        } else {
          throw error;
        }
      } else {
        setUser(data);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVideos = async (page: number) => {
    if (!user) return;
    
    try {
      setVideosLoading(true);
      
      // Get total count
      const { count, error: countError } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (countError) throw countError;
      
      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);
      
      // Get paginated videos
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          user:profiles(id, username, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      // Fetch hashtags for videos
      const videosWithHashtags = await Promise.all(
        (data || []).map(async (video) => {
          try {
            const { data: hashtagData, error: hashtagError } = await supabase
              .from('video_hashtags')
              .select(`
                hashtag:hashtags(*)
              `)
              .eq('video_id', video.id);
            
            if (hashtagError) {
              console.warn(`Failed to fetch hashtags for video ${video.id}:`, hashtagError);
              return { ...video, hashtags: [] };
            }
            
            const hashtags = (hashtagData || [])
              .map(item => item.hashtag)
              .filter(hashtag => hashtag && typeof hashtag === 'object' && hashtag.id);
            
            return { ...video, hashtags };
          } catch (error) {
            console.warn(`Error processing hashtags for video ${video.id}:`, error);
            return { ...video, hashtags: [] };
          }
        })
      );
      
      setVideos(videosWithHashtags);
      setTotalCount(totalCount);
      setTotalPages(totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch user videos:', error);
      setVideos([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setVideosLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchUserVideos(page);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-16 h-16 border-4 border-brutal-black bg-primary-600 animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card-brutal p-12 text-center">
          <div className="w-16 h-16 bg-brutal-gray border-3 border-brutal-black flex items-center justify-center mx-auto mb-6">
            <User size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-brutal-black mb-4 font-mono uppercase dark:text-white">
            USER NOT FOUND
          </h2>
          <p className="text-brutal-gray font-bold uppercase mb-6 dark:text-gray-400">
            THE USER "{username?.toUpperCase()}" DOESN'T EXIST OR HAS BEEN DELETED.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-brutal px-6 py-3"
          >
            <ArrowLeft size={18} className="inline mr-2" />
            BACK TO HOME
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="btn-brutal-secondary px-4 py-2"
        >
          <ArrowLeft size={16} className="inline mr-2" />
          BACK
        </button>
      </div>

      {/* User Profile Header */}
      <div className="card-brutal p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.username}
                className="w-32 h-32 border-3 border-brutal-black object-cover"
              />
            ) : (
              <div className="w-32 h-32 bg-primary-600 border-3 border-brutal-black flex items-center justify-center">
                <span className="text-white text-4xl font-black font-mono">
                  {user.username.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-grow">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-3xl font-black text-brutal-black font-mono uppercase dark:text-white">
                {user.username}
              </h1>
              {user.is_admin && (
                <div className="bg-primary-600 text-white px-3 py-1 border-2 border-brutal-black font-mono font-bold uppercase text-sm">
                  ADMIN
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
              <div className="card-brutal p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Video size={20} className="text-primary-600" />
                  <span className="text-2xl font-black text-brutal-black font-mono dark:text-white">
                    {totalCount}
                  </span>
                </div>
                <p className="text-sm font-bold text-brutal-gray uppercase dark:text-gray-400">
                  {totalCount === 1 ? 'VIDEO' : 'VIDEOS'}
                </p>
              </div>

              <div className="card-brutal p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calendar size={20} className="text-secondary-600" />
                  <span className="text-sm font-black text-brutal-black font-mono uppercase dark:text-white">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    }).toUpperCase()}
                  </span>
                </div>
                <p className="text-sm font-bold text-brutal-gray uppercase dark:text-gray-400">
                  JOINED
                </p>
              </div>

              <div className="card-brutal p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Square size={20} className="text-success-600" fill="currentColor" />
                  <span className="text-sm font-black text-brutal-black font-mono uppercase dark:text-white">
                    ACTIVE
                  </span>
                </div>
                <p className="text-sm font-bold text-brutal-gray uppercase dark:text-gray-400">
                  STATUS
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-brutal-black font-mono uppercase dark:text-white">
            {user.username}'S VIDEOS
          </h2>
          {totalCount > 0 && (
            <div className="text-sm font-bold text-brutal-gray font-mono uppercase dark:text-gray-400">
              {totalCount} {totalCount === 1 ? 'VIDEO' : 'VIDEOS'} TOTAL
            </div>
          )}
        </div>

        {videosLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-16 h-16 border-4 border-brutal-black bg-primary-600 animate-spin"></div>
          </div>
        ) : (
          <>
            <VideoGrid
              videos={videos}
              emptyMessage={`${user.username.toUpperCase()} HASN'T UPLOADED ANY VIDEOS YET.`}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                loading={videosLoading}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;